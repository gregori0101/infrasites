-- Add operadora column to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN operadora text DEFAULT 'VIVO' CHECK (operadora IN ('VIVO', 'TEL'));