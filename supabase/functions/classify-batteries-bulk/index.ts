// Bulk-classify pending battery photos using Google Gemini API directly.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `Você é um especialista em identificação de baterias estacionárias de telecom. Analise a foto e classifique em UMA de quatro opções:
- "CHUMBO" — baterias chumbo-ácido (VRLA/AGM/GEL), caixas plásticas retangulares grandes (pretas, cinzas ou azuis) com terminais parafusados no topo (Moura, GetPower, Freedom chumbo, Heliar, Unipower, CSB, Yuasa). Pesadas e volumosas.
- "LÍTIO" — baterias íon-lítio (LiFePO4/LFP, NMC) em módulos metálicos/plásticos padronizados com display/LED/BMS visível (Huawei ESM, Shoto, Narada Li, Pylontech, ZTE).
- "POLÍMERO" — polímero de lítio (LiPo), pouches/sacolas planas seladas (incomum em telecom).
- "INDETERMINADO" — use OBRIGATORIAMENTE quando NÃO houver nenhuma bateria visível na foto (gabinete vazio, só cabos/disjuntores/retificadores, foto de outro equipamento, foto ruim/escura ou fora de foco). NÃO chute um tipo se não conseguir ver a bateria.
Retorne APENAS JSON: {"tipo":"CHUMBO"|"LÍTIO"|"POLÍMERO"|"INDETERMINADO","confianca":0-1,"justificativa":"breve"}.`;

function extractPath(url: string): { bucket: string; path: string } | null {
  const m = url.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/([^?]+)/);
  if (!m) return null;
  return { bucket: m[1], path: decodeURIComponent(m[2]) };
}

async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const mimeType = resp.headers.get("content-type")?.split(";")[0] || "image/jpeg";
    const buf = new Uint8Array(await resp.arrayBuffer());
    let bin = "";
    for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
    return { data: btoa(bin), mimeType };
  } catch {
    return null;
  }
}

async function classifyImage(imgUrl: string, apiKey: string): Promise<{ tipo: string; confianca: number | null } | null> {
  const img = await fetchImageAsBase64(imgUrl);
  if (!img) return null;

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const resp = await fetch(geminiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{
        role: "user",
        parts: [
          { text: "Classifique a bateria mostrada. Se não houver bateria visível, retorne INDETERMINADO." },
          { inlineData: { mimeType: img.mimeType, data: img.data } },
        ],
      }],
      generationConfig: { responseMimeType: "application/json" },
    }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    console.error("Gemini error", resp.status, err.slice(0, 200));
    return null;
  }
  const data = await resp.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  let parsed: any = {};
  try { parsed = JSON.parse(content); } catch { /* ignore */ }
  let tipo = String(parsed.tipo || "").toUpperCase()
    .replace("LITIO", "LÍTIO")
    .replace("POLIMERO", "POLÍMERO");
  if (tipo !== "LÍTIO" && tipo !== "POLÍMERO" && tipo !== "CHUMBO" && tipo !== "INDETERMINADO") tipo = "INDETERMINADO";
  return { tipo, confianca: parsed.confianca ?? null };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    const body = await req.json().catch(() => ({}));
    const limit: number = Math.min(Number(body.limit ?? 40), 400);
    const offsetReports: number = Number(body.offset ?? 0);
    const pageSize: number = Math.min(Number(body.pageSize ?? 60), 500);
    const force: boolean = body.force === true;

    const photoCols = [1,2,3,4,5,6,7].flatMap(i => [`gab${i}_bat_foto`, ...[1,2,3,4,5,6,7,8,9,10,11,12].map(j=>`gab${i}_bat${j}_tipo`)]);
    const { data: reports, error } = await supabase
      .from("reports")
      .select(["id", "baterias_tipo_ia", ...photoCols].join(","))
      .order("created_at", { ascending: false })
      .range(offsetReports, offsetReports + pageSize - 1);
    if (error) throw error;

    let processed = 0, updated = 0, skipped = 0, failed = 0;
    const details: any[] = [];

    for (const r of (reports ?? []) as any[]) {
      if (processed >= limit) break;
      const existing = (r.baterias_tipo_ia && typeof r.baterias_tipo_ia === "object") ? { ...r.baterias_tipo_ia } : {};
      let changed = false;

      for (let i = 1; i <= 7; i++) {
        if (processed >= limit) break;
        const url: string | null = r[`gab${i}_bat_foto`];
        if (!url) continue;
        const pendingBanks: number[] = [];
        for (let j = 1; j <= 12; j++) {
          if (r[`gab${i}_bat${j}_tipo`] == null) continue;
          const key = `gab${i - 1}_banco${j - 1}`;
          if (!force && existing[key]) continue;
          pendingBanks.push(j);
        }
        if (pendingBanks.length === 0) continue;

        let signedUrl = url;
        const info = extractPath(url);
        if (info) {
          const { data: signed, error: sErr } = await supabase.storage.from(info.bucket).createSignedUrl(info.path, 60 * 60);
          if (sErr || !signed?.signedUrl) { failed++; details.push({ id: r.id, gab: i, err: sErr?.message }); continue; }
          signedUrl = signed.signedUrl;
        }

        processed++;
        const result = await classifyImage(signedUrl, GEMINI_API_KEY);
        if (!result) { failed++; continue; }
        for (const j of pendingBanks) {
          existing[`gab${i - 1}_banco${j - 1}`] = { tipo: result.tipo, confianca: result.confianca };
        }
        changed = true;
      }

      if (changed) {
        const { error: upErr } = await supabase.from("reports").update({ baterias_tipo_ia: existing }).eq("id", r.id);
        if (upErr) { failed++; details.push({ id: r.id, upErr: upErr.message }); }
        else updated++;
      } else {
        skipped++;
      }
    }

    const hitLimit = processed >= limit;
    const advanced = hitLimit ? 0 : (reports?.length ?? 0);
    const done = (reports?.length ?? 0) < pageSize && !hitLimit;
    return new Response(JSON.stringify({ processed, updated, skipped, failed, hitLimit, done, details: details.slice(0, 10), nextOffset: offsetReports + advanced }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
