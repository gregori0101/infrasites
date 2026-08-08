ALTER TABLE public.vandalismo_vistorias ADD COLUMN IF NOT EXISTS estado text;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vandalismo_vistorias TO authenticated;
GRANT ALL ON public.vandalismo_vistorias TO service_role;