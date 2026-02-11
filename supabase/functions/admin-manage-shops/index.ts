import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  // Allow Lovable preview/published domains
  if (origin.endsWith(".lovable.app")) return true;
  if (origin.endsWith(".lovableproject.com")) return true;
  // Allow local development
  if (origin.startsWith("http://localhost:")) return true;
  return false;
}

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  const allowedOrigin = isAllowedOrigin(origin) ? origin : "";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

const ALLOWED_ACTIONS = ["list_pending_users", "create_shop", "list_shops", "toggle_shop"];

function validateEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && email.length <= 255;
}

function validateShopName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 200) return null;
  return trimmed;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Check super_admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "super_admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { action, ...params } = body;

    // Validate action
    if (!action || !ALLOWED_ACTIONS.includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "list_pending_users") {
      const { data: allUsers } = await supabase.auth.admin.listUsers();
      const { data: shops } = await supabase.from("shops").select("owner_id");
      const shopOwnerIds = new Set((shops ?? []).map((s: any) => s.owner_id));
      const { data: admins } = await supabase.from("user_roles").select("user_id").eq("role", "super_admin");
      const adminIds = new Set((admins ?? []).map((a: any) => a.user_id));

      const pendingUsers = (allUsers?.users ?? [])
        .filter((u: any) => !shopOwnerIds.has(u.id) && !adminIds.has(u.id))
        .map((u: any) => ({ id: u.id, email: u.email, created_at: u.created_at }));

      return new Response(JSON.stringify({ users: pendingUsers }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "list_shops") {
      const { data: shops, error: shopsError } = await supabase
        .from("shops")
        .select("*")
        .order("created_at", { ascending: false });

      if (shopsError) {
        console.error("Failed to list shops:", shopsError.message);
        return new Response(JSON.stringify({ error: "Unable to retrieve shops" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ shops: shops ?? [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "toggle_shop") {
      const { shop_id, is_active } = params;
      if (!shop_id || typeof is_active !== "boolean") {
        return new Response(JSON.stringify({ error: "shop_id and is_active are required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const { error: updateError } = await supabase
        .from("shops")
        .update({ is_active })
        .eq("id", shop_id);

      if (updateError) {
        console.error("Failed to toggle shop:", updateError.message);
        return new Response(JSON.stringify({ error: "Unable to update shop status" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "create_shop") {
      const { shop_name, owner_email } = params;

      // Validate inputs
      if (!shop_name || !owner_email) {
        return new Response(JSON.stringify({ error: "shop_name and owner_email are required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const sanitizedName = validateShopName(shop_name);
      if (!sanitizedName) {
        return new Response(JSON.stringify({ error: "Shop name must be 1-200 characters" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (!validateEmail(owner_email)) {
        return new Response(JSON.stringify({ error: "Invalid email format" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Find user by email
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const targetUser = (usersData?.users ?? []).find((u: any) => u.email === owner_email);
      if (!targetUser) {
        return new Response(JSON.stringify({ error: "User not found with that email" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Check if user already has a shop
      const { data: existingShop } = await supabase.from("shops").select("id").eq("owner_id", targetUser.id).maybeSingle();
      if (existingShop) {
        return new Response(JSON.stringify({ error: "User already has a shop" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Create shop
      const { data: shop, error: shopError } = await supabase
        .from("shops")
        .insert({ name: sanitizedName, owner_id: targetUser.id, is_active: true })
        .select()
        .single();

      if (shopError) {
        console.error("Failed to create shop:", shopError.message);
        return new Response(JSON.stringify({ error: "Unable to create shop" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Assign shop_owner role
      await supabase
        .from("user_roles")
        .upsert({ user_id: targetUser.id, role: "shop_owner" }, { onConflict: "user_id,role" })
        .select();

      return new Response(JSON.stringify({ shop }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Admin function error:", error.message);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  }
});
