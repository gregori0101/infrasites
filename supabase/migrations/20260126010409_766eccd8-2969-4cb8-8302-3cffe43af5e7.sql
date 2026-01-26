-- Add columns for abordagem 3 and 4 fiber optics data
ALTER TABLE public.reports 
  ADD COLUMN IF NOT EXISTS fibra_abord3_tipo text,
  ADD COLUMN IF NOT EXISTS fibra_abord3_descricao text,
  ADD COLUMN IF NOT EXISTS fibra_abord3_foto text,
  ADD COLUMN IF NOT EXISTS fibra_abord4_tipo text,
  ADD COLUMN IF NOT EXISTS fibra_abord4_descricao text,
  ADD COLUMN IF NOT EXISTS fibra_abord4_foto text;