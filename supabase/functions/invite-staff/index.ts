import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const allowedRedirectOrigins = new Set([
  "https://bitis-management-system.vercel.app",
  "http://localhost:3000",
  "http://localhost:8000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:8000",
]);

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
    const email = String(payload.email ?? "").trim().toLowerCase();
    const fullName = String(payload.full_name ?? "").trim();
    const role = String(payload.role ?? "").trim().toUpperCase();
    const redirectTo = String(payload.redirect_to ?? "").trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ error: "A valid email address is required." }, 400);
    }
    if (!fullName || fullName.length > 120) {
      return jsonResponse({ error: "Full name is required and must be 120 characters or fewer." }, 400);
    }
    if (!["EMPLOYEE", "MANAGER"].includes(role)) {
      return jsonResponse({ error: "Invalid staff role." }, 400);
    }
    if (!redirectTo) {
      return jsonResponse({ error: "A password setup redirect URL is required." }, 400);
    }

    let redirectUrl: URL;
    try {
      redirectUrl = new URL(redirectTo);
    } catch {
      return jsonResponse({ error: "The password setup redirect URL is invalid." }, 400);
    }
    if (
      !allowedRedirectOrigins.has(redirectUrl.origin) ||
      redirectUrl.pathname !== "/set-password.html"
    ) {
      return jsonResponse({ error: "The password setup redirect URL is not allowed." }, 400);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo,
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
      redirect_to: redirectUrl.href,
    }, 200);
  } catch (error) {
    console.error("invite-staff failed", error);
    return jsonResponse({ error: "Unable to send the staff invitation." }, 500);
  }
});
