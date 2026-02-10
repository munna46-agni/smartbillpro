import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getShopId } from "@/lib/shopId";
import { useToast } from "@/hooks/use-toast";

export interface BankTransaction {
  id: string;
  bank_account_id: string;
  transaction_type: "credit" | "debit";
  amount: number;
  description: string | null;
  reference_no: string | null;
  transaction_date: string;
  created_at: string;
}

export interface BankTransactionInsert {
  bank_account_id: string;
  transaction_type: "credit" | "debit";
  amount: number;
  description?: string | null;
  reference_no?: string | null;
  transaction_date?: string;
}

export function useBankTransactions(accountId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: ["bank_transactions", accountId],
    queryFn: async () => {
      let query = supabase
        .from("bank_transactions")
        .select("*")
        .order("transaction_date", { ascending: false });
      
      if (accountId) {
        query = query.eq("bank_account_id", accountId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as BankTransaction[];
    },
  });

  const addTransaction = useMutation({
    mutationFn: async (transaction: BankTransactionInsert) => {
      const shop_id = await getShopId();
      // Insert transaction
      const { data, error } = await supabase
        .from("bank_transactions")
        .insert({ ...transaction, shop_id })
        .select()
        .single();
      
      if (error) throw error;

      // Update account balance
      const balanceChange = transaction.transaction_type === "credit" 
        ? transaction.amount 
        : -transaction.amount;

      const { data: account } = await supabase
        .from("bank_accounts")
        .select("current_balance")
        .eq("id", transaction.bank_account_id)
        .single();

      if (account) {
        await supabase
          .from("bank_accounts")
          .update({ current_balance: Number(account.current_balance) + balanceChange })
          .eq("id", transaction.bank_account_id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank_transactions"] });
      queryClient.invalidateQueries({ queryKey: ["bank_accounts"] });
      toast({
        title: "Transaction Added",
        description: "Transaction has been recorded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async ({ id, bank_account_id, transaction_type, amount }: { 
      id: string; 
      bank_account_id: string; 
      transaction_type: "credit" | "debit"; 
      amount: number 
    }) => {
      // Reverse the balance change
      const balanceChange = transaction_type === "credit" 
        ? -amount 
        : amount;

      const { data: account } = await supabase
        .from("bank_accounts")
        .select("current_balance")
        .eq("id", bank_account_id)
        .single();

      if (account) {
        await supabase
          .from("bank_accounts")
          .update({ current_balance: Number(account.current_balance) + balanceChange })
          .eq("id", bank_account_id);
      }

      // Delete transaction
      const { error } = await supabase
        .from("bank_transactions")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank_transactions"] });
      queryClient.invalidateQueries({ queryKey: ["bank_accounts"] });
      toast({
        title: "Transaction Deleted",
        description: "Transaction has been removed and balance updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    transactions,
    isLoading,
    error,
    addTransaction,
    deleteTransaction,
  };
}
