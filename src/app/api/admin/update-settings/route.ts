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

export async function POST(req: NextRequest) {
  const caller = await getCallerProfile();
  if (!caller || !["super_admin", "admin"].includes(caller.profile?.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { key, value } = await req.json();
  if (!key || value === undefined) {
    return NextResponse.json({ error: "Missing key or value" }, { status: 400 });
  }

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get old value for audit
  const { data: oldSetting } = await service
    .from("platform_settings")
    .select("value")
    .eq("key", key)
    .single();

  const { error } = await service
    .from("platform_settings")
    .update({
      value: String(value),
      updated_at: new Date().toISOString(),
      updated_by: caller.user.email,
    })
    .eq("key", key);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await service.from("admin_audit_logs").insert({
    admin_id: caller.user.id,
    admin_email: caller.user.email,
    action: "update_settings",
    target_type: "setting",
    target_id: key,
    details: {
      key,
      old_value: oldSetting?.value || "",
      new_value: String(value),
    },
  });

  return NextResponse.json({ success: true });
}
