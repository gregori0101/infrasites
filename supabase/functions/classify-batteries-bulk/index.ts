// Bulk-classify pending battery photos using Google Gemini API directly
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `Você é um especialista em identificação de baterias estacionárias de telecom. Analise a foto e classifique em UMA de quatro opções:
- "CHUMBO" — baterias chumbo-ácido (VRLA/AGM/GEL), caixas plásticas retangulares grandes com terminais parafusados no topo (Moura, GetPower, Freedom chumbo, Heliar, Unipower, CSB, Yuasa).
- "LÍTIO" — baterias íon-lítio (LiFePO4/LFP, NMC) em módulos metálicos/plásticos padronizados com display/LED/BMS visível (Huawei ESM, Shoto, Narada Li, Pylontech, ZTE).
- "POLÍMERO" — polímero de lítio (LiPo), pouches/sacolas planas seladas.
- "INDETERMINADO" — use OBRIGATORIAMENTE quando NÃO houver bateria visível na foto (gabinete vazio, só cabos/disjuntores/retificadores, foto ruim/escura). NÃO chute.
Retorne APENAS JSON: {"tipo":"CHUMBO"|"LÍTIO"|"POLÍMERO"|"INDETERMINADO","confianca":0-1,"justificativa":"breve"}.`;

const MODEL = "gemini-flash-latest";

function extractPath(url: string): { bucket: string; path: string } | null {
  const m = url.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/([^?]+)/);
  if (!m) return null;
  return { bucket: m[1], path: decodeURIComponent(m[2]) };
}

function buildAiUnavailablePayload(status: number, body: string) {
  let parsed: any = {};
  try { parsed = JSON.parse(body); } catch { /* noop */ }
  const errMsg = parsed?.error?.message || parsed?.message || body?.slice(0, 200);
  if (status === 402 || status === 403) {
    return { ok: false as const, code: "AI_CREDITS_EXHAUSTED", status, message: `Google bloqueou: ${errMsg}. Verifique billing.` };
  }
  if (status === 429) {
    return { ok: false as const, code: "AI_RATE_LIMITED", status, message: `Cota Google excedida: ${errMsg}. Habilite billing.` };
  }
  return { ok: false as const, code: "AI_REQUEST_FAILED", status, message: errMsg || "Falha na IA." };
}

async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to fetch image: ${resp.status}`);
  const mimeType = resp.headers.get("content-type") || "image/jpeg";
  const buf = new Uint8Array(await resp.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
  return { data: btoa(bin), mimeType };
}

type ClassifyImageResult =
  | { ok: true; tipo: string; confianca: number | null }
  | ReturnType<typeof buildAiUnavailablePayload>;

function markBanksAsIndeterminate(
  existing: Record<string, any>,
  gabinete: number,
  bancos: number[],
  reason: string,
) {
  for (const banco of bancos) {
    existing[`gab${gabinete - 1}_banco${banco - 1}`] = {
      tipo: "INDETERMINADO",
      confianca: null,
      erro: reason,
    };
  }
}

async function classifyImage(imgUrl: string, apiKey: string): Promise<ClassifyImageResult> {
  let img: { data: string; mimeType: string };
  try {
    img = await fetchImageAsBase64(imgUrl);
  } catch (e) {
    return { ok: false as const, code: "AI_REQUEST_FAILED", status: 0, message: (e as Error).message };
  }

  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`, {
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
      generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
    }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    console.error("Gemini error", resp.status, err.slice(0, 200));
    return buildAiUnavailablePayload(resp.status, err);
  }
  const data = await resp.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  let parsed: any = {};
  try { parsed = JSON.parse(content); } catch { /* ignore */ }
  let tipo = String(parsed.tipo || "").toUpperCase().replace("LITIO", "LÍTIO").replace("POLIMERO", "POLÍMERO");
  if (tipo !== "LÍTIO" && tipo !== "POLÍMERO" && tipo !== "CHUMBO" && tipo !== "INDETERMINADO") tipo = "INDETERMINADO";
  return { ok: true, tipo, confianca: parsed.confianca ?? null };
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

    let processed = 0, updated = 0, skipped = 0, failed = 0, markedIndeterminate = 0;
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
          if (sErr || !signed?.signedUrl) {
            markBanksAsIndeterminate(existing, i, pendingBanks, sErr?.message || "signed_url_failed");
            changed = true;
            failed += pendingBanks.length;
            markedIndeterminate += pendingBanks.length;
            details.push({ id: r.id, gab: i, err: sErr?.message || "signed_url_failed", markedIndeterminate: pendingBanks.length });
            continue;
          }
          signedUrl = signed.signedUrl;
        }

        processed++;
        const result = await classifyImage(signedUrl, GEMINI_API_KEY);
        if (!result.ok) {
          if (result.code === "AI_CREDITS_EXHAUSTED" || result.code === "AI_RATE_LIMITED") {
            return new Response(JSON.stringify({
              ok: false, code: result.code, message: result.message,
              processed, updated, skipped, failed, markedIndeterminate, hitLimit: false, done: false, stopped: true,
              details: details.slice(0, 10), nextOffset: offsetReports,
            }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }

          markBanksAsIndeterminate(existing, i, pendingBanks, result.message || result.code || "ai_request_failed");
          changed = true;
          failed += pendingBanks.length;
          markedIndeterminate += pendingBanks.length;
          details.push({ id: r.id, gab: i, code: result.code, status: result.status, message: result.message, markedIndeterminate: pendingBanks.length });
          continue;
        }
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
    return new Response(JSON.stringify({ ok: true, processed, updated, skipped, failed, markedIndeterminate, hitLimit, done, details: details.slice(0, 10), nextOffset: offsetReports + advanced }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
