import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VivoLogo } from "@/components/ui/vivo-logo";

// Served through our backend relay so the original address is never opened directly.
const PROXY = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/backbone-proxy/v4`;

function buildDocument(html: string) {
  const shim = `<base href="${PROXY}/"><script>
(function(){
  var P=${JSON.stringify(PROXY)};
  function px(u){
    if(typeof u!=='string') return u;
    if(u.indexOf(location.origin+'/')===0) u=u.slice(location.origin.length);
    if(/^[a-z]+:/i.test(u)||u.indexOf('//')===0) return u;
    if(u.charAt(0)!=='/') return u;
    return P+u;
  }
  var of=window.fetch.bind(window);
  window.fetch=function(i,o){
    if(typeof i==='string') return of(px(i),o);
    if(i&&i.url&&i.url.indexOf(location.origin)===0) return of(new Request(px(i.url),i),o);
    return of(i,o);
  };
  ['pushState','replaceState'].forEach(function(k){var o=history[k];history[k]=function(st,t,u){try{return o.call(history,st,t,u)}catch(e){try{window.__bbPath=String(u||'/');return o.call(history,st,t)}catch(_){}}};});
  var oo=XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open=function(m,u){arguments[1]=px(u);return oo.apply(this,arguments);};
})();
</script>`;
  const fixed = html
    .replace(/(src|href)=(["'])\/(?!\/)/g, `$1=$2${PROXY}/`)
    .replace(/<script[^>]*~flock\.js[^>]*><\/script>/g, "");
  return fixed.replace(/<head[^>]*>/i, (m) => m + shim);
}

export default function Backbone() {
  const navigate = useNavigate();
  const [doc, setDoc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`${PROXY}/`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDoc(buildDocument(await res.text()));
    } catch {
      setError("Não foi possível carregar o painel. Tentando novamente...");
    }
  }, []);

  useEffect(() => { load(); }, [reloadKey, load]);
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setReloadKey((k) => k + 1), 10000);
    return () => clearTimeout(t);
  }, [error]);

  return (
    <>
      <Helmet>
        <title>Backbone Norte | InfraSites Vivo</title>
        <meta name="description" content="Painel Backbone Norte — visualização integrada em tempo real." />
      </Helmet>

      <div className="h-screen flex flex-col bg-background">
        <header className="border-b bg-card px-3 h-9 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-sm font-semibold truncate">Backbone Norte</h1>
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
              key={reloadKey}
              srcDoc={doc}
              title="Backbone Norte"
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
