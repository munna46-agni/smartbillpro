import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CashClosing {
  id: string;
  date: string;
  opening_cash: number;
  system_cash: number;
  physical_cash: number;
  difference: number;
  created_at: string;
}

export function useCashClosings() {
  return useQuery({
    queryKey: ["cash-closings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cash_closing")
        .select("*")
        .order("date", { ascending: false });
      
      if (error) throw error;
      return data as CashClosing[];
    },
  });
}

export function useTodaySystemCash() {
  return useQuery({
    queryKey: ["system-cash", "today"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from("sales")
        .select("paid_amount, payment_mode")
        .gte("invoice_date", today.toISOString())
        .eq("payment_mode", "Cash");
      
      if (error) throw error;
      return data?.reduce((sum, s) => sum + Number(s.paid_amount), 0) || 0;
    },
  });
}

export function useAddCashClosing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (closing: Omit<CashClosing, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("cash_closing")
        .insert(closing)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-closings"] });
      toast.success("Cash closing saved successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to save cash closing: ${error.message}`);
    },
  });
}
