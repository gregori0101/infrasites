-- Fix storage bucket security: require authentication for all operations

-- Drop anonymous policies that allow anyone to upload/update/delete
DROP POLICY IF EXISTS "Allow anonymous uploads to report photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous updates to report photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous deletes to report photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to report photos" ON storage.objects;

-- Drop any existing authenticated policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own photos" ON storage.objects;
DROP POLICY IF EXISTS "Approved users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Approved users can update photos" ON storage.objects;
DROP POLICY IF EXISTS "Approved users can delete photos" ON storage.objects;
DROP POLICY IF EXISTS "Approved users can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for report photos" ON storage.objects;

-- Keep bucket public for READ access (photos need to be viewable in reports/PDFs)
-- but restrict write operations to authenticated users
UPDATE storage.buckets SET public = true WHERE id = 'report-photos';

-- Create authenticated policies for write operations
-- Users must be approved to upload photos (same as report creation requirement)
CREATE POLICY "Approved users can upload photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'report-photos' AND
  is_approved(auth.uid())
);

-- Only the user who uploaded can update (using owner_id metadata would be ideal but complex)
-- For simplicity, allow approved users to update within the bucket
CREATE POLICY "Approved users can update photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'report-photos' AND
  is_approved(auth.uid())
);

-- Only allow admins to delete (prevent accidental data loss)
CREATE POLICY "Admins can delete photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'report-photos' AND
  is_admin(auth.uid())
);

-- Public read access for photos (needed for reports and PDFs to display)
CREATE POLICY "Public read access for report photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'report-photos');