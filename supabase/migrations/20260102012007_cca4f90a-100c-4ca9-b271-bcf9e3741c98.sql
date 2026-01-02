-- Fix brand-assets storage policies to enforce folder-based isolation
-- Drop all existing policies for brand-assets bucket and recreate properly

-- Drop potentially existing policies (using IF EXISTS for safety)
DROP POLICY IF EXISTS "Users can upload brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Public read for brand assets" ON storage.objects;

-- Create properly scoped policies with folder-based isolation
CREATE POLICY "brand_assets_insert_own"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'brand-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "brand_assets_update_own"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'brand-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "brand_assets_delete_own"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'brand-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Public read access for brand assets (logos are displayed publicly)
CREATE POLICY "brand_assets_public_read"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'brand-assets');