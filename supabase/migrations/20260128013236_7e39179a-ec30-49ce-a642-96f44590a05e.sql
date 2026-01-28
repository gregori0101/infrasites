-- Add 'colada' column for each battery bank in each gabinete
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_bat1_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_bat2_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_bat3_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_bat4_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_bat5_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_bat6_colada text;

ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab2_bat1_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab2_bat2_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab2_bat3_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab2_bat4_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab2_bat5_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab2_bat6_colada text;

ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab3_bat1_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab3_bat2_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab3_bat3_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab3_bat4_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab3_bat5_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab3_bat6_colada text;

ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab4_bat1_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab4_bat2_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab4_bat3_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab4_bat4_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab4_bat5_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab4_bat6_colada text;

ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab5_bat1_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab5_bat2_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab5_bat3_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab5_bat4_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab5_bat5_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab5_bat6_colada text;

ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab6_bat1_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab6_bat2_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab6_bat3_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab6_bat4_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab6_bat5_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab6_bat6_colada text;

ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_bat1_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_bat2_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_bat3_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_bat4_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_bat5_colada text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_bat6_colada text;