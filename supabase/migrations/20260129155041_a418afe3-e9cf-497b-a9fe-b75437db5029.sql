-- Add operadora column to reports table
ALTER TABLE public.reports 
ADD COLUMN operadora text DEFAULT 'VIVO';