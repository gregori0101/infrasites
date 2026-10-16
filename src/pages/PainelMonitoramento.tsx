import { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";

// The panel is served through our own backend relay, so devices that block
// the original address (or show a blank screen) can still load it.
const PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/monitor-proxy`;

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
  var of=window.fetch.bind(window);
  window.fetch=function(i,o){
    if(typeof i==='string') return of(px(i),o);
    if(i&&i.url&&i.url.indexOf(location.origin)===0){return of(px(i.url.slice(location.origin.length)),o);}
    return of(i,o);
  };
  var oo=XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open=function(m,u){arguments[1]=px(u);return oo.apply(this,arguments);};
  var nested = window.parent !== window.top;
  window.__monNav=function(p){ if(nested){ loadSelf(p); return; } parent.postMessage({type:'monitor-nav',path:p},'*');};
  function loadSelf(p){ var fe=window.frameElement; if(fe) frameLoad(fe,p); }
  function isRel(u){ return !B && typeof u==='string' && u.charAt(0)==='/' && u.charAt(1)!=='/'; }
  var d=Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype,'src');
  function frameLoad(f,u){
    f.setAttribute('data-mon-src',u);
    of(px(u),{cache:'no-store'}).then(function(r){return r.text();}).then(function(t){
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

  const load = useCallback(async (p: string) => {
    const id = ++requestId.current;
    setError(null);
    try {
      const res = await fetch(`${proxyUrl}${proxyUrl.includes('?') ? '&' : '?'}path=${encodeURIComponent(p)}`, { cache: "no-store", referrerPolicy: "no-referrer" });
      if (id !== requestId.current) return;
      if (res.status === 401 && onUnauthorized) { onUnauthorized(); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      if (id === requestId.current) setDoc(buildDocument(html, proxyUrl));
    } catch (e) {
      if (id === requestId.current) setError("Não foi possível carregar o painel. Tentando novamente...");
    }
  }, [proxyUrl, onUnauthorized]);

  useEffect(() => {
    load(path);
  }, [path, reloadKey, load]);

  // Retry automatically on error
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setReloadKey((k) => k + 1), 10000);
    return () => clearTimeout(t);
  }, [error]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const ownsSource = (w: Window | null): boolean => {
        if (!w) return false;
        if (w === e.source) return true;
        try { for (let i = 0; i < w.frames.length; i++) if (ownsSource(w.frames[i])) return true; } catch { return false; }
        return false;
      };
      if (ownsSource(frame.current?.contentWindow ?? null) && e.data?.type === "monitor-nav" && typeof e.data.path === "string" && e.data.path.startsWith('/') && !e.data.path.startsWith('//')) setPath(e.data.path);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  return (
    <>
      <Helmet>
        <title>Painel de Monitoramento | InfraSites Vivo</title>
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
