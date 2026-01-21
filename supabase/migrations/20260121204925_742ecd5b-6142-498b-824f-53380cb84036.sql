DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reports'
      AND policyname = 'Admins can delete reports'
  ) THEN
    CREATE POLICY "Admins can delete reports"
    ON public.reports
    FOR DELETE
    USING (is_admin(auth.uid()));
  END IF;
END $$;