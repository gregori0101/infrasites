
-- Create profiles table for Fiber Guardian module
CREATE TABLE IF NOT EXISTS public.fg_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  avatar_url text,
  criado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fg_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.fg_profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile" ON public.fg_profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.fg_profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_fg_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.fg_profiles (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', ''), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create reparos table
CREATE TABLE IF NOT EXISTS public.reparos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  ta_titulo text NOT NULL,
  trecho text,
  causa text NOT NULL DEFAULT 'causa_desconhecida',
  latitude double precision,
  longitude double precision,
  status text NOT NULL DEFAULT 'pendente',
  conclusao_ta text NOT NULL DEFAULT 'pendente',
  categoria text NOT NULL DEFAULT 'manutencao',
  tipo_rede text,
  observacoes text,
  observacao_prevencao text,
  observacao_definitivo text,
  tecnicos_reparo text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  sincronizado boolean NOT NULL DEFAULT true,
  inicio_trabalho timestamptz,
  fim_trabalho timestamptz,
  email_enviado boolean NOT NULL DEFAULT false,
  email_enviado_em timestamptz,
  rnc_aplicada boolean NOT NULL DEFAULT false,
  rnc_aplicada_em timestamptz,
  rnc_observacao text,
  caixa_bomba boolean NOT NULL DEFAULT false,
  prazo_vistoria date
);

ALTER TABLE public.reparos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and gestors can view all reparos" ON public.reparos
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'administrador') OR has_role(auth.uid(), 'gestor'));

CREATE POLICY "Technicians can view own reparos" ON public.reparos
  FOR SELECT TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "Approved users can insert reparos" ON public.reparos
  FOR INSERT TO authenticated
  WITH CHECK (is_approved(auth.uid()) AND usuario_id = auth.uid());

CREATE POLICY "Admins can manage all reparos" ON public.reparos
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'administrador'));

CREATE POLICY "Technicians can update own reparos" ON public.reparos
  FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid());

-- Create fotos_reparo table
CREATE TABLE IF NOT EXISTS public.fotos_reparo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reparo_id uuid NOT NULL REFERENCES public.reparos(id) ON DELETE CASCADE,
  tipo_foto text NOT NULL DEFAULT 'caixa_emenda',
  titulo text,
  caminho_arquivo text NOT NULL,
  ordem integer NOT NULL DEFAULT 0,
  criado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fotos_reparo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view photos of accessible reparos" ON public.fotos_reparo
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reparos r WHERE r.id = fotos_reparo.reparo_id
    AND (r.usuario_id = auth.uid() OR has_role(auth.uid(), 'administrador') OR has_role(auth.uid(), 'gestor'))
  ));

CREATE POLICY "Users can insert photos for own reparos" ON public.fotos_reparo
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.reparos r WHERE r.id = fotos_reparo.reparo_id AND r.usuario_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all photos" ON public.fotos_reparo
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'administrador'));

CREATE POLICY "Users can delete own photos" ON public.fotos_reparo
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reparos r WHERE r.id = fotos_reparo.reparo_id AND r.usuario_id = auth.uid()
  ));

-- Create revisoes_reparo table
CREATE TABLE IF NOT EXISTS public.revisoes_reparo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reparo_id uuid NOT NULL REFERENCES public.reparos(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL,
  mensagem text NOT NULL,
  tipo text NOT NULL DEFAULT 'admin_comentario',
  criado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.revisoes_reparo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view revisoes of accessible reparos" ON public.revisoes_reparo
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reparos r WHERE r.id = revisoes_reparo.reparo_id
    AND (r.usuario_id = auth.uid() OR has_role(auth.uid(), 'administrador') OR has_role(auth.uid(), 'gestor'))
  ));

CREATE POLICY "Authenticated users can insert revisoes" ON public.revisoes_reparo
  FOR INSERT TO authenticated
  WITH CHECK (is_approved(auth.uid()) AND usuario_id = auth.uid());

-- Create atividades_reparo table
CREATE TABLE IF NOT EXISTS public.atividades_reparo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reparo_id uuid NOT NULL REFERENCES public.reparos(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL,
  tipo text NOT NULL,
  descricao text,
  criado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.atividades_reparo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view atividades of accessible reparos" ON public.atividades_reparo
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reparos r WHERE r.id = atividades_reparo.reparo_id
    AND (r.usuario_id = auth.uid() OR has_role(auth.uid(), 'administrador') OR has_role(auth.uid(), 'gestor'))
  ));

CREATE POLICY "Authenticated users can insert atividades" ON public.atividades_reparo
  FOR INSERT TO authenticated
  WITH CHECK (is_approved(auth.uid()) AND usuario_id = auth.uid());

-- Create metas_tecnico table
CREATE TABLE IF NOT EXISTS public.metas_tecnico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mes date NOT NULL,
  meta_reparos integer NOT NULL DEFAULT 0,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, mes)
);

ALTER TABLE public.metas_tecnico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage metas" ON public.metas_tecnico
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'administrador') OR has_role(auth.uid(), 'gestor'));

CREATE POLICY "Users can view own metas" ON public.metas_tecnico
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Enable realtime for reparos
ALTER PUBLICATION supabase_realtime ADD TABLE public.reparos;
