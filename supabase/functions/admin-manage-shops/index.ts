import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is super_admin
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

    const { action, ...params } = await req.json();

    if (action === "list_pending_users") {
      // Get all users who don't own a shop
      const { data: allUsers } = await supabase.auth.admin.listUsers();
      const { data: shops } = await supabase.from("shops").select("owner_id");
      const shopOwnerIds = new Set((shops ?? []).map((s: any) => s.owner_id));
      // Also exclude super admins
      const { data: admins } = await supabase.from("user_roles").select("user_id").eq("role", "super_admin");
      const adminIds = new Set((admins ?? []).map((a: any) => a.user_id));

      const pendingUsers = (allUsers?.users ?? [])
        .filter((u: any) => !shopOwnerIds.has(u.id) && !adminIds.has(u.id))
        .map((u: any) => ({ id: u.id, email: u.email, created_at: u.created_at }));

      return new Response(JSON.stringify({ users: pendingUsers }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "create_shop") {
      const { shop_name, owner_email } = params;
      if (!shop_name || !owner_email) {
        return new Response(JSON.stringify({ error: "shop_name and owner_email are required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
        .insert({ name: shop_name, owner_id: targetUser.id, is_active: true })
        .select()
        .single();

      if (shopError) throw shopError;

      // Assign shop_owner role
      await supabase
        .from("user_roles")
        .upsert({ user_id: targetUser.id, role: "shop_owner" }, { onConflict: "user_id,role" })
        .select();

      return new Response(JSON.stringify({ shop }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
