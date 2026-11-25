// Secure relay for the monitoring panel (netops-console.com).
// - Only approved platform users can load pages/data (JWT + user_roles.approved).
// - Static files (css/js/images/fonts) are relayed without login so <img>/<link> tags work.
// - The upstream session cookie lives only in the user's tab and is sent via x-mon-cookie.
// - Redirects are returned as x-mon-location so navigation stays inside the app.
import { createClient } from "npm:@supabase/supabase-js@2";

const UPSTREAM = "https://netops-console.com";
const ENABLED = true;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-mon-cookie",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Expose-Headers": "x-mon-location, x-mon-set-cookie",
};
const baseHeaders = {
  ...cors,
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet, noimageindex",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};
const STATIC = /\.(css|js|mjs|map|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|eot)$/i;

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function isApproved(req: Request) {
  const h = req.headers.get("Authorization");
  if (!h?.startsWith("Bearer ")) return false;
  const { data: { user }, error } = await admin.auth.getUser(h.slice(7));
  if (error || !user) return false;
  const { data } = await admin.from("user_roles").select("approved").eq("user_id", user.id).maybeSingle();
  return !!data?.approved;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...baseHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (!ENABLED) return json(503, { error: "Monitoramento temporariamente fora do ar." });
  if (req.method !== "GET" && req.method !== "POST") return json(405, { error: "method" });

  const url = new URL(req.url);
  const path = url.searchParams.get("path") || "/";
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\") || /[\r\n]/.test(path)) {
    return json(400, { error: "invalid path" });
  }
  const pathname = path.split("?")[0];
  const isStatic = req.method === "GET" && STATIC.test(pathname);
  if (!isStatic && !(await isApproved(req))) return json(401, { error: "unauthorized" });

  try {
    const headers: Record<string, string> = { "User-Agent": "Mozilla/5.0 (InfraSites-Monitor-Proxy)", Accept: req.headers.get("accept") || "*/*" };
    const ct = req.headers.get("content-type");
    if (ct) headers["Content-Type"] = ct;
    const cookie = req.headers.get("x-mon-cookie");
    if (cookie && !isStatic && cookie.length < 8000 && !/[\r\n]/.test(cookie)) headers["Cookie"] = cookie;
    if (req.method === "POST") { headers["Origin"] = UPSTREAM; headers["Referer"] = UPSTREAM + "/"; }

    const upstream = await fetch(UPSTREAM + path, {
      method: req.method,
      headers,
      body: req.method === "POST" ? await req.arrayBuffer() : undefined,
      redirect: "manual",
    });

    const out: Record<string, string> = { ...baseHeaders };
    const setCookies = upstream.headers.getSetCookie?.() ?? [];
    if (setCookies.length) {
      out["x-mon-set-cookie"] = setCookies.map((c) => {
        const first = c.split(";")[0];
        const expired = /max-age=0|expires=thu, 01 jan 1970/i.test(c);
        return expired ? first.split("=")[0] + "=" : first;
      }).join("\n").replace(/[\r]/g, "");
    }
    const loc = upstream.headers.get("location");
    if (upstream.status >= 300 && upstream.status < 400 && loc) {
      const target = new URL(loc, UPSTREAM + path);
      if (target.origin === UPSTREAM) {
        out["x-mon-location"] = target.pathname + target.search;
        return new Response("", { status: 200, headers: out });
      }
      return json(400, { error: "external redirect blocked" });
    }
    const body = await upstream.arrayBuffer();
    const type = upstream.headers.get("content-type") || "application/octet-stream";
    out["Content-Type"] = type.includes("text/html") ? "text/plain; charset=utf-8" : type;
    return new Response(body, { status: upstream.status, headers: out });
  } catch (e) {
    return json(502, { error: String(e) });
  }
});
