import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone, role, pendingDocs } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const alreadyExists = existingUsers?.users?.some((u) => u.email === email);
    if (alreadyExists) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 },
      );
    }

    // Create the user — Supabase will send OTP automatically
    // because email confirmation is enabled in your dashboard settings
    const { data: signUpData, error: signUpError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false, // false = requires OTP verification
        user_metadata: { full_name: fullName, phone, role },
      });

    if (signUpError || !signUpData?.user) {
      return NextResponse.json(
        { error: signUpError?.message ?? "Failed to create account." },
        { status: 400 },
      );
    }

    const userId = signUpData.user.id;

    // Create profile row immediately
    await supabaseAdmin.from("profiles").upsert({
      id: userId,
      full_name: fullName,
      phone,
      role,
      verification_status: role === "buyer" ? "approved" : "pending",
    });

    // Store pending doc metadata
    if (pendingDocs?.length > 0) {
      await supabaseAdmin.from("user_verification_documents").insert(
        pendingDocs.map((doc: any) => ({
          user_id: userId,
          role,
          doc_category: doc.docCategory,
          doc_type: doc.docType,
          storage_path: "",
          file_name: doc.fileName,
          verification_status: "pending",
        })),
      );
    }

    // Send OTP via Supabase (this triggers the email template with {{ .Token }})
    const { error: otpError } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
    });

    if (otpError) {
      console.error("OTP send error:", otpError.message);
      // Don't fail — user is created, they can request resend
    }

    return NextResponse.json({ success: true, user: { id: userId } });
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
