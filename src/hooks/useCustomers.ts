import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getShopId } from "@/lib/shopId";
import { useToast } from "@/hooks/use-toast";

export interface Customer {
  id: string;
  name: string;
  mobile_number: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  total_purchases: number;
  total_balance: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerInsert {
  name: string;
  mobile_number: string;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
}

export function useCustomers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data as Customer[];
    },
  });

  const addCustomer = useMutation({
    mutationFn: async (customer: CustomerInsert) => {
      const shop_id = await getShopId();
      const { data, error } = await supabase
        .from("customers")
        .insert({ ...customer, shop_id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({
        title: "Customer Added",
        description: "Customer has been added successfully.",
      });
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate")) {
        toast({
          title: "Duplicate Mobile Number",
          description: "A customer with this mobile number already exists.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const updateCustomer = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Customer> & { id: string }) => {
      const { data, error } = await supabase
        .from("customers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({
        title: "Customer Updated",
        description: "Customer details have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate")) {
        toast({
          title: "Duplicate Mobile Number",
          description: "A customer with this mobile number already exists.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const deleteCustomer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({
        title: "Customer Deleted",
        description: "Customer has been removed successfully.",
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
    customers,
    isLoading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  };
}

// Hook to get purchase history for a customer by mobile number
export function useCustomerPurchaseHistory(mobileNumber: string | null) {
  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ["customer_purchases", mobileNumber],
    queryFn: async () => {
      if (!mobileNumber) return [];
      
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .eq("mobile_number", mobileNumber)
        .order("invoice_date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!mobileNumber,
  });

  return { purchases, isLoading };
}
