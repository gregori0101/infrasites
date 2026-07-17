// Classify a battery photo as LÍTIO or POLÍMERO using Lovable AI (Gemini vision)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { imageUrl } = await req.json();
    if (!imageUrl || typeof imageUrl !== "string") {
      return new Response(JSON.stringify({ error: "imageUrl is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Você é um especialista em identificação de baterias estacionárias de telecom. Analise a foto e classifique a bateria como uma de duas opções:
- "LÍTIO" — baterias de íon-lítio (LiFePO4/LFP, NMC) tipicamente em módulos retangulares metálicos ou plásticos com display/LED, marcas como Huawei ESM, Freedom, Shoto, ZTE modernos.
- "POLÍMERO" — baterias de polímero de lítio (LiPo), tipicamente em pouches/sacolas planas seladas.
Retorne APENAS um JSON: {"tipo":"LÍTIO"|"POLÍMERO","confianca":0-1,"justificativa":"breve"}. Se não conseguir identificar com clareza, escolha a opção mais provável e coloque confianca baixa.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Classifique esta bateria: LÍTIO ou POLÍMERO?" },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResp.ok) {
      const err = await aiResp.text();
      console.error("[classify-battery] AI gateway error", aiResp.status, err);
      return new Response(JSON.stringify({ error: "AI request failed", status: aiResp.status, details: err }), {
        status: aiResp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const content = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: { tipo?: string; confianca?: number; justificativa?: string } = {};
    try {
      parsed = typeof content === "string" ? JSON.parse(content) : content;
    } catch {
      const m = String(content).match(/(LÍTIO|POLÍMERO|LITIO|POLIMERO)/i);
      parsed = m ? { tipo: m[1].toUpperCase() } : {};
    }

    let tipo = (parsed.tipo || "").toUpperCase().replace("LITIO", "LÍTIO").replace("POLIMERO", "POLÍMERO");
    if (tipo !== "LÍTIO" && tipo !== "POLÍMERO") tipo = "LÍTIO";

    return new Response(
      JSON.stringify({ tipo, confianca: parsed.confianca ?? null, justificativa: parsed.justificativa ?? null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[classify-battery] exception", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
