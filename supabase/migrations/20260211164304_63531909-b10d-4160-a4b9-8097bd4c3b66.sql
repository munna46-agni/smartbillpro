
-- Add length constraints and validation to customers
ALTER TABLE public.customers
  ADD CONSTRAINT customers_name_length CHECK (char_length(name) <= 200),
  ADD CONSTRAINT customers_mobile_length CHECK (char_length(mobile_number) <= 15),
  ADD CONSTRAINT customers_email_length CHECK (email IS NULL OR char_length(email) <= 255),
  ADD CONSTRAINT customers_email_format CHECK (email IS NULL OR email ~ '^[^@]+@[^@]+\.[^@]+$'),
  ADD CONSTRAINT customers_non_negative_purchases CHECK (total_purchases >= 0);

-- Add constraints to sales
ALTER TABLE public.sales
  ADD CONSTRAINT sales_non_negative_amounts CHECK (total_amount >= 0 AND paid_amount >= 0 AND balance_amount >= 0),
  ADD CONSTRAINT sales_mobile_length CHECK (mobile_number IS NULL OR char_length(mobile_number) <= 15),
  ADD CONSTRAINT sales_customer_name_length CHECK (customer_name IS NULL OR char_length(customer_name) <= 200);

-- Add constraints to bank_accounts
ALTER TABLE public.bank_accounts
  ADD CONSTRAINT bank_accounts_name_length CHECK (char_length(account_name) <= 200),
  ADD CONSTRAINT bank_accounts_bank_name_length CHECK (char_length(bank_name) <= 200);

-- Add constraints to bank_transactions
ALTER TABLE public.bank_transactions
  ADD CONSTRAINT bank_transactions_positive_amount CHECK (amount > 0),
  ADD CONSTRAINT bank_transactions_desc_length CHECK (description IS NULL OR char_length(description) <= 500);

-- Add constraints to products
ALTER TABLE public.products
  ADD CONSTRAINT products_name_length CHECK (char_length(name) <= 200),
  ADD CONSTRAINT products_non_negative_prices CHECK (cost_price >= 0 AND selling_price >= 0),
  ADD CONSTRAINT products_non_negative_stock CHECK (stock >= 0);

-- Add constraints to purchases
ALTER TABLE public.purchases
  ADD CONSTRAINT purchases_non_negative CHECK (quantity >= 0 AND cost >= 0 AND total_amount >= 0),
  ADD CONSTRAINT purchases_item_name_length CHECK (char_length(item_name) <= 200),
  ADD CONSTRAINT purchases_supplier_name_length CHECK (char_length(supplier_name) <= 200);

-- Add constraints to suppliers
ALTER TABLE public.suppliers
  ADD CONSTRAINT suppliers_name_length CHECK (char_length(name) <= 200),
  ADD CONSTRAINT suppliers_email_format CHECK (email IS NULL OR email ~ '^[^@]+@[^@]+\.[^@]+$'),
  ADD CONSTRAINT suppliers_non_negative CHECK (total_purchases >= 0 AND total_paid >= 0);

-- Add constraints to sale_items
ALTER TABLE public.sale_items
  ADD CONSTRAINT sale_items_non_negative CHECK (quantity >= 1 AND rate >= 0 AND discount >= 0 AND total >= 0),
  ADD CONSTRAINT sale_items_product_name_length CHECK (char_length(product_name) <= 200);
