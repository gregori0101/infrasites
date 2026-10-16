CREATE TABLE public.monitor_eps_access_logs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 3 AND 120),
 accessed_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.monitor_eps_access_logs TO service_role;
ALTER TABLE public.monitor_eps_access_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.monitor_eps_sessions (
 token_hash text PRIMARY KEY,
 access_id uuid NOT NULL REFERENCES public.monitor_eps_access_logs(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.monitor_eps_sessions TO service_role;
ALTER TABLE public.monitor_eps_sessions ENABLE ROW LEVEL SECURITY;
CREATE INDEX monitor_eps_sessions_expiry_idx ON public.monitor_eps_sessions(expires_at);

CREATE TABLE public.monitor_eps_login_attempts (
 client_hash text PRIMARY KEY,
 attempts integer NOT NULL DEFAULT 1,
 window_started_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.monitor_eps_login_attempts TO service_role;
ALTER TABLE public.monitor_eps_login_attempts ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION public.monitor_eps_allow_login(p_client_hash text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer;
BEGIN
 INSERT INTO public.monitor_eps_login_attempts(client_hash) VALUES (p_client_hash)
 ON CONFLICT (client_hash) DO UPDATE SET
 attempts = CASE WHEN monitor_eps_login_attempts.window_started_at < now() - interval '15 minutes' THEN 1 ELSE monitor_eps_login_attempts.attempts + 1 END,
 window_started_at = CASE WHEN monitor_eps_login_attempts.window_started_at < now() - interval '15 minutes' THEN now() ELSE monitor_eps_login_attempts.window_started_at END
 RETURNING attempts INTO n;
 RETURN n <= 10;
END;
$$;
REVOKE ALL ON FUNCTION public.monitor_eps_allow_login(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.monitor_eps_allow_login(text) TO service_role;
COMMENT ON TABLE public.monitor_eps_access_logs IS 'EPS monitoring entry history; service-role-only, no client access.';
COMMENT ON TABLE public.monitor_eps_sessions IS 'Hashed opaque EPS sessions; never grant browser roles access.';