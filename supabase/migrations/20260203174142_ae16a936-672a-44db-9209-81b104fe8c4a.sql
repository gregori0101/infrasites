-- Update fibra_foto_subidas_laterais to store JSON array of photos (similar to observacao_foto_url)
-- First, migrate existing single URLs to JSON array format
UPDATE public.reports 
SET fibra_foto_subidas_laterais = CASE 
  WHEN fibra_foto_subidas_laterais IS NOT NULL AND fibra_foto_subidas_laterais != '' 
  THEN '["' || fibra_foto_subidas_laterais || '"]'
  ELSE NULL
END
WHERE fibra_foto_subidas_laterais IS NOT NULL 
  AND fibra_foto_subidas_laterais NOT LIKE '[%';

-- Also update caixas passagem and caixas subterraneas to support multiple photos
UPDATE public.reports 
SET fibra_foto_caixas_passagem = CASE 
  WHEN fibra_foto_caixas_passagem IS NOT NULL AND fibra_foto_caixas_passagem != '' 
  THEN '["' || fibra_foto_caixas_passagem || '"]'
  ELSE NULL
END
WHERE fibra_foto_caixas_passagem IS NOT NULL 
  AND fibra_foto_caixas_passagem NOT LIKE '[%';

UPDATE public.reports 
SET fibra_foto_caixas_subterraneas = CASE 
  WHEN fibra_foto_caixas_subterraneas IS NOT NULL AND fibra_foto_caixas_subterraneas != '' 
  THEN '["' || fibra_foto_caixas_subterraneas || '"]'
  ELSE NULL
END
WHERE fibra_foto_caixas_subterraneas IS NOT NULL 
  AND fibra_foto_caixas_subterraneas NOT LIKE '[%';