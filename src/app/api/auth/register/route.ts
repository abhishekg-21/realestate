import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendOTPEmail } from "@/lib/mailer";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone, role, pendingDocs } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Check if email already exists and is confirmed
    const { data: existingList } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingList?.users?.find((u) => u.email === email);

    if (existingUser?.email_confirmed_at) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    let userId: string;

    if (existingUser) {
      // User exists but unconfirmed — reuse their ID
      userId = existingUser.id;
      // Update password in case they're retrying registration
      await supabaseAdmin.auth.admin.updateUserById(userId, { password });
    } else {
      // Create new user — email_confirm false, we handle OTP ourselves
      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: false,
          user_metadata: { full_name: fullName, phone, role },
        });

      if (createError || !newUser?.user) {
        return NextResponse.json(
          { error: createError?.message || "Failed to create account." },
          { status: 400 }
        );
      }

      userId = newUser.user.id;
    }

    // Upsert profile
    await supabaseAdmin.from("profiles").upsert({
      id: userId,
      full_name: fullName,
      phone,
      role,
      verification_status: role === "buyer" ? "approved" : "pending",
    });

    // Store pending docs
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

    // Generate OTP and store in DB
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Delete any previous unused OTPs for this email
    await supabaseAdmin
      .from("email_otps")
      .delete()
      .eq("email", email);

    await supabaseAdmin.from("email_otps").insert({
      email,
      otp,
      expires_at: expiresAt,
      used: false,
    });

    // Send OTP via Nodemailer
    await sendOTPEmail(email, otp, fullName);

    return NextResponse.json({
      success: true,
      user: { id: userId },
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error." },
      { status: 500 }
    );
  }
}