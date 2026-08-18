// app/api/auth/upload-docs/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const userId = formData.get("userId") as string;
    const role = formData.get("role") as string;
    const ownershipDocType = formData.get("ownershipDocType") as string;
    const identityDocType = formData.get("identityDocType") as string;
    const files = formData.getAll("files") as File[];

    if (!userId || files.length === 0) {
      return NextResponse.json({ success: true }); // nothing to upload
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    for (const file of files) {
      const path = `${userId}/${Date.now()}_${file.name}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabaseAdmin.storage
        .from("user-verification-docs")
        .upload(path, buffer, { contentType: file.type });

      if (!uploadError) {
        // Update the pending record we created in /register with the real storage_path
        await supabaseAdmin
          .from("user_verification_documents")
          .update({ storage_path: path })
          .eq("user_id", userId)
          .eq("file_name", file.name)
          .eq("storage_path", ""); // only update the placeholder rows
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Doc upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
