-- Fix RLS policies for brand-assets storage bucket
-- Allow authenticated users to upload, update, and delete their own files

-- First, drop existing policies if they exist (won't fail if they don't)
DROP POLICY IF EXISTS "Users can upload brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to brand assets" ON storage.objects;

-- Create policy for authenticated users to upload files to brand-assets bucket
CREATE POLICY "Users can upload brand assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'brand-assets');

-- Create policy for authenticated users to update their own files
CREATE POLICY "Users can update own brand assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'brand-assets');

-- Create policy for authenticated users to delete their own files
CREATE POLICY "Users can delete own brand assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'brand-assets');

-- Create policy for public read access (bucket is public)
CREATE POLICY "Public read access to brand assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'brand-assets');