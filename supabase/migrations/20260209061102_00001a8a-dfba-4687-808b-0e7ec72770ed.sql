
-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'shop_owner');

-- 2. Create shops table
CREATE TABLE public.shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- 3. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. Security definer function to get user's shop_id
CREATE OR REPLACE FUNCTION public.get_user_shop_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.shops WHERE owner_id = _user_id AND is_active = true LIMIT 1
$$;

-- 6. Add shop_id to all data tables
ALTER TABLE public.products ADD COLUMN shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE;
ALTER TABLE public.sales ADD COLUMN shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE;
ALTER TABLE public.sale_items ADD COLUMN shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE;
ALTER TABLE public.purchases ADD COLUMN shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE;
ALTER TABLE public.customers ADD COLUMN shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE;
ALTER TABLE public.suppliers ADD COLUMN shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE;
ALTER TABLE public.bank_accounts ADD COLUMN shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE;
ALTER TABLE public.bank_transactions ADD COLUMN shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE;
ALTER TABLE public.cash_closing ADD COLUMN shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE;

-- 7. RLS policies for user_roles
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- 8. RLS policies for shops
CREATE POLICY "Shop owners can view own shop"
  ON public.shops FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage shops"
  ON public.shops FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- 9. Drop old permissive RLS policies and create shop-scoped ones
-- Products
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;
CREATE POLICY "Shop users can manage own products"
  ON public.products FOR ALL
  TO authenticated
  USING (shop_id = public.get_user_shop_id(auth.uid()))
  WITH CHECK (shop_id = public.get_user_shop_id(auth.uid()));

-- Sales
DROP POLICY IF EXISTS "Authenticated users can manage sales" ON public.sales;
CREATE POLICY "Shop users can manage own sales"
  ON public.sales FOR ALL
  TO authenticated
  USING (shop_id = public.get_user_shop_id(auth.uid()))
  WITH CHECK (shop_id = public.get_user_shop_id(auth.uid()));

-- Sale items
DROP POLICY IF EXISTS "Authenticated users can manage sale_items" ON public.sale_items;
CREATE POLICY "Shop users can manage own sale_items"
  ON public.sale_items FOR ALL
  TO authenticated
  USING (shop_id = public.get_user_shop_id(auth.uid()))
  WITH CHECK (shop_id = public.get_user_shop_id(auth.uid()));

-- Purchases
DROP POLICY IF EXISTS "Authenticated users can manage purchases" ON public.purchases;
CREATE POLICY "Shop users can manage own purchases"
  ON public.purchases FOR ALL
  TO authenticated
  USING (shop_id = public.get_user_shop_id(auth.uid()))
  WITH CHECK (shop_id = public.get_user_shop_id(auth.uid()));

-- Customers
DROP POLICY IF EXISTS "Authenticated users can manage customers" ON public.customers;
CREATE POLICY "Shop users can manage own customers"
  ON public.customers FOR ALL
  TO authenticated
  USING (shop_id = public.get_user_shop_id(auth.uid()))
  WITH CHECK (shop_id = public.get_user_shop_id(auth.uid()));

-- Suppliers
DROP POLICY IF EXISTS "Authenticated users can manage suppliers" ON public.suppliers;
CREATE POLICY "Shop users can manage own suppliers"
  ON public.suppliers FOR ALL
  TO authenticated
  USING (shop_id = public.get_user_shop_id(auth.uid()))
  WITH CHECK (shop_id = public.get_user_shop_id(auth.uid()));

-- Bank accounts
DROP POLICY IF EXISTS "Authenticated users can manage bank_accounts" ON public.bank_accounts;
CREATE POLICY "Shop users can manage own bank_accounts"
  ON public.bank_accounts FOR ALL
  TO authenticated
  USING (shop_id = public.get_user_shop_id(auth.uid()))
  WITH CHECK (shop_id = public.get_user_shop_id(auth.uid()));

-- Bank transactions
DROP POLICY IF EXISTS "Authenticated users can manage bank_transactions" ON public.bank_transactions;
CREATE POLICY "Shop users can manage own bank_transactions"
  ON public.bank_transactions FOR ALL
  TO authenticated
  USING (shop_id = public.get_user_shop_id(auth.uid()))
  WITH CHECK (shop_id = public.get_user_shop_id(auth.uid()));

-- Cash closing
DROP POLICY IF EXISTS "Authenticated users can manage cash_closing" ON public.cash_closing;
CREATE POLICY "Shop users can manage own cash_closing"
  ON public.cash_closing FOR ALL
  TO authenticated
  USING (shop_id = public.get_user_shop_id(auth.uid()))
  WITH CHECK (shop_id = public.get_user_shop_id(auth.uid()));

-- 10. Trigger for shops updated_at
CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
