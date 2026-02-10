import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getShopId } from "@/lib/shopId";
import { useToast } from "@/hooks/use-toast";

export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  mobile_number: string | null;
  email: string | null;
  address: string | null;
  gst_number: string | null;
  notes: string | null;
  total_purchases: number;
  total_paid: number;
  created_at: string;
  updated_at: string;
}

export interface SupplierInsert {
  name: string;
  contact_person?: string | null;
  mobile_number?: string | null;
  email?: string | null;
  address?: string | null;
  gst_number?: string | null;
  notes?: string | null;
}

export function useSuppliers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suppliers = [], isLoading, error } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data as Supplier[];
    },
  });

  const addSupplier = useMutation({
    mutationFn: async (supplier: SupplierInsert) => {
      const shop_id = await getShopId();
      const { data, error } = await supabase
        .from("suppliers")
        .insert({ ...supplier, shop_id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({
        title: "Supplier Added",
        description: "Supplier has been added successfully.",
      });
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate")) {
        toast({
          title: "Duplicate Supplier",
          description: "A supplier with this name already exists.",
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

  const updateSupplier = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Supplier> & { id: string }) => {
      const { data, error } = await supabase
        .from("suppliers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({
        title: "Supplier Updated",
        description: "Supplier details have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate")) {
        toast({
          title: "Duplicate Supplier",
          description: "A supplier with this name already exists.",
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

  const deleteSupplier = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("suppliers")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({
        title: "Supplier Deleted",
        description: "Supplier has been removed successfully.",
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
    suppliers,
    isLoading,
    error,
    addSupplier,
    updateSupplier,
    deleteSupplier,
  };
}

// Hook to get purchase history for a supplier by name
export function useSupplierPurchaseHistory(supplierName: string | null) {
  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ["supplier_purchases", supplierName],
    queryFn: async () => {
      if (!supplierName) return [];
      
      const { data, error } = await supabase
        .from("purchases")
        .select("*")
        .eq("supplier_name", supplierName)
        .order("date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!supplierName,
  });

  return { purchases, isLoading };
}
