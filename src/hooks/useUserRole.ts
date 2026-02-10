import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "super_admin" | "shop_owner" | null;

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole>(null);
  const [shopId, setShopId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setShopId(null);
      setLoading(false);
      return;
    }

    async function fetchRoleAndShop() {
      try {
        // Fetch role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user!.id)
          .maybeSingle();

        const userRole = (roleData?.role as AppRole) ?? null;
        setRole(userRole);

        // Fetch shop_id if shop_owner
        if (userRole === "shop_owner" || !userRole) {
          const { data: shopData } = await supabase
            .from("shops")
            .select("id, is_active")
            .eq("owner_id", user!.id)
            .maybeSingle();

          if (shopData?.is_active) {
            setShopId(shopData.id);
          } else {
            setShopId(null);
          }
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRoleAndShop();
  }, [user]);

  return { role, shopId, loading };
}
