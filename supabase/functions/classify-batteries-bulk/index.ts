// Bulk-classify pending battery photos for all reports.
// Runs server-side with service role so we can re-sign private storage URLs.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `Você é um especialista em identificação de baterias estacionárias de telecom. Analise a foto e classifique a bateria como uma de duas opções:
- "LÍTIO" — baterias de íon-lítio (LiFePO4/LFP, NMC) tipicamente em módulos retangulares metálicos ou plásticos com display/LED, marcas como Huawei ESM, Freedom, Shoto, ZTE modernos.
- "POLÍMERO" — baterias de polímero de lítio (LiPo), tipicamente em pouches/sacolas planas seladas.
Retorne APENAS um JSON: {"tipo":"LÍTIO"|"POLÍMERO","confianca":0-1,"justificativa":"breve"}. Se não conseguir identificar com clareza, escolha a opção mais provável e coloque confianca baixa.`;

function extractPath(url: string): { bucket: string; path: string } | null {
  // Matches .../storage/v1/object/(public|sign)/<bucket>/<path...>
  const m = url.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/([^?]+)/);
  if (!m) return null;
  return { bucket: m[1], path: decodeURIComponent(m[2]) };
}

async function classifyImage(signedUrl: string, apiKey: string): Promise<{ tipo: string; confianca: number | null } | null> {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Classifique esta bateria: LÍTIO ou POLÍMERO?" },
            { type: "image_url", image_url: { url: signedUrl } },
          ],
        },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    console.error("AI error", resp.status, err.slice(0, 200));
    return null;
  }
  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content ?? "{}";
  let parsed: any = {};
  try { parsed = typeof content === "string" ? JSON.parse(content) : content; } catch { /* ignore */ }
  let tipo = String(parsed.tipo || "").toUpperCase().replace("LITIO", "LÍTIO").replace("POLIMERO", "POLÍMERO");
  if (tipo !== "LÍTIO" && tipo !== "POLÍMERO") tipo = "LÍTIO";
  return { tipo, confianca: parsed.confianca ?? null };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    const body = await req.json().catch(() => ({}));
    const limit: number = Math.min(Number(body.limit ?? 100), 400);
    const offsetReports: number = Number(body.offset ?? 0);

    // Fetch reports that have any battery photo + at least one battery tipo set.
    const photoCols = [1,2,3,4,5,6,7].flatMap(i => [`gab${i}_bat_foto`, ...[1,2,3,4,5,6,7,8,9,10,11,12].map(j=>`gab${i}_bat${j}_tipo`)]);
    const { data: reports, error } = await supabase
      .from("reports")
      .select(["id", "baterias_tipo_ia", ...photoCols].join(","))
      .order("created_at", { ascending: false })
      .range(offsetReports, offsetReports + 500);
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
        // list banks that need classification for this gabinete
        const pendingBanks: number[] = [];
        for (let j = 1; j <= 12; j++) {
          if (r[`gab${i}_bat${j}_tipo`] == null) continue;
          const key = `gab${i - 1}_banco${j - 1}`;
          if (existing[key]) continue;
          pendingBanks.push(j);
        }
        if (pendingBanks.length === 0) continue;

        // Re-sign URL if it's a supabase storage URL
        let signedUrl = url;
        const info = extractPath(url);
        if (info) {
          const { data: signed, error: sErr } = await supabase.storage.from(info.bucket).createSignedUrl(info.path, 60 * 60);
          if (sErr || !signed?.signedUrl) { failed++; details.push({ id: r.id, gab: i, err: sErr?.message }); continue; }
          signedUrl = signed.signedUrl;
        }

        processed++;
        const result = await classifyImage(signedUrl, LOVABLE_API_KEY);
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

    return new Response(JSON.stringify({ processed, updated, skipped, failed, details: details.slice(0, 10), nextOffset: offsetReports + (reports?.length ?? 0) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
