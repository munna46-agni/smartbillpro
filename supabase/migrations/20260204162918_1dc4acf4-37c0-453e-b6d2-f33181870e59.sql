-- Create transaction type enum
CREATE TYPE public.transaction_type_enum AS ENUM ('credit', 'debit');

-- Create bank_transactions table
CREATE TABLE public.bank_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_account_id UUID NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  transaction_type transaction_type_enum NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  reference_no TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (no auth in this app)
CREATE POLICY "Allow all access to bank_transactions"
ON public.bank_transactions
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_bank_transactions_account_id ON public.bank_transactions(bank_account_id);
CREATE INDEX idx_bank_transactions_date ON public.bank_transactions(transaction_date DESC);