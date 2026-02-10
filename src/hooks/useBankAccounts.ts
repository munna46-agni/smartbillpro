import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getShopId } from "@/lib/shopId";
import { useToast } from "@/hooks/use-toast";

export interface BankAccount {
  id: string;
  account_name: string;
  bank_name: string;
  account_number: string | null;
  ifsc_code: string | null;
  upi_id: string | null;
  account_type: string;
  current_balance: number;
  created_at: string;
  updated_at: string;
}

export interface BankAccountInsert {
  account_name: string;
  bank_name: string;
  account_number?: string | null;
  ifsc_code?: string | null;
  upi_id?: string | null;
  account_type?: string;
  current_balance?: number;
}

export function useBankAccounts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading, error } = useQuery({
    queryKey: ["bank_accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as BankAccount[];
    },
  });

  const addAccount = useMutation({
    mutationFn: async (account: BankAccountInsert) => {
      const shop_id = await getShopId();
      const { data, error } = await supabase
        .from("bank_accounts")
        .insert({ ...account, shop_id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank_accounts"] });
      toast({
        title: "Account Added",
        description: "Bank account has been added successfully.",
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

  const updateAccount = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BankAccount> & { id: string }) => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank_accounts"] });
      toast({
        title: "Account Updated",
        description: "Bank account has been updated successfully.",
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

  const deleteAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("bank_accounts")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank_accounts"] });
      toast({
        title: "Account Deleted",
        description: "Bank account has been deleted successfully.",
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

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.current_balance), 0);

  return {
    accounts,
    isLoading,
    error,
    addAccount,
    updateAccount,
    deleteAccount,
    totalBalance,
  };
}
