import { supabase } from "@/integrations/supabase/client";

let cachedShopId: string | null = null;

export async function getShopId(): Promise<string | null> {
  if (cachedShopId) return cachedShopId;
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data } = await supabase.rpc("get_user_shop_id", { _user_id: user.id });
  cachedShopId = data as string | null;
  return cachedShopId;
}

export function clearShopIdCache() {
  cachedShopId = null;
}
