import { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";

// The panel is served through our own backend relay, so devices that block
// the original address (or show a blank screen) can still load it.
const PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/monitor-proxy`;

// ---- Secure relay client: platform login token + per-tab upstream session cookie ----
let accessToken: string | null = null;
supabase.auth.getSession().then(({ data }) => { accessToken = data.session?.access_token ?? null; });
supabase.auth.onAuthStateChange((_e, session) => { accessToken = session?.access_token ?? null; });

const JAR_KEY = "mon_jar";
function readJar(): Record<string, string> {
  try { return JSON.parse(sessionStorage.getItem(JAR_KEY) || "{}"); } catch { return {}; }
}
function cookieHeader() {
  return Object.entries(readJar()).map(([k, v]) => `${k}=${v}`).join("; ");
}
function storeCookies(res: Response) {
  const raw = res.headers.get("x-mon-set-cookie");
  if (!raw) return;
  const jar = readJar();
  for (const line of raw.split("\n")) {
    const i = line.indexOf("=");
    if (i <= 0) continue;
    const k = line.slice(0, i).trim(), v = line.slice(i + 1).trim();
    if (v) jar[k] = v; else delete jar[k];
  }
  sessionStorage.setItem(JAR_KEY, JSON.stringify(jar));
}
export function proxied(proxyUrl: string, path: string) {
  return `${proxyUrl}${proxyUrl.includes("?") ? "&" : "?"}path=${encodeURIComponent(path)}`;
}
function relayHeaders(extra?: HeadersInit) {
  const h = new Headers(extra);
  if (accessToken) h.set("Authorization", `Bearer ${accessToken}`);
  const c = cookieHeader();
  if (c) h.set("x-mon-cookie", c);
  return h;
}
/** Fetch an upstream path through the relay. Follows relay redirects unless follow=false. */
async function relayFetch(proxyUrl: string, path: string, init: RequestInit = {}, follow = true): Promise<Response> {
  if (!accessToken) accessToken = (await supabase.auth.getSession()).data.session?.access_token ?? null;
  let res = await fetch(proxied(proxyUrl, path), { ...init, headers: relayHeaders(init.headers), cache: "no-store", referrerPolicy: "no-referrer" });
  storeCookies(res);
  let hops = 0;
  while (follow && res.headers.get("x-mon-location") && hops++ < 5) {
    res = await fetch(proxied(proxyUrl, res.headers.get("x-mon-location")!), { headers: relayHeaders(), cache: "no-store", referrerPolicy: "no-referrer" });
    storeCookies(res);
  }
  return res;
}
const w = window as unknown as Record<string, unknown>;
w.__monFetch = (proxyUrl: string, path: string, init?: RequestInit) => relayFetch(proxyUrl, path, init);
w.__monHeaders = () => { const o: Record<string, string> = {}; relayHeaders().forEach((v, k) => { o[k] = v; }); return o; };
w.__monStore = (getHeader: (n: string) => string | null) => storeCookies({ headers: { get: getHeader } } as unknown as Response);

export function buildDocument(html: string, proxyUrl = PROXY_URL) {
  // Pages that declare an external <base> (mirrors of other systems) must keep
  // their own addresses untouched, otherwise their files are requested from the wrong place.
  const hasBase = /<base\s[^>]*href=["']https?:/i.test(html);
  const shim = `<script>
(function(){
  var P=${JSON.stringify(proxyUrl)};
  var B=${hasBase ? "true" : "false"};
  function px(u){
    if(typeof u!=='string') return u;
    if(B) return u;
    if(/^https?:\\/\\//i.test(u)||u.indexOf('data:')===0||u.indexOf('blob:')===0) return u;
    if(u.charAt(0)!=='/') u='/'+u;
    return P+(P.indexOf('?')>=0?'&':'?')+'path='+encodeURIComponent(u);
  }
  var T=window.top;
  var of=window.fetch.bind(window);
  function rel(u){ if(B||typeof u!=='string') return null; if(u.indexOf(location.origin)===0) u=u.slice(location.origin.length);
    if(/^https?:\\/\\//i.test(u)||u.indexOf('data:')===0||u.indexOf('blob:')===0) return null; return u.charAt(0)==='/'?u:'/'+u; }
  function rf(u,o){ return T.__monFetch(P,u,o); }
  window.fetch=function(i,o){
    var u=rel(typeof i==='string'?i:(i&&i.url));
    if(u!==null) return rf(u,o||(typeof i!=='string'?{method:i.method,body:i.body,headers:i.headers}:undefined));
    return of(i,o);
  };
  var oo=XMLHttpRequest.prototype.open, os=XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open=function(m,u){var r=rel(u); this.__mon=r!==null; if(r!==null) arguments[1]=px(r); return oo.apply(this,arguments);};
  XMLHttpRequest.prototype.send=function(){ if(this.__mon){ var h=T.__monHeaders(); for(var k in h) this.setRequestHeader(k,h[k]);
    var x=this; this.addEventListener('load',function(){ T.__monStore(function(n){return x.getResponseHeader(n);}); }); }
    return os.apply(this,arguments); };
  document.addEventListener('submit',function(e){
    var f=e.target; if(!f||f.tagName!=='FORM') return;
    var a=f.getAttribute('action')||location.pathname||'/'; var r=rel(a); if(r===null) return;
    e.preventDefault();
    var m=(f.getAttribute('method')||'GET').toUpperCase();
    var data=new URLSearchParams(new FormData(f)).toString();
    if(m==='GET'){ window.__monNav(r+(r.indexOf('?')>=0?'&':'?')+data); return; }
    T.postMessage({type:'monitor-submit',path:r,body:data},'*');
  },true);
  var nested = window.parent !== window.top;
  window.__monNav=function(p){ if(nested){ loadSelf(p); return; } parent.postMessage({type:'monitor-nav',path:p},'*');};
  function loadSelf(p){ var fe=window.frameElement; if(fe) frameLoad(fe,p); }
  function isRel(u){ return !B && typeof u==='string' && u.charAt(0)==='/' && u.charAt(1)!=='/'; }
  var d=Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype,'src');
  function frameLoad(f,u){
    f.setAttribute('data-mon-src',u);
    rf(u).then(function(r){return r.text();}).then(function(t){
      f.srcdoc=window.top.__monBuild(t,P);
    }).catch(function(){});
  }
  window.__monFrameLoad=frameLoad;
  Object.defineProperty(HTMLIFrameElement.prototype,'src',{
    configurable:true,
    get:function(){ return this.getAttribute('data-mon-src') || d.get.call(this); },
    set:function(u){
      if(isRel(u)) return frameLoad(this,u);
      if(u==='about:blank'){ this.removeAttribute('data-mon-src'); this.removeAttribute('srcdoc'); }
      d.set.call(this,u);
    }
  });
  function scan(){ document.querySelectorAll('iframe[data-mon-init]').forEach(function(f){
    var u=f.getAttribute('data-mon-init'); f.removeAttribute('data-mon-init'); frameLoad(f,u); }); }
  document.addEventListener('DOMContentLoaded',scan);
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;
    if(!a) return; var h=a.getAttribute('href');
    if(isRel(h)){
      e.preventDefault();
      if(a.getAttribute('target')){ window.top.postMessage({type:'monitor-nav',path:h},'*'); }
      else window.__monNav(h);
    }
  },true);
})();
</script>`;
  if (hasBase) return html.replace(/<head[^>]*>/i, (m) => m + shim);
  let fixed = html.replace(/location\.href\s*=\s*(['"])(\/[^'"]*)\1/g, "window.__monNav($1$2$1)");
  // Inner panels: load through the relay instead of the app's own address
  fixed = fixed.replace(/<iframe([^>]*?)\ssrc=(["'])(\/(?!\/)[^"']*)\2/gi, "<iframe$1 data-mon-init=$2$3$2");
  // Images, scripts, styles with internal paths
  fixed = fixed.replace(
    /(<(?:img|script|link|source|video|audio)\b[^>]*?\s(?:src|href)=)(["'])(\/(?!\/)[^"']*)\2/gi,
    (_m, pre, q, p) => `${pre}${q}${proxyUrl}${proxyUrl.includes('?') ? '&' : '?'}path=${encodeURIComponent(p)}${q}`,
  );
  return fixed.replace(/<head[^>]*>/i, (m) => m + shim);
}

(window as unknown as { __monBuild: typeof buildDocument }).__monBuild = buildDocument;

export default function PainelMonitoramento({ proxyUrl = PROXY_URL, onUnauthorized }: { proxyUrl?: string; onUnauthorized?: () => void } = {}) {
  const [path, setPath] = useState("/");
  const [doc, setDoc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const requestId = useRef(0);
  const frame = useRef<HTMLIFrameElement>(null);

  const load = useCallback(async (p: string, init?: RequestInit) => {
    const id = ++requestId.current;
    setError(null);
    try {
      const res = await relayFetch(proxyUrl, p, init, false);
      if (id !== requestId.current) return;
      if (res.status === 401 && onUnauthorized) { onUnauthorized(); return; }
      const next = res.headers.get("x-mon-location");
      if (next) { if (next === path) load(next); else setPath(next); return; }
      if (res.status >= 500) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      if (id === requestId.current) setDoc(buildDocument(html, proxyUrl));
    } catch (e) {
      if (id === requestId.current) setError("Não foi possível carregar o painel. Tentando novamente...");
    }
  }, [proxyUrl, onUnauthorized, path]);

  useEffect(() => {
    load(path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, reloadKey]);

  // Retry automatically on error
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setReloadKey((k) => k + 1), 10000);
    return () => clearTimeout(t);
  }, [error]);

  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const ownsSource = (w: Window | null): boolean => {
        if (!w) return false;
        if (w === e.source) return true;
        try { for (let i = 0; i < w.frames.length; i++) if (ownsSource(w.frames[i])) return true; } catch { return false; }
        return false;
      };
      if (ownsSource(frame.current?.contentWindow ?? null) && (e.data?.type === "monitor-nav" || e.data?.type === "monitor-submit") && typeof e.data.path === "string" && e.data.path.startsWith('/') && !e.data.path.startsWith('//')) {
        if (e.data.type === "monitor-submit") loadRef.current(e.data.path, { method: "POST", body: String(e.data.body ?? ""), headers: { "Content-Type": "application/x-www-form-urlencoded" } });
        else setPath(e.data.path);
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  return (
    <>
      <Helmet>
        <title>Painel de Monitoramento | InfraSites</title>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
        <meta name="description" content="Painel de monitoramento da rede Norte — visualização integrada em tempo real." />
      </Helmet>

      <div className="h-screen flex flex-col bg-background">
        <main className="flex-1 min-h-0 relative">
          {error && (
            <div className="absolute inset-x-0 top-0 z-10 bg-destructive text-destructive-foreground text-xs text-center py-1">
              {error}
            </div>
          )}
          {doc ? (
            <iframe
              ref={frame}
              srcDoc={doc}
              referrerPolicy="no-referrer"
              title="Painel de Monitoramento"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads allow-modals"
            />
          ) : (
            !error && (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            )
          )}
        </main>
      </div>
    </>
  );
}
