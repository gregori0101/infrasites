
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO postgres, service_role, authenticated;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role AND approved = true)
$$;
CREATE OR REPLACE FUNCTION private.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'administrador' AND approved = true)
$$;
CREATE OR REPLACE FUNCTION private.is_approved(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND approved = true)
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_approved(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_approved(uuid) TO authenticated, service_role;

-- public tables
DROP POLICY IF EXISTS "Users can view reports based on role" ON public.reports;
DROP POLICY IF EXISTS "Users can update reports based on role" ON public.reports;
DROP POLICY IF EXISTS "Approved users can insert reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can delete reports" ON public.reports;
CREATE POLICY "Users can view reports based on role" ON public.reports FOR SELECT USING (private.has_role(auth.uid(),'administrador') OR private.has_role(auth.uid(),'gestor') OR user_id = auth.uid());
CREATE POLICY "Users can update reports based on role" ON public.reports FOR UPDATE USING (private.has_role(auth.uid(),'administrador') OR private.has_role(auth.uid(),'gestor') OR user_id = auth.uid());
CREATE POLICY "Approved users can insert reports" ON public.reports FOR INSERT WITH CHECK (private.is_approved(auth.uid()) AND user_id = auth.uid());
CREATE POLICY "Admins can delete reports" ON public.reports FOR DELETE USING (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Gestors can view all roles" ON public.user_roles;
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (private.is_admin(auth.uid()));
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (private.is_admin(auth.uid()));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (private.is_admin(auth.uid()));
CREATE POLICY "Gestors can view all roles" ON public.user_roles FOR SELECT USING (private.has_role(auth.uid(),'gestor'));

DROP POLICY IF EXISTS "Admins can manage sites" ON public.sites;
DROP POLICY IF EXISTS "Gestors can view sites" ON public.sites;
DROP POLICY IF EXISTS "Technicians can view sites" ON public.sites;
CREATE POLICY "Admins can manage sites" ON public.sites FOR ALL USING (private.has_role(auth.uid(),'administrador'));
CREATE POLICY "Gestors can view sites" ON public.sites FOR SELECT USING (private.has_role(auth.uid(),'gestor'));
CREATE POLICY "Technicians can view sites" ON public.sites FOR SELECT USING (private.has_role(auth.uid(),'tecnico') AND private.is_approved(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage assignments" ON public.site_assignments;
DROP POLICY IF EXISTS "Gestors can manage assignments" ON public.site_assignments;
CREATE POLICY "Admins can manage assignments" ON public.site_assignments FOR ALL USING (private.has_role(auth.uid(),'administrador'));
CREATE POLICY "Gestors can manage assignments" ON public.site_assignments FOR ALL USING (private.has_role(auth.uid(),'gestor'));

DROP POLICY IF EXISTS "Admins can view logs" ON public.activity_logs;
CREATE POLICY "Admins can view logs" ON public.activity_logs FOR SELECT USING (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Gestors and admins can manage audit orders" ON public.audit_orders;
CREATE POLICY "Gestors and admins can manage audit orders" ON public.audit_orders FOR ALL USING (private.has_role(auth.uid(),'administrador') OR private.has_role(auth.uid(),'gestor'));
DROP POLICY IF EXISTS "Gestors and admins can manage audit items" ON public.audit_order_items;
CREATE POLICY "Gestors and admins can manage audit items" ON public.audit_order_items FOR ALL USING (EXISTS (SELECT 1 FROM public.audit_orders WHERE audit_orders.id = audit_order_items.order_id AND (private.has_role(auth.uid(),'administrador') OR private.has_role(auth.uid(),'gestor'))));

DROP POLICY IF EXISTS "Approved users can insert reparos" ON public.reparos;
DROP POLICY IF EXISTS "Admins and gestors can view all reparos" ON public.reparos;
DROP POLICY IF EXISTS "Admins can manage all reparos" ON public.reparos;
CREATE POLICY "Approved users can insert reparos" ON public.reparos FOR INSERT WITH CHECK (private.is_approved(auth.uid()) AND usuario_id = auth.uid());
CREATE POLICY "Admins and gestors can view all reparos" ON public.reparos FOR SELECT USING (private.has_role(auth.uid(),'administrador') OR private.has_role(auth.uid(),'gestor'));
CREATE POLICY "Admins can manage all reparos" ON public.reparos FOR ALL USING (private.has_role(auth.uid(),'administrador'));

DROP POLICY IF EXISTS "Users can view photos of accessible reparos" ON public.fotos_reparo;
DROP POLICY IF EXISTS "Admins can manage all photos" ON public.fotos_reparo;
CREATE POLICY "Users can view photos of accessible reparos" ON public.fotos_reparo FOR SELECT USING (EXISTS (SELECT 1 FROM public.reparos r WHERE r.id = fotos_reparo.reparo_id AND (r.usuario_id = auth.uid() OR private.has_role(auth.uid(),'administrador') OR private.has_role(auth.uid(),'gestor'))));
CREATE POLICY "Admins can manage all photos" ON public.fotos_reparo FOR ALL USING (private.has_role(auth.uid(),'administrador'));

DROP POLICY IF EXISTS "Users can view revisoes of accessible reparos" ON public.revisoes_reparo;
DROP POLICY IF EXISTS "Authenticated users can insert revisoes" ON public.revisoes_reparo;
CREATE POLICY "Users can view revisoes of accessible reparos" ON public.revisoes_reparo FOR SELECT USING (EXISTS (SELECT 1 FROM public.reparos r WHERE r.id = revisoes_reparo.reparo_id AND (r.usuario_id = auth.uid() OR private.has_role(auth.uid(),'administrador') OR private.has_role(auth.uid(),'gestor'))));
CREATE POLICY "Authenticated users can insert revisoes" ON public.revisoes_reparo FOR INSERT WITH CHECK (private.is_approved(auth.uid()) AND usuario_id = auth.uid());

DROP POLICY IF EXISTS "Users can view atividades of accessible reparos" ON public.atividades_reparo;
DROP POLICY IF EXISTS "Authenticated users can insert atividades" ON public.atividades_reparo;
CREATE POLICY "Users can view atividades of accessible reparos" ON public.atividades_reparo FOR SELECT USING (EXISTS (SELECT 1 FROM public.reparos r WHERE r.id = atividades_reparo.reparo_id AND (r.usuario_id = auth.uid() OR private.has_role(auth.uid(),'administrador') OR private.has_role(auth.uid(),'gestor'))));
CREATE POLICY "Authenticated users can insert atividades" ON public.atividades_reparo FOR INSERT WITH CHECK (private.is_approved(auth.uid()) AND usuario_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage metas" ON public.metas_tecnico;
CREATE POLICY "Admins can manage metas" ON public.metas_tecnico FOR ALL USING (private.has_role(auth.uid(),'administrador') OR private.has_role(auth.uid(),'gestor'));

DROP POLICY IF EXISTS "Admins and gestors can view all fg_profiles" ON public.fg_profiles;
CREATE POLICY "Admins and gestors can view all fg_profiles" ON public.fg_profiles FOR SELECT USING (private.has_role(auth.uid(),'administrador') OR private.has_role(auth.uid(),'gestor'));

-- storage report-photos policies (all 4)
DROP POLICY IF EXISTS "Approved users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can read report photos" ON storage.objects;
DROP POLICY IF EXISTS "Owner can update report photos" ON storage.objects;
CREATE POLICY "Approved users can upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'report-photos' AND private.is_approved(auth.uid()));
CREATE POLICY "Admins can delete photos" ON storage.objects FOR DELETE USING (bucket_id = 'report-photos' AND private.is_admin(auth.uid()));
CREATE POLICY "Authenticated can read report photos" ON storage.objects FOR SELECT USING (bucket_id = 'report-photos' AND private.is_approved(auth.uid()));
CREATE POLICY "Owner can update report photos" ON storage.objects FOR UPDATE USING (bucket_id = 'report-photos' AND private.is_approved(auth.uid()) AND owner = auth.uid()) WITH CHECK (bucket_id = 'report-photos' AND owner = auth.uid());

-- fotos-reparos hardening (broad_read + broad_insert)
DROP POLICY IF EXISTS "Authenticated users can upload fotos-reparos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can read fotos-reparos" ON storage.objects;
CREATE POLICY "Users can upload own fotos-reparos" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'fotos-reparos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can read accessible fotos-reparos" ON storage.objects FOR SELECT
USING (
  bucket_id = 'fotos-reparos' AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR private.has_role(auth.uid(),'administrador')
    OR private.has_role(auth.uid(),'gestor')
  )
);

-- Drop legacy public helpers (now unreferenced)
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.is_approved(uuid);
