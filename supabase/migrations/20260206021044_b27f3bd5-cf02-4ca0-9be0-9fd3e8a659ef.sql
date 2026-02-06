-- Add missing columns for Torre photos (aterramento and zeladoria)
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS torre_foto_aterramento TEXT DEFAULT NULL;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS torre_foto_zeladoria TEXT DEFAULT NULL;

-- Add missing columns for Energia UC (Unidade Consumidora)
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS energia_unidade_consumidora TEXT DEFAULT NULL;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS energia_foto_relogio TEXT DEFAULT NULL;

COMMENT ON COLUMN public.reports.torre_foto_aterramento IS 'Photo URL of the grounding system inspection';
COMMENT ON COLUMN public.reports.torre_foto_zeladoria IS 'Photo URL of the housekeeping/maintenance inspection';
COMMENT ON COLUMN public.reports.energia_unidade_consumidora IS 'Consumer unit number (UC)';
COMMENT ON COLUMN public.reports.energia_foto_relogio IS 'Photo URL of the electricity meter';