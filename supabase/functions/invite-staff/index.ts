import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const passwordSetupUrl = new URL(
  "/set-password.html",
  "https://bitis-management-system.vercel.app",
);

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const publishableKey = Deno.env.get("SUPABASE_ANON_KEY") ??
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
      Deno.env.get("SUPABASE_SECRET_KEY");
    const authorization = request.headers.get("Authorization");

    if (!supabaseUrl || !publishableKey || !serviceRoleKey || !authorization) {
      return jsonResponse({ error: "Server authentication is not configured." }, 500);
    }

    const userClient = createClient(supabaseUrl, publishableKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const token = authorization.replace(/^Bearer\s+/i, "");
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData.user) {
      return jsonResponse({ error: "Authentication required." }, 401);
    }

    const { data: callerProfile, error: profileError } = await userClient
      .from("user_profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();
    if (profileError || callerProfile?.role !== "MANAGER") {
      return jsonResponse({ error: "Managers only." }, 403);
    }

    const payload = await request.json();
    const action = String(payload.action ?? "invite").trim().toLowerCase();
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    if (action === "delete") {
      const userId = String(payload.user_id ?? "").trim();
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
        return jsonResponse({ error: "A valid user ID is required." }, 400);
      }
      if (userId === userData.user.id) {
        return jsonResponse({ error: "You cannot delete your own account." }, 400);
      }

      const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
      if (deleteError) {
        return jsonResponse({ error: deleteError.message }, 400);
      }

      await adminClient.from("user_profiles").delete().eq("id", userId);
      return jsonResponse({ success: true, deleted_user_id: userId }, 200);
    }

    if (action !== "invite") {
      return jsonResponse({ error: "Unsupported action." }, 400);
    }

    const email = String(payload.email ?? "").trim().toLowerCase();
    const fullName = String(payload.full_name ?? "").trim();
    const role = String(payload.role ?? "").trim().toUpperCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ error: "A valid email address is required." }, 400);
    }
    if (!fullName || fullName.length > 120) {
      return jsonResponse({ error: "Full name is required and must be 120 characters or fewer." }, 400);
    }
    if (!["EMPLOYEE", "MANAGER"].includes(role)) {
      return jsonResponse({ error: "Invalid staff role." }, 400);
    }
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: passwordSetupUrl.href,
      data: { full_name: fullName, role, email },
    });

    if (error) {
      const duplicate = /already|registered|exists/i.test(error.message);
      return jsonResponse(
        { error: duplicate ? "An account already exists for this email." : error.message },
        duplicate ? 409 : 400,
      );
    }

    return jsonResponse({
      success: true,
      user_id: data.user?.id,
      email,
      redirect_to: passwordSetupUrl.href,
    }, 200);
  } catch (error) {
    console.error("invite-staff failed", error);
    return jsonResponse({ error: "Unable to send the staff invitation." }, 500);
  }
});
