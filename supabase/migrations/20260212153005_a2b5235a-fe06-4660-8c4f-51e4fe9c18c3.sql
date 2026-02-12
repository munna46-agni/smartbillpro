
-- Add validity tracking columns to sale_items
ALTER TABLE public.sale_items 
ADD COLUMN IF NOT EXISTS validity_days integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS expiry_date date DEFAULT NULL,
ADD COLUMN IF NOT EXISTS policy_number text DEFAULT NULL;

-- Update item_type to support new types (it's already text, so we just need to use 'recharge' and 'insurance' values)
