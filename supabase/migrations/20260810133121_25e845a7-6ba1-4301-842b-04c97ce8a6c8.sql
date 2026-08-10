-- Missing INSERT/DELETE policies on vandalismo_itens caused partial saves
DROP POLICY IF EXISTS vi_insert ON public.vandalismo_itens;
CREATE POLICY vi_insert ON public.vandalismo_itens
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.vandalismo_vistorias v WHERE v.id = vandalismo_itens.vistoria_id)
);

DROP POLICY IF EXISTS vi_delete ON public.vandalismo_itens;
CREATE POLICY vi_delete ON public.vandalismo_itens
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vandalismo_vistorias v
    WHERE v.id = vandalismo_itens.vistoria_id
      AND (v.user_id = auth.uid() OR private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'gestor'::app_role))
  )
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vandalismo_itens TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vandalismo_fotos TO authenticated;
GRANT ALL ON public.vandalismo_itens TO service_role;
GRANT ALL ON public.vandalismo_fotos TO service_role;