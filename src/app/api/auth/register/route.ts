import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone, role, pendingDocs } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Create user with email_confirm: false so OTP is required
    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: { full_name: fullName, phone, role },
      });

    if (createError) {
      // Handle duplicate email gracefully
      if (createError.message.toLowerCase().includes("already")) {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      );
    }

    const userId = newUser.user.id;

    // Create profile immediately using service role
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
        }))
      );
    }

    // ✅ This triggers Supabase to send the OTP email
    // Uses the anon client so Supabase sends via its own SMTP with {{ .Token }}
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: otpError } = await supabaseAnon.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, role },
      },
    });

    // signUp on existing-but-unconfirmed user triggers OTP resend
    // Ignore "User already registered" — the OTP still sends
    if (otpError && !otpError.message.includes("already registered")) {
      console.error("OTP trigger error:", otpError.message);
    }

    return NextResponse.json({
      success: true,
      user: { id: userId },
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}