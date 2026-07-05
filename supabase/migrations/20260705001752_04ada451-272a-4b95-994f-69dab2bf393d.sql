-- 1) Revoke EXECUTE from authenticated on trigger/internal SECURITY DEFINER functions
-- (they run as triggers and must not be callable directly by signed-in users)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated, anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_fg_new_user() FROM authenticated, anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_report_operadora() FROM authenticated, anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_site_assignment_updated_at() FROM authenticated, anon, PUBLIC;

-- Note: is_admin, has_role, is_approved, get_user_role remain EXECUTE-able because
-- they are referenced from RLS policy expressions, which are evaluated as the
-- querying role (authenticated). Revoking would break every policy that uses them.
-- get_latest_report_for_prefill and log_activity are legitimate RPCs called by the app.

-- 2) fg_profiles: allow admins and gestors to view all profiles
CREATE POLICY "Admins and gestors can view all fg_profiles"
ON public.fg_profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'administrador')
  OR public.has_role(auth.uid(), 'gestor')
);

-- 3) fotos-reparos storage: explicit UPDATE policy scoped to uploader folder
CREATE POLICY "Users can update their own fotos-reparos files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'fotos-reparos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'fotos-reparos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);