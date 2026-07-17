
-- Move get_user_role to private
CREATE OR REPLACE FUNCTION private.get_user_role(_user_id uuid)
RETURNS public.app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;
REVOKE ALL ON FUNCTION private.get_user_role(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.get_user_role(uuid) TO authenticated, service_role;
DROP FUNCTION IF EXISTS public.get_user_role(uuid);

-- Allow authenticated users to insert their own activity_log entries directly,
-- so we can drop the SECURITY DEFINER log_activity RPC.
DROP POLICY IF EXISTS "Deny direct insert to logs" ON public.activity_logs;
CREATE POLICY "Users can insert own logs" ON public.activity_logs
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP FUNCTION IF EXISTS public.log_activity(text, text, text, jsonb);
