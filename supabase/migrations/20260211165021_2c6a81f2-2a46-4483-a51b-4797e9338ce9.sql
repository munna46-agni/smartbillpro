
-- Drop overly permissive storage policies
DROP POLICY IF EXISTS "Authenticated upload to shop assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update of shop assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete of shop assets" ON storage.objects;

-- Create shop-scoped storage policies
CREATE POLICY "Shop owners can upload own assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'shop-assets' AND
  (storage.foldername(name))[1] = (get_user_shop_id(auth.uid()))::text
);

CREATE POLICY "Shop owners can update own assets"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'shop-assets' AND
  (storage.foldername(name))[1] = (get_user_shop_id(auth.uid()))::text
);

CREATE POLICY "Shop owners can delete own assets"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'shop-assets' AND
  (storage.foldername(name))[1] = (get_user_shop_id(auth.uid()))::text
);
