CREATE POLICY "Gestors can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'gestor'::app_role));