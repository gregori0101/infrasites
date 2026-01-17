-- Add photo columns for all gabinetes (FCC, baterias, climatização)
-- Gabinete 1
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_fcc_foto_panoramica text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_fcc_foto_painel text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_bat_foto text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_clima_foto_ar1 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_clima_foto_ar2 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_clima_foto_ar3 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_clima_foto_ar4 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_clima_foto_condensador text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_clima_foto_evaporador text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_clima_foto_controlador text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab1_foto_panoramica text;

-- Gabinete 2
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab2_fcc_foto_panoramica text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab2_fcc_foto_painel text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab2_bat_foto text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab2_clima_foto_ar1 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab2_clima_foto_ar2 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab2_clima_foto_ar3 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab2_clima_foto_ar4 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab2_clima_foto_condensador text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab2_clima_foto_evaporador text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab2_clima_foto_controlador text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab2_foto_panoramica text;

-- Gabinete 3
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab3_fcc_foto_panoramica text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab3_fcc_foto_painel text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab3_bat_foto text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab3_clima_foto_ar1 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab3_clima_foto_ar2 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab3_clima_foto_ar3 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab3_clima_foto_ar4 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab3_clima_foto_condensador text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab3_clima_foto_evaporador text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab3_clima_foto_controlador text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab3_foto_panoramica text;

-- Gabinete 4
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab4_fcc_foto_panoramica text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab4_fcc_foto_painel text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab4_bat_foto text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab4_clima_foto_ar1 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab4_clima_foto_ar2 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab4_clima_foto_ar3 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab4_clima_foto_ar4 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab4_clima_foto_condensador text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab4_clima_foto_evaporador text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab4_clima_foto_controlador text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab4_foto_panoramica text;

-- Gabinete 5
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab5_fcc_foto_panoramica text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab5_fcc_foto_painel text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab5_bat_foto text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab5_clima_foto_ar1 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab5_clima_foto_ar2 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab5_clima_foto_ar3 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab5_clima_foto_ar4 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab5_clima_foto_condensador text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab5_clima_foto_evaporador text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab5_clima_foto_controlador text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab5_foto_panoramica text;

-- Gabinete 6
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab6_fcc_foto_panoramica text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab6_fcc_foto_painel text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab6_bat_foto text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab6_clima_foto_ar1 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab6_clima_foto_ar2 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab6_clima_foto_ar3 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab6_clima_foto_ar4 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab6_clima_foto_condensador text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab6_clima_foto_evaporador text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab6_clima_foto_controlador text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab6_foto_panoramica text;

-- Gabinete 7
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_fcc_foto_panoramica text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_fcc_foto_painel text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_bat_foto text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_clima_foto_ar1 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_clima_foto_ar2 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_clima_foto_ar3 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_clima_foto_ar4 text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_clima_foto_condensador text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_clima_foto_evaporador text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_clima_foto_controlador text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS gab7_foto_panoramica text;

-- Energia photos
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS energia_foto_transformador text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS energia_foto_quadro_geral text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS energia_foto_placa text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS energia_foto_cabos text;

-- Torre photos
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS torre_foto_ninhos text;

-- Assinatura digital
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS assinatura_digital text;