-- Create storage bucket for shop assets (logo, watermark)
INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-assets', 'shop-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to shop assets
CREATE POLICY "Public read access for shop assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'shop-assets');

-- Allow authenticated users to upload shop assets
CREATE POLICY "Allow upload to shop assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'shop-assets');

-- Allow update of shop assets
CREATE POLICY "Allow update of shop assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'shop-assets');

-- Allow delete of shop assets
CREATE POLICY "Allow delete of shop assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'shop-assets');