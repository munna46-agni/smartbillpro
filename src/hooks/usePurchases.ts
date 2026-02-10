import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getShopId } from "@/lib/shopId";
import { toast } from "sonner";

export interface Purchase {
  id: string;
  date: string;
  invoice_no: string | null;
  supplier_name: string;
  item_name: string;
  quantity: number;
  cost: number;
  total_amount: number;
  created_at: string;
}

export function usePurchases() {
  return useQuery({
    queryKey: ["purchases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select("*")
        .order("date", { ascending: false });
      
      if (error) throw error;
      return data as Purchase[];
    },
  });
}

export function useAddPurchase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (purchase: Omit<Purchase, "id" | "created_at">) => {
      const shop_id = await getShopId();
      // Add purchase record
      const { data, error } = await supabase
        .from("purchases")
        .insert({ ...purchase, shop_id })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update stock for the item
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("stock")
        .eq("name", purchase.item_name)
        .single();
      
      if (!productError && product) {
        const newStock = (product.stock || 0) + purchase.quantity;
        await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("name", purchase.item_name);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Purchase recorded and stock updated!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add purchase: ${error.message}`);
    },
  });
}
