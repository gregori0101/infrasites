-- Add municipio column to sites table
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS municipio text;