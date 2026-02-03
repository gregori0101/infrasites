-- Add missing columns for battery gradil field (6 batteries per 7 cabinets)
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_bat1_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_bat2_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_bat3_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_bat4_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_bat5_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_bat6_com_gradil text;

ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab2_bat1_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab2_bat2_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab2_bat3_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab2_bat4_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab2_bat5_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab2_bat6_com_gradil text;

ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab3_bat1_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab3_bat2_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab3_bat3_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab3_bat4_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab3_bat5_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab3_bat6_com_gradil text;

ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab4_bat1_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab4_bat2_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab4_bat3_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab4_bat4_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab4_bat5_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab4_bat6_com_gradil text;

ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab5_bat1_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab5_bat2_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab5_bat3_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab5_bat4_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab5_bat5_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab5_bat6_com_gradil text;

ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab6_bat1_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab6_bat2_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab6_bat3_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab6_bat4_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab6_bat5_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab6_bat6_com_gradil text;

ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_bat1_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_bat2_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_bat3_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_bat4_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_bat5_com_gradil text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_bat6_com_gradil text;

-- Add missing tower protected fibers photo column
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS torre_foto_fibras_protegidas text;

-- Add GMG autonomy column if not exists
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gmg_autonomia integer;

-- Add GMG status column if not exists
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gmg_status text;