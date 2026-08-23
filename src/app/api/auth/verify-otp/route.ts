import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Find the OTP record
    const { data: otpRecord, error: otpError } = await supabaseAdmin
      .from("email_otps")
      .select("*")
      .eq("email", email)
      .eq("otp", otp)
      .eq("used", false)
      .single();

    if (otpError || !otpRecord) {
      return NextResponse.json(
        { error: "Invalid code. Please check and try again." },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date(otpRecord.expires_at) < new Date()) {
      await supabaseAdmin
        .from("email_otps")
        .delete()
        .eq("id", otpRecord.id);
      return NextResponse.json(
        { error: "This code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark OTP as used
    await supabaseAdmin
      .from("email_otps")
      .update({ used: true })
      .eq("id", otpRecord.id);

    // Confirm the user's email in Supabase Auth
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = userList?.users?.find((u) => u.email === email);

    if (!authUser) {
      return NextResponse.json(
        { error: "Account not found. Please register again." },
        { status: 400 }
      );
    }

    // Mark email as confirmed
    await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
      email_confirm: true,
    });

    // Get profile for role and name
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role, full_name")
      .eq("id", authUser.id)
      .single();

    // Clean up used OTPs
    await supabaseAdmin
      .from("email_otps")
      .delete()
      .eq("email", email);

    return NextResponse.json({
      success: true,
      role: profile?.role || "buyer",
      user: {
        id: authUser.id,
        email: authUser.email,
        name: profile?.full_name || email.split("@")[0],
      },
    });
  } catch (err: any) {
    console.error("Verify OTP error:", err);
    return NextResponse.json(
      { error: err.message || "Verification failed." },
      { status: 500 }
    );
  }
}