DO $$ DECLARE t text; BEGIN
FOREACH t IN ARRAY ARRAY['reports','vandalismo_vistorias','vandalismo_itens','vandalismo_fotos'] LOOP
  EXECUTE format('DROP TRIGGER IF EXISTS suspended_%s_writes ON public.%I', t, t);
  EXECUTE format('DROP POLICY IF EXISTS suspended_%s_writes ON public.%I', t, t);
  EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
  EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
END LOOP; END $$;