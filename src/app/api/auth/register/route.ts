import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendOTPEmail } from "@/lib/mailer";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.");
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: Request) {
  try {
    // ── 1. Parse & validate body ───────────────────────────────────────────────
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { email, password, fullName, phone, role, pendingDocs } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const validRoles = ["buyer", "seller", "agent", "builder", "developer", "investor"];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role selected." },
        { status: 400 }
      );
    }

    // ── 2. Create admin client ─────────────────────────────────────────────────
    const supabaseAdmin = createAdminClient();

    // ── 3. Check if email already exists ──────────────────────────────────────
    const { data: existingList, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error("[register] listUsers error:", listError.message);
      return NextResponse.json(
        { error: "Unable to process registration. Please try again." },
        { status: 500 }
      );
    }

    const existingUser = existingList?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    // Already confirmed — block re-registration
    if (existingUser?.email_confirmed_at) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 400 }
      );
    }

    // ── 4. Create or reuse user ────────────────────────────────────────────────
    let userId: string;

    if (existingUser) {
      // Unconfirmed user retrying — reuse their ID and update password
      userId = existingUser.id;
      console.log("[register] Reusing unconfirmed user:", userId);

      const { error: updateError } =
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          password,
          user_metadata: { full_name: fullName, phone, role },
        });

      if (updateError) {
        console.error("[register] updateUserById error:", updateError.message);
        return NextResponse.json(
          { error: "Failed to update account. Please try again." },
          { status: 500 }
        );
      }
    } else {
      // New user — create with email_confirm: false (we confirm via our own OTP)
      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: false,
          user_metadata: { full_name: fullName, phone, role },
        });

      if (createError || !newUser?.user) {
        console.error("[register] createUser error:", createError?.message);
        return NextResponse.json(
          { error: createError?.message || "Failed to create account." },
          { status: 400 }
        );
      }

      userId = newUser.user.id;
      console.log("[register] Created new user:", userId);
    }

    // ── 5. Upsert profile ──────────────────────────────────────────────────────
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: userId,
        full_name: fullName || email.split("@")[0],
        phone: phone || "",
        role: role || "buyer",
        verification_status: role === "buyer" ? "approved" : "pending",
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error("[register] profile upsert error:", profileError.message);
      // Non-fatal — continue with OTP flow
    }

    // ── 6. Store pending verification docs ────────────────────────────────────
    if (Array.isArray(pendingDocs) && pendingDocs.length > 0) {
      const docRows = pendingDocs.map((doc: any) => ({
        user_id: userId,
        role: role || "buyer",
        doc_category: doc.docCategory || "identity_proof",
        doc_type: doc.docType || "Unknown",
        storage_path: "",
        file_name: doc.fileName || "unknown",
        verification_status: "pending",
      }));

      const { error: docsError } = await supabaseAdmin
        .from("user_verification_documents")
        .insert(docRows);

      if (docsError) {
        console.error("[register] docs insert error:", docsError.message);
        // Non-fatal — continue
      }
    }

    // ── 7. Generate OTP ────────────────────────────────────────────────────────
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Delete any previous OTPs for this email (cleanup)
    const { error: deleteError } = await supabaseAdmin
      .from("email_otps")
      .delete()
      .eq("email", email.toLowerCase());

    if (deleteError) {
      console.error("[register] OTP delete error:", deleteError.message);
      // If table doesn't exist this will fail — surface clearly
      if (deleteError.message.includes("does not exist")) {
        return NextResponse.json(
          { error: "OTP system is not set up. Please run the email_otps SQL migration." },
          { status: 500 }
        );
      }
    }

    // Insert new OTP
    const { error: otpInsertError } = await supabaseAdmin
      .from("email_otps")
      .insert({
        email: email.toLowerCase(),
        otp,
        expires_at: expiresAt,
        used: false,
      });

    if (otpInsertError) {
      console.error("[register] OTP insert error:", otpInsertError.message);
      return NextResponse.json(
        { error: "Failed to generate verification code. Please try again." },
        { status: 500 }
      );
    }

    console.log("[register] OTP stored for:", email);

    // ── 8. Send OTP email via Nodemailer ───────────────────────────────────────
    try {
      await sendOTPEmail(email, otp, fullName);
      console.log("[register] OTP email sent to:", email);
    } catch (mailError: any) {
      console.error("[register] sendOTPEmail error:", mailError.message);

      // Email failed — delete the OTP so user can retry cleanly
      await supabaseAdmin
        .from("email_otps")
        .delete()
        .eq("email", email.toLowerCase());

      return NextResponse.json(
        { error: "Failed to send verification email. Please check your email address and try again." },
        { status: 500 }
      );
    }

    // ── 9. Success ─────────────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      user: { id: userId },
    });

  } catch (err: any) {
    console.error("[register] Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error." },
      { status: 500 }
    );
  }
}