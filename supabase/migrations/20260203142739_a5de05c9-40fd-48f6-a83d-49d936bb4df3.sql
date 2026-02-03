-- Add missing columns for FCC installed URs (gab1..gab7)
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_fcc_qtd_ur_instaladas TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab2_fcc_qtd_ur_instaladas TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab3_fcc_qtd_ur_instaladas TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab4_fcc_qtd_ur_instaladas TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab5_fcc_qtd_ur_instaladas TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab6_fcc_qtd_ur_instaladas TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_fcc_qtd_ur_instaladas TEXT;