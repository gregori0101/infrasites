-- Add missing columns to reports table

-- Gabinete ativo flag (for all 7 gabinetes)
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_ativo text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab2_ativo text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab3_ativo text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab4_ativo text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab5_ativo text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab6_ativo text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_ativo text;

-- Energia fields
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS energia_tipo_quadro text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS energia_fabricante text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS energia_potencia_kva integer;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS energia_tensao_entrada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS energia_transformador_ok text;