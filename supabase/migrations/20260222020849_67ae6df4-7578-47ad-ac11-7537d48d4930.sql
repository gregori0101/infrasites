
-- Tabela de logs de atividade
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  details jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Somente admins podem ler
CREATE POLICY "Admins can view logs"
  ON public.activity_logs FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Funcao segura para inserir logs (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.log_activity(
  _action text,
  _target_type text,
  _target_id text DEFAULT NULL,
  _details jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_logs (user_id, action, target_type, target_id, details)
  VALUES (auth.uid(), _action, _target_type, _target_id, _details);
END;
$$;

-- Index para performance
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs (created_at DESC);
CREATE INDEX idx_activity_logs_action ON public.activity_logs (action);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs (user_id);
