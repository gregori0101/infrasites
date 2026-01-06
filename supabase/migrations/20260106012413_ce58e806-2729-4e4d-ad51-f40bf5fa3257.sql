-- Create storage bucket for report photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-photos', 'report-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow public read access
CREATE POLICY "Public read access for report photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'report-photos');

-- Create policy to allow anonymous uploads (for now, can be restricted later)
CREATE POLICY "Allow anonymous uploads to report photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'report-photos');

-- Create policy to allow anonymous updates
CREATE POLICY "Allow anonymous updates to report photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'report-photos');

-- Create policy to allow anonymous deletes
CREATE POLICY "Allow anonymous deletes to report photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'report-photos');