// Proxy for the monitoring panel hosted behind ngrok.
// Lets devices that block ngrok domains (or show the ngrok warning page) load it through our backend.
const UPSTREAM = "https://mildly-nonusable-sanjuanita.ngrok-free.dev";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const url = new URL(req.url);
  let path = url.searchParams.get("path") || "/";
  if (!path.startsWith("/") || path.startsWith("//")) {
    return new Response("invalid path", { status: 400, headers: cors });
  }

  try {
    const upstream = await fetch(UPSTREAM + path, {
      method: req.method,
      headers: {
        "ngrok-skip-browser-warning": "1",
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
