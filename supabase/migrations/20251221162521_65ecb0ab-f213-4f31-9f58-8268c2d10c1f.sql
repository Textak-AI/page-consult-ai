-- Create brand-assets storage bucket for logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own brand assets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'brand-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own brand assets
CREATE POLICY "Users can update their own brand assets"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'brand-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own brand assets
CREATE POLICY "Users can delete their own brand assets"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'brand-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Public read access for brand assets (logos need to be visible)
CREATE POLICY "Brand assets are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'brand-assets');