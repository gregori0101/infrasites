CREATE OR REPLACE FUNCTION private.block_suspended_inspection_writes()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  RAISE EXCEPTION 'Gravações de vistorias e vandalismo suspensas.' USING ERRCODE = '42501';
END;
$function$;
REVOKE ALL ON FUNCTION private.block_suspended_inspection_writes() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.block_suspended_inspection_writes() TO service_role;

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vandalismo_vistorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vandalismo_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vandalismo_fotos ENABLE ROW LEVEL SECURITY;

ALTER POLICY "Users can view all reports" ON public.reports USING (private.is_approved(auth.uid()));
ALTER POLICY "Users can update all reports" ON public.reports
  USING (private.is_approved(auth.uid()) AND (user_id = auth.uid() OR private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'gestor'::public.app_role)))
  WITH CHECK (private.is_approved(auth.uid()) AND (user_id = auth.uid() OR private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'gestor'::public.app_role)));
ALTER POLICY vv_select_all ON public.vandalismo_vistorias USING (private.is_approved(auth.uid()));
ALTER POLICY vv_update_all ON public.vandalismo_vistorias
  USING (private.is_approved(auth.uid()) AND (user_id = auth.uid() OR private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'gestor'::public.app_role)))
  WITH CHECK (private.is_approved(auth.uid()) AND (user_id = auth.uid() OR private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'gestor'::public.app_role)));
ALTER POLICY vi_select_all ON public.vandalismo_itens USING (private.is_approved(auth.uid()));
ALTER POLICY vi_update_all ON public.vandalismo_itens
  USING (private.is_approved(auth.uid()) AND EXISTS (SELECT 1 FROM public.vandalismo_vistorias v WHERE v.id = vandalismo_itens.vistoria_id AND (v.user_id = auth.uid() OR private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'gestor'::public.app_role))))
  WITH CHECK (private.is_approved(auth.uid()) AND EXISTS (SELECT 1 FROM public.vandalismo_vistorias v WHERE v.id = vandalismo_itens.vistoria_id AND (v.user_id = auth.uid() OR private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'gestor'::public.app_role))));
ALTER POLICY vi_insert ON public.vandalismo_itens
  WITH CHECK (private.is_approved(auth.uid()) AND EXISTS (SELECT 1 FROM public.vandalismo_vistorias v WHERE v.id = vandalismo_itens.vistoria_id AND (v.user_id = auth.uid() OR private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'gestor'::public.app_role))));

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.reports, public.vandalismo_vistorias, public.vandalismo_itens, public.vandalismo_fotos FROM PUBLIC, anon, authenticated, service_role;

CREATE POLICY suspended_reports_writes ON public.reports AS RESTRICTIVE FOR ALL TO anon, authenticated USING (private.is_approved(auth.uid())) WITH CHECK (false);
CREATE POLICY suspended_vandalismo_vistorias_writes ON public.vandalismo_vistorias AS RESTRICTIVE FOR ALL TO anon, authenticated USING (private.is_approved(auth.uid())) WITH CHECK (false);
CREATE POLICY suspended_vandalismo_itens_writes ON public.vandalismo_itens AS RESTRICTIVE FOR ALL TO anon, authenticated USING (private.is_approved(auth.uid())) WITH CHECK (false);
CREATE POLICY suspended_vandalismo_fotos_writes ON public.vandalismo_fotos AS RESTRICTIVE FOR ALL TO anon, authenticated USING (private.is_approved(auth.uid())) WITH CHECK (false);

CREATE TRIGGER suspended_reports_writes BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON public.reports FOR EACH STATEMENT EXECUTE FUNCTION private.block_suspended_inspection_writes();
CREATE TRIGGER suspended_vandalismo_vistorias_writes BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON public.vandalismo_vistorias FOR EACH STATEMENT EXECUTE FUNCTION private.block_suspended_inspection_writes();
CREATE TRIGGER suspended_vandalismo_itens_writes BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON public.vandalismo_itens FOR EACH STATEMENT EXECUTE FUNCTION private.block_suspended_inspection_writes();
CREATE TRIGGER suspended_vandalismo_fotos_writes BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON public.vandalismo_fotos FOR EACH STATEMENT EXECUTE FUNCTION private.block_suspended_inspection_writes();