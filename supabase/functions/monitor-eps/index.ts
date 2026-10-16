import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { entrySchema, validMonitorPath } from './validation.ts';

const UPSTREAM = 'http://vivonorteapp.com';
const headers = { ...corsHeaders, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } });
async function digest(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}
async function matches(a: string, b: string) {
  const left = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(a));
  const right = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(b));
  return new Uint8Array(left).reduce((diff, byte, i) => diff | (byte ^ new Uint8Array(right)[i]), 0) === 0;
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  const backendUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const password = Deno.env.get('MONITOR_EPS_PASSWORD');
  if (!backendUrl || !serviceKey || !password) return json({ error: 'Entrada temporariamente indisponível.' }, 503);
  const db = createClient(backendUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const url = new URL(req.url);
  try {
    if (req.method === 'POST' && url.searchParams.get('action') === 'login') {
      if (Number(req.headers.get('content-length') || 0) > 4096) return json({ error: 'Dados inválidos.' }, 400);
      const raw = await req.text();
      if (raw.length > 4096) return json({ error: 'Dados inválidos.' }, 400);
      let body: unknown;
      try { body = JSON.parse(raw); } catch { return json({ error: 'Dados inválidos.' }, 400); }
      const parsed = entrySchema.safeParse(body);
      if (!parsed.success) return json({ error: 'Informe nome e sobrenome e a senha de acesso.' }, 400);
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
      const { data: allowed, error: limitError } = await db.rpc('monitor_eps_allow_login', { p_client_hash: await digest(ip) });
      if (limitError) return json({ error: 'Entrada temporariamente indisponível.' }, 503);
      if (!allowed) return json({ error: 'Muitas tentativas. Aguarde 15 minutos para tentar novamente.' }, 429);
      if (!await matches(parsed.data.password, password)) return json({ error: 'Senha de acesso incorreta.' }, 401);
      const token = crypto.randomUUID() + crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
      const { data: log, error: logError } = await db.from('monitor_eps_access_logs').insert({ full_name: parsed.data.fullName }).select('id').single();
      if (logError || !log) return json({ error: 'Não foi possível registrar a entrada. Tente novamente.' }, 503);
      const { error: sessionError } = await db.from('monitor_eps_sessions').insert({ token_hash: await digest(token), access_id: log.id, expires_at: expiresAt });
      if (sessionError) return json({ error: 'Não foi possível iniciar a sessão.' }, 503);
      return json({ token, expiresAt });
    }
    const token = url.searchParams.get('session') || req.headers.get('x-eps-session');
    if (!token || token.length !== 72) return json({ error: 'Entre para acessar o painel.' }, 401);
    const hash = await digest(token);
    const { data: session, error } = await db.from('monitor_eps_sessions').select('expires_at').eq('token_hash', hash).gt('expires_at', new Date().toISOString()).maybeSingle();
    if (error) return json({ error: 'Não foi possível verificar o acesso.' }, 503);
    if (!session) return json({ error: 'Sua sessão expirou. Entre novamente.' }, 401);
    if (req.method === 'DELETE') {
      const { error: revokeError } = await db.from('monitor_eps_sessions').delete().eq('token_hash', hash);
      return revokeError ? json({ error: 'Não foi possível encerrar a sessão.' }, 503) : json({ ok: true });
    }
    if (req.method !== 'GET') return json({ error: 'Método não permitido.' }, 405);
    if (url.searchParams.get('action') === 'check') return json({ ok: true });
    const path = url.searchParams.get('path') || '/';
    if (!validMonitorPath(path)) return json({ error: 'Endereço inválido.' }, 400);
    const target = new URL(path, UPSTREAM);
    if (target.origin !== UPSTREAM) return json({ error: 'Endereço inválido.' }, 400);
    const response = await fetch(target, { headers: { 'User-Agent': 'InfraSites-Monitor-Proxy' }, redirect: 'manual', signal: AbortSignal.timeout(25000) });
    if (response.status >= 300 && response.status < 400) return json({ error: 'O painel solicitou um endereço não permitido.' }, 502);
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    return new Response(await response.arrayBuffer(), { status: response.status, headers: { ...headers, 'Content-Type': contentType.includes('text/html') ? 'text/plain; charset=utf-8' : contentType } });
  } catch {
    return json({ error: 'Não foi possível carregar o painel. Tente novamente.' }, 502);
  }
});