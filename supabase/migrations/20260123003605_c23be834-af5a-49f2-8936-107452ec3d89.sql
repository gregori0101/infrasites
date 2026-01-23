-- Add fiber optics photo columns to reports table
ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS fibra_abord1_foto text,
ADD COLUMN IF NOT EXISTS fibra_abord2_foto text,
ADD COLUMN IF NOT EXISTS fibra_foto_caixas_passagem text,
ADD COLUMN IF NOT EXISTS fibra_foto_caixas_subterraneas text,
ADD COLUMN IF NOT EXISTS fibra_foto_subidas_laterais text,
ADD COLUMN IF NOT EXISTS fibra_dgo1_foto text,
ADD COLUMN IF NOT EXISTS fibra_dgo1_cordoes_foto text,
ADD COLUMN IF NOT EXISTS fibra_dgo2_foto text,
ADD COLUMN IF NOT EXISTS fibra_dgo2_cordoes_foto text,
ADD COLUMN IF NOT EXISTS fibra_dgo3_foto text,
ADD COLUMN IF NOT EXISTS fibra_dgo3_cordoes_foto text,
ADD COLUMN IF NOT EXISTS fibra_dgo4_foto text,
ADD COLUMN IF NOT EXISTS fibra_dgo4_cordoes_foto text;