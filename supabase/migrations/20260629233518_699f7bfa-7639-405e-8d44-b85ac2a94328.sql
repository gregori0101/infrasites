
-- 1) Update handle_new_user to read operadora & lgpd from auth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
  meta jsonb;
  v_operadora text;
  v_lgpd boolean;
BEGIN
  meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  v_operadora := COALESCE(meta->>'operadora', 'VIVO');
  IF v_operadora NOT IN ('VIVO','TEL') THEN
    v_operadora := 'VIVO';
  END IF;
  v_lgpd := COALESCE((meta->>'lgpd_consent')::boolean, false);

  SELECT COUNT(*) INTO user_count FROM public.user_roles;

  IF user_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role, approved, approved_at, operadora, lgpd_consent, lgpd_consent_at)
    VALUES (NEW.id, 'administrador', true, now(), v_operadora, v_lgpd,
            CASE WHEN v_lgpd THEN now() ELSE NULL END);
  ELSE
    INSERT INTO public.user_roles (user_id, role, approved, operadora, lgpd_consent, lgpd_consent_at)
    VALUES (NEW.id, 'tecnico', false, v_operadora, v_lgpd,
            CASE WHEN v_lgpd THEN now() ELSE NULL END);
  END IF;

  RETURN NEW;
END;
$$;

-- 2) fg_profiles: restrict SELECT to own profile
DROP POLICY IF EXISTS "Users can view all profiles" ON public.fg_profiles;
CREATE POLICY "Users can view own profile"
  ON public.fg_profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- 3) activity_logs: explicit deny direct client INSERT (server-side via SECURITY DEFINER only)
DROP POLICY IF EXISTS "Deny direct insert to logs" ON public.activity_logs;
CREATE POLICY "Deny direct insert to logs"
  ON public.activity_logs
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (false);

-- 4) Lock down SECURITY DEFINER function execution
-- Trigger functions: not callable from API at all
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_fg_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_report_operadora() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_site_assignment_updated_at() FROM PUBLIC, anon, authenticated;

-- RPC functions: revoke from anon, keep for authenticated
REVOKE EXECUTE ON FUNCTION public.get_latest_report_for_prefill(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_latest_report_for_prefill(text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.log_activity(text, text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_activity(text, text, text, jsonb) TO authenticated;

-- Policy-helpers: revoke from anon (still usable in policies)
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_approved(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;

-- 5) Storage policies hardening
-- report-photos: restrict SELECT to authenticated, add ownership on UPDATE/DELETE
DROP POLICY IF EXISTS "Public read access for report photos" ON storage.objects;
CREATE POLICY "Authenticated can read report photos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'report-photos' AND public.is_approved(auth.uid()));

DROP POLICY IF EXISTS "Approved users can update photos" ON storage.objects;
CREATE POLICY "Owner can update report photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'report-photos'
    AND public.is_approved(auth.uid())
    AND owner = auth.uid()
  )
  WITH CHECK (
    bucket_id = 'report-photos'
    AND owner = auth.uid()
  );

-- fotos-reparos: restrict SELECT to authenticated only (was anonymous)
DROP POLICY IF EXISTS "Anyone can view fotos-reparos" ON storage.objects;
CREATE POLICY "Authenticated can read fotos-reparos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'fotos-reparos');

-- 6) Realtime: drop reparos from publication to prevent broad channel subscription
ALTER PUBLICATION supabase_realtime DROP TABLE public.reparos;
