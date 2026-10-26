DROP POLICY IF EXISTS "Users can upload section images" ON storage.objects;
CREATE POLICY "Users can upload section images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'section-images' AND (storage.foldername(name))[1] = (auth.uid())::text);