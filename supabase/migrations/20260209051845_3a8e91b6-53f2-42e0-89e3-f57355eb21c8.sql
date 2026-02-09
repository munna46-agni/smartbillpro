
-- Drop all existing permissive policies on all tables
DROP POLICY IF EXISTS "Allow all access to bank_accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Allow all access to bank_transactions" ON public.bank_transactions;
DROP POLICY IF EXISTS "Allow all access to cash_closing" ON public.cash_closing;
DROP POLICY IF EXISTS "Allow all access to customers" ON public.customers;
DROP POLICY IF EXISTS "Allow all access to products" ON public.products;
DROP POLICY IF EXISTS "Allow all access to purchases" ON public.purchases;
DROP POLICY IF EXISTS "Allow all access to sale_items" ON public.sale_items;
DROP POLICY IF EXISTS "Allow all access to sales" ON public.sales;
DROP POLICY IF EXISTS "Allow all access to suppliers" ON public.suppliers;

-- Create authenticated-only policies for all tables
CREATE POLICY "Authenticated users can manage bank_accounts"
ON public.bank_accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage bank_transactions"
ON public.bank_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage cash_closing"
ON public.cash_closing FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage customers"
ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage products"
ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage purchases"
ON public.purchases FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage sale_items"
ON public.sale_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage sales"
ON public.sales FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage suppliers"
ON public.suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Fix storage policies
DROP POLICY IF EXISTS "Allow upload to shop assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow update of shop assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete of shop assets" ON storage.objects;

CREATE POLICY "Authenticated upload to shop assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'shop-assets');

CREATE POLICY "Authenticated update of shop assets"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'shop-assets');

CREATE POLICY "Authenticated delete of shop assets"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'shop-assets');
