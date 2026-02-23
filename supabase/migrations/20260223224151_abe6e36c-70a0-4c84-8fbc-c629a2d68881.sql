-- Adicionar coluna de consentimento LGPD na tabela user_roles
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS lgpd_consent boolean NOT NULL DEFAULT false;
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS lgpd_consent_at timestamptz;

-- Garantir que user_roles.user_id tenha NOT NULL (já tem, mas reforçar)
-- Adicionar índice para performance em buscas por operadora
CREATE INDEX IF NOT EXISTS idx_reports_operadora ON public.reports (operadora);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports (user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles (user_id);

-- Reforçar senha mínima: adicionar validação na função de reset (edge function cuida)
-- Mas vamos garantir que logs não podem ser manipulados via INSERT direto
-- (logs são inseridos via SECURITY DEFINER function, então não precisam de INSERT policy no client)

-- Garantir imutabilidade dos logs: negar explicitamente UPDATE e DELETE
-- (Já não existem policies para UPDATE/DELETE, mas vamos reforçar com denial policies)
CREATE POLICY "No one can update logs" ON public.activity_logs FOR UPDATE USING (false);
CREATE POLICY "No one can delete logs" ON public.activity_logs FOR DELETE USING (false);