import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet";

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
