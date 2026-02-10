import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getShopId } from "@/lib/shopId";
import { toast } from "sonner";

export type ItemType = "product" | "service";

export interface Product {
  id: string;
  name: string;
  cost_price: number;
  selling_price: number;
  stock: number;
  category: string | null;
  item_type: ItemType;
  created_at: string;
  updated_at: string;
}

export function useProducts(itemType?: ItemType) {
  return useQuery({
    queryKey: ["products", itemType],
    queryFn: async () => {
      let query = supabase.from("products").select("*").order("name");
      
      if (itemType) {
        query = query.eq("item_type", itemType);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useLowStockProducts(threshold = 5) {
  return useQuery({
    queryKey: ["products", "low-stock", threshold],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("item_type", "product") // Only products have stock
        .lt("stock", threshold)
        .order("stock");
      
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useAddProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: Omit<Product, "id" | "created_at" | "updated_at">) => {
      // Services don't need stock tracking
      const productData = product.item_type === "service" 
        ? { ...product, stock: 0 } 
        : product;
        
      const shop_id = await getShopId();
      const { data, error } = await supabase
        .from("products")
        .insert({ ...productData, shop_id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add product: ${error.message}`);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...product }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from("products")
        .update(product)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update product: ${error.message}`);
    },
  });
}

export function useUpdateStock() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, stockChange }: { id: string; stockChange: number }) => {
      // First get current stock
      const { data: current, error: fetchError } = await supabase
        .from("products")
        .select("stock")
        .eq("id", id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const newStock = (current.stock || 0) + stockChange;
      if (newStock < 0) throw new Error("Stock cannot be negative");
      
      const { data, error } = await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Stock updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update stock: ${error.message}`);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete product: ${error.message}`);
    },
  });
}
