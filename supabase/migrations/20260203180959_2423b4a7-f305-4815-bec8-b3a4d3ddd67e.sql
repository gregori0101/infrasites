-- Add area_atuacao column to user_roles table
-- This field is optional and only applies to technicians
-- Values: 'PI' (Planta Interna) or 'REDE' (Rede Externa)

ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS area_atuacao TEXT DEFAULT NULL;

-- Add a comment explaining the column
COMMENT ON COLUMN public.user_roles.area_atuacao IS 'Área de atuação do técnico: PI (Planta Interna) ou REDE (Rede Externa)';