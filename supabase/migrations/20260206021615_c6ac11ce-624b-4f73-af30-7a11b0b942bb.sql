-- Add missing column for transformer power
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS energia_potencia_transformador TEXT DEFAULT NULL;

COMMENT ON COLUMN public.reports.energia_potencia_transformador IS 'Power rating of the transformer (kVA)';