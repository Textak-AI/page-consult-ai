-- Create storage bucket for section images
INSERT INTO storage.buckets (id, name, public)
VALUES ('section-images', 'section-images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload section images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'section-images' 
  AND auth.uid() IS NOT NULL
);

-- Allow public read access to section images
CREATE POLICY "Section images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'section-images');

-- Allow users to update their own uploaded images
CREATE POLICY "Users can update own section images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'section-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own uploaded images
CREATE POLICY "Users can delete own section images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'section-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);