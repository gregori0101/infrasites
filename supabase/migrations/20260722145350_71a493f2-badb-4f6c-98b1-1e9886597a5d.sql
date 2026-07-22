
DO $$
DECLARE
  r RECORD;
  rj JSONB;
  i INT;
  j INT;
  new_ia JSONB;
  key TEXT;
  updates INT := 0;
BEGIN
  FOR r IN SELECT * FROM reports LOOP
    rj := to_jsonb(r);
    new_ia := COALESCE(r.baterias_tipo_ia, '{}'::jsonb);
    FOR i IN 1..7 LOOP
      IF (rj ->> ('gab' || i || '_bat_foto')) IS NOT NULL THEN CONTINUE; END IF;
      FOR j IN 1..12 LOOP
        IF (rj ->> ('gab' || i || '_bat' || j || '_tipo')) IS NULL THEN CONTINUE; END IF;
        key := 'gab' || (i-1) || '_banco' || (j-1);
        IF new_ia ? key THEN CONTINUE; END IF;
        new_ia := new_ia || jsonb_build_object(key, jsonb_build_object('tipo','INDETERMINADO','confianca', null,'erro','sem_foto'));
      END LOOP;
    END LOOP;
    IF new_ia <> COALESCE(r.baterias_tipo_ia, '{}'::jsonb) THEN
      UPDATE reports SET baterias_tipo_ia = new_ia WHERE id = r.id;
      updates := updates + 1;
    END IF;
  END LOOP;
  RAISE NOTICE 'Updated % reports', updates;
END $$;
