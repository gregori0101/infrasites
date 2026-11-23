DROP POLICY IF EXISTS "Users can see all forum posts" ON public.forum_posts;
CREATE POLICY "Users see own posts; staff see all" ON public.forum_posts
FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR private.has_role(auth.uid(), 'administrador'::app_role)
  OR private.has_role(auth.uid(), 'gestor'::app_role)
);