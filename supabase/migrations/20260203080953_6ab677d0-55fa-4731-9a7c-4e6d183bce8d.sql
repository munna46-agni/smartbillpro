-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales table
CREATE TYPE payment_mode_enum AS ENUM ('Cash', 'UPI', 'Card');
CREATE TYPE bill_type_enum AS ENUM ('Invoice', 'Return');

CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  customer_name TEXT,
  mobile_number TEXT,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  balance_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  payment_mode payment_mode_enum NOT NULL DEFAULT 'Cash',
  bill_type bill_type_enum NOT NULL DEFAULT 'Invoice',
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sale_items table
CREATE TABLE public.sale_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchases table
CREATE TABLE public.purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  invoice_no TEXT,
  supplier_name TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cash_closing table
CREATE TABLE public.cash_closing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  opening_cash DECIMAL(10, 2) NOT NULL DEFAULT 0,
  system_cash DECIMAL(10, 2) NOT NULL DEFAULT 0,
  physical_cash DECIMAL(10, 2) NOT NULL DEFAULT 0,
  difference DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_sales_mobile ON public.sales(mobile_number);
CREATE INDEX idx_sales_invoice_date ON public.sales(invoice_date);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_sale_items_sale_id ON public.sale_items(sale_id);

-- Enable RLS on all tables (but allow public access for POS system)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_closing ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (POS system - no auth required for now)
CREATE POLICY "Allow all access to products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to sales" ON public.sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to sale_items" ON public.sale_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to purchases" ON public.purchases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to cash_closing" ON public.cash_closing FOR ALL USING (true) WITH CHECK (true);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for products table
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample products
INSERT INTO public.products (name, cost_price, selling_price, stock, category) VALUES
  ('Rice 1kg', 45.00, 55.00, 100, 'Groceries'),
  ('Sugar 1kg', 40.00, 48.00, 80, 'Groceries'),
  ('Cooking Oil 1L', 120.00, 145.00, 50, 'Groceries'),
  ('Wheat Flour 1kg', 30.00, 38.00, 75, 'Groceries'),
  ('Tea 250g', 80.00, 95.00, 40, 'Beverages'),
  ('Coffee 100g', 150.00, 180.00, 30, 'Beverages'),
  ('Milk 500ml', 25.00, 30.00, 60, 'Dairy'),
  ('Butter 100g', 50.00, 60.00, 25, 'Dairy'),
  ('Bread', 35.00, 45.00, 20, 'Bakery'),
  ('Biscuits Pack', 20.00, 28.00, 100, 'Snacks');