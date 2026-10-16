import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VivoLogo } from '@/components/ui/vivo-logo';
import { monitorEpsEntrySchema } from '@/lib/monitorEpsValidation';
import PainelMonitoramento from './PainelMonitoramento';

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/monitor-eps`;
const STORAGE_KEY = 'monitor-eps-session';

export default function MonitoramentoEPS() {
  const [token, setToken] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setToken(null);
  }, []);
  const expired = useCallback(() => {
    clearSession();
    setError('Sua sessão expirou. Entre novamente.');
  }, [clearSession]);

  useEffect(() => {
    let active = true;
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) { setChecking(false); return; }
    fetch(`${ENDPOINT}?action=check`, { headers: { 'x-eps-session': stored }, cache: 'no-store' })
      .then(res => { if (!active) return; if (res.ok) setToken(stored); else clearSession(); })
      .catch(() => { if (active) setError('Não foi possível verificar o acesso. Tente entrar novamente.'); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [clearSession]);

  useEffect(() => {
    if (!token) return;
    const timer = setInterval(() => {
      fetch(`${ENDPOINT}?action=check`, { headers: { 'x-eps-session': token }, cache: 'no-store' })
        .then(res => { if (res.status === 401) expired(); }).catch(() => {});
    }, 30000);
    return () => clearInterval(timer);
  }, [token, expired]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const parsed = monitorEpsEntrySchema.safeParse({ fullName, password });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message || 'Confira os dados.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${ENDPOINT}?action=login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data) });
      const data = await res.json();
      if (!res.ok || typeof data.token !== 'string') { setError(data.error || 'Não foi possível entrar.'); return; }
      sessionStorage.setItem(STORAGE_KEY, data.token);
      setPassword('');
      setToken(data.token);
    } catch { setError('Não foi possível conectar. Verifique sua conexão e tente novamente.'); }
    finally { setLoading(false); }
  };

  const logout = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(ENDPOINT, { method: 'DELETE', headers: { 'x-eps-session': token } });
      if (res.ok || res.status === 401) clearSession();
      else setError('Não foi possível sair. Tente novamente.');
    } catch { setError('Não foi possível sair. Verifique sua conexão.'); }
    finally { setLoading(false); }
  };

  if (checking) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (token) return <>
    <PainelMonitoramento proxyUrl={`${ENDPOINT}?session=${encodeURIComponent(token)}`} onUnauthorized={expired} />
    <Button variant="secondary" size="icon" className="fixed right-3 bottom-3 z-50 shadow-md" aria-label="Sair do monitoramento EPS" title="Sair" onClick={logout} disabled={loading}><LogOut className="h-4 w-4" /></Button>
    {error && <div role="alert" className="fixed bottom-16 right-3 z-50 max-w-xs bg-destructive text-destructive-foreground p-3 rounded-md text-sm">{error}</div>}
  </>;

  return <>
    <Helmet><title>Monitoramento EPS | InfraSites Vivo</title><meta name="description" content="Acesso restrito EPS ao monitoramento da rede Norte." /></Helmet>
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center space-y-4"><VivoLogo className="h-12 w-auto" /><CardTitle className="text-xl">Monitoramento EPS</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="eps-name">Nome e sobrenome</Label><Input id="eps-name" value={fullName} onChange={e => setFullName(e.target.value)} autoComplete="name" maxLength={120} required /></div>
            <div className="space-y-2"><Label htmlFor="eps-password">Senha de acesso</Label><Input id="eps-password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" maxLength={128} required /></div>
            {error && <div role="alert" className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}Entrar</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  </>;
}