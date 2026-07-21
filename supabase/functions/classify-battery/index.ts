// Classify a battery photo using Google Gemini API directly (bypasses Lovable AI credits)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `Você é um especialista em identificação de baterias estacionárias de telecom. Analise a foto e classifique em UMA de quatro opções:
- "CHUMBO" — chumbo-ácido (VRLA/AGM/GEL), caixas plásticas grandes com terminais parafusados no topo (Moura, GetPower, Freedom chumbo, Heliar, Unipower, CSB, Yuasa).
- "LÍTIO" — íon-lítio (LiFePO4/LFP, NMC), módulos padronizados com display/LED/BMS (Huawei ESM, Shoto, Narada Li, Pylontech).
- "POLÍMERO" — polímero de lítio (LiPo), pouches planos selados.
- "INDETERMINADO" — use OBRIGATORIAMENTE quando NÃO houver bateria visível (gabinete vazio, só cabos/disjuntores, foto de outro equipamento, foto ruim). NÃO chute.
Retorne APENAS JSON: {"tipo":"CHUMBO"|"LÍTIO"|"POLÍMERO"|"INDETERMINADO","confianca":0-1,"justificativa":"breve"}.`;

async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to fetch image: ${resp.status}`);
  const mimeType = resp.headers.get("content-type")?.split(";")[0] || "image/jpeg";
  const buf = new Uint8Array(await resp.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
  return { data: btoa(bin), mimeType };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { imageUrl } = await req.json();
    if (!imageUrl || typeof imageUrl !== "string") {
      return new Response(JSON.stringify({ error: "imageUrl is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data, mimeType } = await fetchImageAsBase64(imageUrl);

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    const aiResp = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{
          role: "user",
          parts: [
            { text: "Classifique a bateria mostrada. Se não houver bateria visível, retorne INDETERMINADO." },
            { inlineData: { mimeType, data } },
          ],
        }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });

    if (!aiResp.ok) {
      const err = await aiResp.text();
      console.error("[classify-battery] Gemini error", aiResp.status, err);
      return new Response(JSON.stringify({ error: "AI request failed", status: aiResp.status, details: err }), {
        status: aiResp.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const raw = await aiResp.json();
    const content = raw?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    let parsed: { tipo?: string; confianca?: number; justificativa?: string } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      const m = String(content).match(/(CHUMBO|LÍTIO|POLÍMERO|LITIO|POLIMERO|INDETERMINADO)/i);
      parsed = m ? { tipo: m[1].toUpperCase() } : {};
    }

    let tipo = (parsed.tipo || "").toUpperCase().replace("LITIO", "LÍTIO").replace("POLIMERO", "POLÍMERO");
    if (tipo !== "LÍTIO" && tipo !== "POLÍMERO" && tipo !== "CHUMBO" && tipo !== "INDETERMINADO") tipo = "INDETERMINADO";

    return new Response(
      JSON.stringify({ tipo, confianca: parsed.confianca ?? null, justificativa: parsed.justificativa ?? null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[classify-battery] exception", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
