-- Add item_type column to products table to distinguish between products and services
ALTER TABLE public.products 
ADD COLUMN item_type TEXT NOT NULL DEFAULT 'product' 
CHECK (item_type IN ('product', 'service'));

-- Update existing sample data as products
UPDATE public.products SET item_type = 'product';

-- Insert sample services (no stock tracking needed for services)
INSERT INTO public.products (name, cost_price, selling_price, stock, category, item_type) VALUES
  ('A4 Printout (B/W)', 0, 2.00, 0, 'Print Services', 'service'),
  ('A4 Printout (Color)', 0, 10.00, 0, 'Print Services', 'service'),
  ('A3 Printout (B/W)', 0, 5.00, 0, 'Print Services', 'service'),
  ('A3 Printout (Color)', 0, 20.00, 0, 'Print Services', 'service'),
  ('Xerox (Single Side)', 0, 1.00, 0, 'Xerox', 'service'),
  ('Xerox (Double Side)', 0, 1.50, 0, 'Xerox', 'service'),
  ('PAN Card Application', 0, 107.00, 0, 'CSC Services', 'service'),
  ('PAN Card Correction', 0, 107.00, 0, 'CSC Services', 'service'),
  ('Aadhar Update', 0, 50.00, 0, 'CSC Services', 'service'),
  ('Aadhar Print', 0, 30.00, 0, 'CSC Services', 'service'),
  ('Passport Application', 0, 200.00, 0, 'CSC Services', 'service'),
  ('Voter ID Application', 0, 50.00, 0, 'CSC Services', 'service'),
  ('Voter ID Correction', 0, 50.00, 0, 'CSC Services', 'service'),
  ('Lamination (A4)', 0, 20.00, 0, 'Other Services', 'service'),
  ('Lamination (ID Card)', 0, 10.00, 0, 'Other Services', 'service'),
  ('Spiral Binding', 0, 30.00, 0, 'Other Services', 'service'),
  ('Pencil', 3.00, 5.00, 100, 'Stationery', 'product'),
  ('Pen (Blue)', 5.00, 10.00, 150, 'Stationery', 'product'),
  ('Pen (Black)', 5.00, 10.00, 100, 'Stationery', 'product'),
  ('Notebook (100 pages)', 25.00, 40.00, 50, 'Stationery', 'product'),
  ('Notebook (200 pages)', 40.00, 60.00, 40, 'Stationery', 'product'),
  ('A4 Paper Ream', 180.00, 220.00, 30, 'Paper', 'product'),
  ('Chart Paper (White)', 8.00, 15.00, 60, 'Stationery', 'product'),
  ('Chart Paper (Color)', 10.00, 18.00, 50, 'Stationery', 'product'),
  ('Eraser', 2.00, 5.00, 200, 'Stationery', 'product'),
  ('Sharpener', 3.00, 8.00, 100, 'Stationery', 'product'),
  ('Ruler (30cm)', 8.00, 15.00, 80, 'Stationery', 'product'),
  ('Glue Stick', 15.00, 25.00, 60, 'Stationery', 'product'),
  ('Scissors', 20.00, 35.00, 40, 'Stationery', 'product'),
  ('Stapler', 40.00, 70.00, 25, 'Stationery', 'product'),
  ('Stapler Pins', 10.00, 20.00, 100, 'Stationery', 'product');

-- Add item_type to sale_items for tracking
ALTER TABLE public.sale_items 
ADD COLUMN item_type TEXT NOT NULL DEFAULT 'product';