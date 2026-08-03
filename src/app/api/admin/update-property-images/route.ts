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

  const { submissionId, images } = await req.json();
  if (!submissionId || !Array.isArray(images)) {
    return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
  }

  // Use service role client
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Delete existing media records for this submission
  await service
    .from("property_submission_media")
    .delete()
    .eq("submission_id", submissionId);

  // 2. Insert updated images array
  if (images.length > 0) {
    const mediaRows = images.map((imgUrl: string, idx: number) => ({
      submission_id: submissionId,
      media_type: imgUrl.includes("video") || imgUrl.endsWith(".mp4") ? "video" : "photo",
      file_name: `image_${idx + 1}`,
      storage_path: imgUrl,
      sort_order: idx + 1,
    }));

    const { error: insertErr } = await service
      .from("property_submission_media")
      .insert(mediaRows);

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }
  }

  // Write audit log
  await service.from("admin_audit_logs").insert({
    admin_id: caller.user.id,
    admin_email: caller.user.email,
    action: "update_property_images",
    target_type: "property",
    target_id: submissionId,
    details: { totalImages: images.length },
  });

  return NextResponse.json({ success: true, count: images.length });
}
