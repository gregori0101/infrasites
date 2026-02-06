-- Add column to store extra photos as JSON
-- This stores the fotosExtras map which contains arrays of photo URLs keyed by field identifier
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS fotos_extras JSONB DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.reports.fotos_extras IS 'JSON object mapping field keys to arrays of extra photo URLs. Example: {"gab1_ar1": ["url1", "url2"], "energia_transformador": ["url3"]}';