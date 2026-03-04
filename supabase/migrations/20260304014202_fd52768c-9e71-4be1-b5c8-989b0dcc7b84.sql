
DO $$
DECLARE
  g integer;
  b integer;
  prefix text;
BEGIN
  FOR g IN 1..7 LOOP
    prefix := 'gab' || g;
    FOR b IN 7..12 LOOP
      EXECUTE format('ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS %I text', prefix || '_bat' || b || '_tipo');
      EXECUTE format('ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS %I text', prefix || '_bat' || b || '_fabricante');
      EXECUTE format('ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS %I text', prefix || '_bat' || b || '_capacidade');
      EXECUTE format('ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS %I text', prefix || '_bat' || b || '_data_fabricacao');
      EXECUTE format('ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS %I text', prefix || '_bat' || b || '_estado');
      EXECUTE format('ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS %I text', prefix || '_bat' || b || '_colada');
      EXECUTE format('ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS %I text', prefix || '_bat' || b || '_com_gradil');
    END LOOP;
  END LOOP;
END $$;
