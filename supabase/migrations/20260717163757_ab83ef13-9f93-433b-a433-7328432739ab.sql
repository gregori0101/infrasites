ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS torre_esteiramento_horizontal TEXT,
  ADD COLUMN IF NOT EXISTS torre_foto_esteiramento_horizontal TEXT,
  ADD COLUMN IF NOT EXISTS torre_esteiramento_vertical TEXT,
  ADD COLUMN IF NOT EXISTS torre_foto_esteiramento_vertical TEXT;