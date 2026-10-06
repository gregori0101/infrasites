// Relay for the Backbone Norte panel: users never open the original address directly.
// Path-based: /backbone-proxy/<upstream path>  (relative imports inside JS keep working)
const UPSTREAM = "https://backbonenorte.lovable.app";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const url = new URL(req.url);
  const idx = url.pathname.indexOf("/backbone-proxy");
  let path = idx >= 0 ? url.pathname.slice(idx + "/backbone-proxy".length) : "/";
  path = path.replace(/^\/v\d+(?=\/|$)/, "");
  if (!path || path === "") path = "/";
  if (!path.startsWith("/") || path.startsWith("//")) {
    return new Response("invalid path", { status: 400, headers: cors });
  }
  try {
    const upstream = await fetch(UPSTREAM + path + url.search, {
      method: req.method,
      headers: {
        "User-Agent": "InfraSites-Backbone-Proxy",
        ...(req.headers.get("content-type") ? { "Content-Type": req.headers.get("content-type")! } : {}),
      },
      body: req.method === "POST" ? await req.text() : undefined,
    });
    const ct = upstream.headers.get("content-type") || "application/octet-stream";
    let body: ArrayBuffer | string = await upstream.arrayBuffer();
    if (/javascript|text\/html|text\/css/.test(ct)) {
      const self = `${Deno.env.get("SUPABASE_URL")}/functions/v1/backbone-proxy/v4`;
      body = new TextDecoder().decode(body)
        .replace(/(["'`(])\/assets\//g, `$1${self}/assets/`)
        // Vite preload helper: function(e){return"/"+e}
        // inside an embedded document the address is "srcdoc": treat it as "/"
        .replace(/\$\{(\w+)\.location\.pathname\}/g, (_m, v) => `\${(window.__bbPath||(${v}.location.pathname==="srcdoc"?"/":${v}.location.pathname))}`)
        .replace(/function\((\w+)\)\{return(["'`])\/\2\+\1\}/g, (_m, v) => `function(${v}){return${JSON.stringify(self + "/")}+${v}}`);
    }
    return new Response(body, {
      status: upstream.status,
      headers: {
        ...cors,
        "Content-Type": ct.includes("text/html") ? "text/plain; charset=utf-8" : ct,
        "Cache-Control": ct.includes("text/html") ? "no-store" : "public, max-age=3600",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 502,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
