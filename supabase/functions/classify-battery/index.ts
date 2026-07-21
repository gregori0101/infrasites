// Classify a battery photo using Lovable AI Gateway (Gemini Flash)
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

function buildAiUnavailablePayload(status: number, body: string) {
  let parsed: { type?: string; title?: string; message?: string; request_id?: string } = {};
  try {
    parsed = JSON.parse(body);
  } catch {
    parsed = {};
  }

  if (status === 402 || parsed.type === "payment_required") {
    return {
      ok: false,
      code: "AI_CREDITS_EXHAUSTED",
      status,
      message: "Créditos de IA esgotados. Adicione saldo em Settings → Cloud & AI balance e tente novamente.",
      requestId: parsed.request_id ?? null,
    };
  }

  if (status === 429 || parsed.type === "rate_limited") {
    return {
      ok: false,
      code: "AI_RATE_LIMITED",
      status,
      message: "Limite temporário de IA atingido. Aguarde alguns minutos e tente novamente.",
      requestId: parsed.request_id ?? null,
    };
  }

  return {
    ok: false,
    code: "AI_REQUEST_FAILED",
    status,
    message: parsed.message || parsed.title || "Não foi possível concluir a análise de IA.",
    requestId: parsed.request_id ?? null,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { imageUrl } = await req.json();
    if (!imageUrl || typeof imageUrl !== "string") {
      return new Response(JSON.stringify({ error: "imageUrl is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": LOVABLE_API_KEY,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Classifique a bateria mostrada. Se não houver bateria visível, retorne INDETERMINADO." },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResp.ok) {
      const err = await aiResp.text();
      console.error("[classify-battery] AI error", aiResp.status, err);
      return new Response(JSON.stringify(buildAiUnavailablePayload(aiResp.status, err)), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const raw = await aiResp.json();
    const content = raw?.choices?.[0]?.message?.content ?? "{}";
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
      JSON.stringify({ ok: true, tipo, confianca: parsed.confianca ?? null, justificativa: parsed.justificativa ?? null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[classify-battery] exception", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
