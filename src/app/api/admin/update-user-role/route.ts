import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

async function getCallerProfile() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return { user, profile };
}

const ALLOWED_ROLES = ["user", "agent", "builder", "lister", "admin", "super_admin"];

export async function POST(req: NextRequest) {
  const caller = await getCallerProfile();
  if (!caller || !["super_admin", "admin"].includes(caller.profile?.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userId, newRole } = await req.json();
  if (!userId || !newRole || !ALLOWED_ROLES.includes(newRole)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Prevent self-demotion
  if (userId === caller.user.id && newRole !== "super_admin") {
    return NextResponse.json({ error: "Cannot change your own super_admin role" }, { status: 400 });
  }

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get old role for audit
  const { data: oldProfile } = await service
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  const { error } = await service
    .from("profiles")
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await service.from("admin_audit_logs").insert({
    admin_id: caller.user.id,
    admin_email: caller.user.email,
    action: "change_role",
    target_type: "user",
    target_id: userId,
    details: {
      old_role: oldProfile?.role || "unknown",
      new_role: newRole,
    },
  });

  return NextResponse.json({ success: true });
}
