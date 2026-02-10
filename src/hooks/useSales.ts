import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getShopId } from "@/lib/shopId";
import { toast } from "sonner";

export interface Sale {
  id: string;
  invoice_date: string;
  customer_name: string | null;
  mobile_number: string | null;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  payment_mode: "Cash" | "UPI" | "Card";
  bill_type: "Invoice" | "Return";
  due_date: string | null;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_name: string;
  quantity: number;
  rate: number;
  discount: number;
  total: number;
  item_type: "product" | "service";
  created_at: string;
}

export interface SaleWithItems extends Sale {
  sale_items: SaleItem[];
}

export function useSales() {
  return useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .order("invoice_date", { ascending: false });
      
      if (error) throw error;
      return data as Sale[];
    },
  });
}

export function useTodaySales() {
  return useQuery({
    queryKey: ["sales", "today"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .gte("invoice_date", today.toISOString())
        .order("invoice_date", { ascending: false });
      
      if (error) throw error;
      return data as Sale[];
    },
  });
}

export function useSalesSummary() {
  return useQuery({
    queryKey: ["sales", "summary"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get all sales
      const { data: allSales, error: allError } = await supabase
        .from("sales")
        .select("total_amount, paid_amount, balance_amount, invoice_date");
      
      if (allError) throw allError;
      
      const totalSales = allSales?.reduce((sum, s) => sum + Number(s.total_amount), 0) || 0;
      const totalDues = allSales?.reduce((sum, s) => sum + Number(s.balance_amount), 0) || 0;
      
      const todaySales = allSales?.filter(s => new Date(s.invoice_date) >= today) || [];
      const todayCollection = todaySales.reduce((sum, s) => sum + Number(s.paid_amount), 0);
      
      return {
        totalSales,
        todayCollection,
        totalDues,
      };
    },
  });
}

export function useCustomerDue(mobileNumber: string | null) {
  return useQuery({
    queryKey: ["customer-due", mobileNumber],
    queryFn: async () => {
      if (!mobileNumber) return 0;
      
      const { data, error } = await supabase
        .from("sales")
        .select("balance_amount")
        .eq("mobile_number", mobileNumber);
      
      if (error) throw error;
      return data?.reduce((sum, s) => sum + Number(s.balance_amount), 0) || 0;
    },
    enabled: !!mobileNumber,
  });
}

export function useSaleWithItems(saleId: string | null) {
  return useQuery({
    queryKey: ["sale", saleId],
    queryFn: async () => {
      if (!saleId) return null;
      
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .select("*")
        .eq("id", saleId)
        .single();
      
      if (saleError) throw saleError;
      
      const { data: items, error: itemsError } = await supabase
        .from("sale_items")
        .select("*")
        .eq("sale_id", saleId);
      
      if (itemsError) throw itemsError;
      
      return { ...sale, sale_items: items } as SaleWithItems;
    },
    enabled: !!saleId,
  });
}

interface CreateSaleInput {
  sale: Omit<Sale, "id" | "created_at">;
  items: Omit<SaleItem, "id" | "sale_id" | "created_at">[];
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sale, items }: CreateSaleInput) => {
      const shop_id = await getShopId();
      // Create sale
      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .insert({ ...sale, shop_id })
        .select()
        .single();
      
      if (saleError) throw saleError;
      
      // Create sale items
      const saleItems = items.map(item => ({
        ...item,
        sale_id: saleData.id,
        shop_id,
      }));
      
      const { error: itemsError } = await supabase
        .from("sale_items")
        .insert(saleItems);
      
      if (itemsError) throw itemsError;
      
      // Update stock for each item (only for products, not services)
      for (const item of items) {
        if (item.item_type === "service") continue; // Services don't have stock
        
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("stock, item_type")
          .eq("name", item.product_name)
          .single();
        
        if (productError) continue;
        if (product.item_type === "service") continue;
        
        const newStock = Math.max(0, (product.stock || 0) - item.quantity);
        await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("name", item.product_name);
      }
      
      return saleData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Sale completed successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create sale: ${error.message}`);
    },
  });
}
