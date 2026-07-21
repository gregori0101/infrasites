import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, WifiOff, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PingStatus = 'idle' | 'checking' | 'ok' | 'fail';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export function LoginDiagnostics() {
  const [open, setOpen] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [authStatus, setAuthStatus] = useState<PingStatus>('idle');
  const [restStatus, setRestStatus] = useState<PingStatus>('idle');
  const [authDetail, setAuthDetail] = useState<string>('');
  const [restDetail, setRestDetail] = useState<string>('');
  const [swCount, setSwCount] = useState<number | null>(null);
  const [cacheCount, setCacheCount] = useState<number | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const runChecks = async () => {
    setAuthStatus('checking');
    setRestStatus('checking');
    setAuthDetail('');
    setRestDetail('');
    setLatency(null);

    // Auth health endpoint
    try {
      const start = performance.now();
      const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
        headers: { apikey: SUPABASE_KEY },
      });
      const ms = Math.round(performance.now() - start);
      setLatency(ms);
      if (res.ok) {
        setAuthStatus('ok');
        setAuthDetail(`HTTP ${res.status} • ${ms}ms`);
      } else {
        setAuthStatus('fail');
        setAuthDetail(`HTTP ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      setAuthStatus('fail');
      setAuthDetail(err instanceof Error ? err.message : 'Falha de rede');
    }

    // REST endpoint
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        headers: { apikey: SUPABASE_KEY },
      });
      if (res.ok || res.status === 404) {
        setRestStatus('ok');
        setRestDetail(`HTTP ${res.status}`);
      } else {
        setRestStatus('fail');
        setRestDetail(`HTTP ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      setRestStatus('fail');
      setRestDetail(err instanceof Error ? err.message : 'Falha de rede');
    }

    // Service workers / caches
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        setSwCount(regs.length);
      } else {
        setSwCount(0);
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        setCacheCount(keys.length);
      } else {
        setCacheCount(0);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (open) void runChecks();
  }, [open]);

  const clearCaches = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      window.location.reload();
    } catch (err) {
      console.warn('Falha ao limpar caches', err);
    }
  };

  const Row = ({ label, status, detail }: { label: string; status: PingStatus; detail: string }) => (
    <div className="flex items-center justify-between text-xs py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5 font-mono">
        {status === 'checking' && <Loader2 className="h-3 w-3 animate-spin" />}
        {status === 'ok' && <CheckCircle2 className="h-3 w-3 text-[hsl(var(--success,142_71%_45%))]" />}
        {status === 'fail' && <AlertCircle className="h-3 w-3 text-destructive" />}
        <span className={status === 'fail' ? 'text-destructive' : ''}>{detail || '—'}</span>
      </span>
    </div>
  );

  const anyFail = authStatus === 'fail' || restStatus === 'fail' || !online;

  return (
    <div className="mt-4 border rounded-md bg-muted/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium hover:bg-muted/50 rounded-md"
      >
        <span className="flex items-center gap-2">
          {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5 text-destructive" />}
          Diagnóstico de conexão
        </span>
        <span className="text-muted-foreground">{open ? 'ocultar' : 'mostrar'}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2 border-t">
          <div className="pt-2 space-y-0.5">
            <Row label="Rede do navegador" status={online ? 'ok' : 'fail'} detail={online ? 'online' : 'offline'} />
            <Row label="Auth endpoint" status={authStatus} detail={authDetail} />
            <Row label="REST endpoint" status={restStatus} detail={restDetail} />
            <Row
              label="Service workers"
              status={swCount === null ? 'idle' : swCount === 0 ? 'ok' : 'fail'}
              detail={swCount === null ? '' : `${swCount} ativo(s)`}
            />
            <Row
              label="Caches PWA"
              status={cacheCount === null ? 'idle' : cacheCount === 0 ? 'ok' : 'fail'}
              detail={cacheCount === null ? '' : `${cacheCount}`}
            />
            {latency !== null && (
              <Row label="Latência auth" status="ok" detail={`${latency}ms`} />
            )}
          </div>

          <div className="text-[10px] font-mono text-muted-foreground break-all bg-background/60 p-2 rounded border">
            {SUPABASE_URL}/auth/v1/token
          </div>

          {anyFail && (
            <div className="text-xs bg-destructive/10 text-destructive rounded p-2 space-y-1">
              <p className="font-semibold flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Possíveis causas</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Firewall/VPN corporativa bloqueando <span className="font-mono">*.supabase.co</span></li>
                <li>Extensão do navegador (adblock, antivírus, privacidade)</li>
                <li>Service worker / cache PWA com versão antiga</li>
                <li>Conexão instável ou DNS bloqueado</li>
                <li>Data/hora do dispositivo incorreta (invalida TLS)</li>
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={runChecks}>
              <RefreshCw className="h-3 w-3 mr-1" /> Testar novamente
            </Button>
            {(swCount ?? 0) + (cacheCount ?? 0) > 0 && (
              <Button type="button" size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={clearCaches}>
                Limpar cache
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
