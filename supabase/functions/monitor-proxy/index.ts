// Proxy for the monitoring panel.
// Lets devices that block the original address (or show a blank screen) load it through our backend.
const UPSTREAM = "http://vivonorteapp.com";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Set to false to take the monitoring panel offline (blocks all relayed access).
const ENABLED = false;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (!ENABLED) {
    return new Response(JSON.stringify({ error: "Monitoramento temporariamente fora do ar." }), {
      status: 503,
      headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }

  const url = new URL(req.url);
  let path = url.searchParams.get("path") || "/";
  if (!path.startsWith("/") || path.startsWith("//")) {
    return new Response("invalid path", { status: 400, headers: cors });
  }

  try {
    const upstream = await fetch(UPSTREAM + path, {
      method: req.method,
      headers: {
        "User-Agent": "InfraSites-Monitor-Proxy",
        ...(req.headers.get("content-type") ? { "Content-Type": req.headers.get("content-type")! } : {}),
      },
      body: req.method === "POST" ? await req.text() : undefined,
    });
    const body = await upstream.arrayBuffer();
    const ct = upstream.headers.get("content-type") || "application/octet-stream";
    return new Response(body, {
      status: upstream.status,
      headers: { ...cors, "Content-Type": ct.includes("text/html") ? "text/plain; charset=utf-8" : ct, "Cache-Control": "no-store" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 502,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
