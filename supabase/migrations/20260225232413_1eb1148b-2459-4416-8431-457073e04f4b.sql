
-- Create storage bucket for repair photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos-reparos', 'fotos-reparos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for fotos-reparos bucket
CREATE POLICY "Authenticated users can upload fotos-reparos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'fotos-reparos');

CREATE POLICY "Anyone can view fotos-reparos" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'fotos-reparos');

CREATE POLICY "Users can delete own fotos-reparos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'fotos-reparos' AND (auth.uid()::text = (storage.foldername(name))[1]));
