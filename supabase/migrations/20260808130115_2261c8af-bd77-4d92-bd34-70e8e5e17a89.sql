CREATE TABLE public.vandalismo_vistorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  site_code text NOT NULL,
  operadora text,
  descricao text NOT NULL DEFAULT '',
  latitude double precision,
  longitude double precision,
  endereco text,
  bo_url text,
  bo_nome text,
  tecnico text,
  status text NOT NULL DEFAULT 'concluido',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.vandalismo_fotos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vistoria_id uuid NOT NULL REFERENCES public.vandalismo_vistorias(id) ON DELETE CASCADE,
  categoria text NOT NULL DEFAULT 'ocorrido',
  url text NOT NULL,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.vandalismo_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vistoria_id uuid NOT NULL REFERENCES public.vandalismo_vistorias(id) ON DELETE CASCADE,
  item_key text NOT NULL,
  rotulo text NOT NULL,
  vulneravel boolean NOT NULL DEFAULT false,
  fotos jsonb NOT NULL DEFAULT '[]'::jsonb,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (vistoria_id, item_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vandalismo_vistorias TO authenticated;
GRANT ALL ON public.vandalismo_vistorias TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vandalismo_fotos TO authenticated;
GRANT ALL ON public.vandalismo_fotos TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vandalismo_itens TO authenticated;
GRANT ALL ON public.vandalismo_itens TO service_role;

ALTER TABLE public.vandalismo_vistorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vandalismo_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vandalismo_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vv_select" ON public.vandalismo_vistorias FOR SELECT TO authenticated
USING (user_id = auth.uid() OR private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "vv_insert" ON public.vandalismo_vistorias FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND private.is_approved(auth.uid()));

CREATE POLICY "vv_update" ON public.vandalismo_vistorias FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'gestor'::app_role))
WITH CHECK (user_id = auth.uid() OR private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "vv_delete" ON public.vandalismo_vistorias FOR DELETE TO authenticated
USING (user_id = auth.uid() OR private.is_admin(auth.uid()));

CREATE POLICY "vf_all" ON public.vandalismo_fotos FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.vandalismo_vistorias v WHERE v.id = vistoria_id
  AND (v.user_id = auth.uid() OR private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'gestor'::app_role))))
WITH CHECK (EXISTS (SELECT 1 FROM public.vandalismo_vistorias v WHERE v.id = vistoria_id
  AND (v.user_id = auth.uid() OR private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'gestor'::app_role))));

CREATE POLICY "vi_all" ON public.vandalismo_itens FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.vandalismo_vistorias v WHERE v.id = vistoria_id
  AND (v.user_id = auth.uid() OR private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'gestor'::app_role))))
WITH CHECK (EXISTS (SELECT 1 FROM public.vandalismo_vistorias v WHERE v.id = vistoria_id
  AND (v.user_id = auth.uid() OR private.is_admin(auth.uid()) OR private.has_role(auth.uid(), 'gestor'::app_role))));

CREATE INDEX idx_vv_user ON public.vandalismo_vistorias (user_id);
CREATE INDEX idx_vv_site ON public.vandalismo_vistorias (site_code);
CREATE INDEX idx_vv_created ON public.vandalismo_vistorias (created_at DESC);
CREATE INDEX idx_vf_vistoria ON public.vandalismo_fotos (vistoria_id);
CREATE INDEX idx_vi_vistoria ON public.vandalismo_itens (vistoria_id);

CREATE TRIGGER trg_vv_updated_at BEFORE UPDATE ON public.vandalismo_vistorias
FOR EACH ROW EXECUTE FUNCTION public.update_site_assignment_updated_at();