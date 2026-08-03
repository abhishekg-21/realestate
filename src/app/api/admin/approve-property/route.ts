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
    .select("role, full_name")
    .eq("id", user.id)
    .single();
  return { user, profile };
}

export async function POST(req: NextRequest) {
  const caller = await getCallerProfile();
  if (!caller || !["super_admin", "admin"].includes(caller.profile?.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { submissionId, action, note } = await req.json();
  if (!submissionId || !action) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const VALID_ACTIONS = ["approved", "rejected", "under_review", "changes_requested"];
  if (!VALID_ACTIONS.includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  // Use service role to bypass RLS for the update
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: updateError } = await service
    .from("property_submissions")
    .update({ status: action, updated_at: new Date().toISOString() })
    .eq("id", submissionId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Write audit log
  await service.from("admin_audit_logs").insert({
    admin_id: caller.user.id,
    admin_email: caller.user.email,
    action: `${action}_property`,
    target_type: "property",
    target_id: submissionId,
    details: { action, note: note || "" },
  });

  return NextResponse.json({ success: true });
}
