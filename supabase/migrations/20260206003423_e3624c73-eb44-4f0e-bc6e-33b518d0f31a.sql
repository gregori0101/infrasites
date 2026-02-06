-- Add new energia fields
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS energia_fabricante_outra text,
ADD COLUMN IF NOT EXISTS energia_protegido_gradil text,
ADD COLUMN IF NOT EXISTS energia_protegido_cadeado text,
ADD COLUMN IF NOT EXISTS energia_disjuntor_entrada integer,
ADD COLUMN IF NOT EXISTS energia_disjuntor_qdca integer;

-- Add new GMG fields
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS gmg_alarme_ativo text,
ADD COLUMN IF NOT EXISTS gmg_foto_alarme text;