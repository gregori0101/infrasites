import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VivoLogo } from "@/components/ui/vivo-logo";

// The panel is served through our own backend relay, so devices that block
// the original address (or show a blank screen) can still load it.
const PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/monitor-proxy`;

function buildDocument(html: string) {
  const shim = `<script>
(function(){
  var P=${JSON.stringify(PROXY_URL)};
  function px(u){
    if(typeof u!=='string') return u;
    if(/^https?:\\/\\//i.test(u)||u.indexOf('data:')===0||u.indexOf('blob:')===0) return u;
    if(u.charAt(0)!=='/') u='/'+u;
    return P+'?path='+encodeURIComponent(u);
  }
  var of=window.fetch.bind(window);
  window.fetch=function(i,o){
    if(typeof i==='string') return of(px(i),o);
    if(i&&i.url&&i.url.indexOf(location.origin)===0){return of(px(i.url.slice(location.origin.length)),o);}
    return of(i,o);
  };
  var oo=XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open=function(m,u){arguments[1]=px(u);return oo.apply(this,arguments);};
  window.__monNav=function(p){parent.postMessage({type:'monitor-nav',path:p},'*');};
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;
    if(!a) return; var h=a.getAttribute('href');
    if(h&&h.charAt(0)==='/'&&h.charAt(1)!=='/'){e.preventDefault();window.__monNav(h);}
  },true);
})();
</script>`;
  const fixed = html.replace(/location\.href\s*=\s*(['"])(\/[^'"]*)\1/g, "window.__monNav($1$2$1)");
  return fixed.replace(/<head[^>]*>/i, (m) => m + shim);
}

export default function PainelMonitoramento() {
  const navigate = useNavigate();
  const [path, setPath] = useState("/");
  const [doc, setDoc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async (p: string) => {
    setError(null);
    try {
      const res = await fetch(`${PROXY_URL}?path=${encodeURIComponent(p)}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDoc(buildDocument(await res.text()));
    } catch (e) {
      setError("Não foi possível carregar o painel. Tentando novamente...");
    }
  }, []);

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
      if (e.data?.type === "monitor-nav" && typeof e.data.path === "string") setPath(e.data.path);
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
        <header className="border-b bg-card px-3 h-9 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-sm font-semibold truncate">Painel de Monitoramento</h1>
            {path !== "/" && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setPath("/")}>
                Início
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setReloadKey((k) => k + 1)} title="Recarregar">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
          <VivoLogo className="h-5 w-auto" />
        </header>

        <main className="flex-1 min-h-0 relative">
          {error && (
            <div className="absolute inset-x-0 top-0 z-10 bg-destructive text-destructive-foreground text-xs text-center py-1">
              {error}
            </div>
          )}
          {doc ? (
            <iframe
              key={`${path}-${reloadKey}`}
              srcDoc={doc}
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
