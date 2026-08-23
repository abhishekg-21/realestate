import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required." },
        { status: 400 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // Verify the OTP — type "signup" matches the registration flow
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "signup",
    });

    if (error) {
      return NextResponse.json(
        { error: "Invalid or expired OTP. Please try again." },
        { status: 400 },
      );
    }

    // Get role from profile to redirect correctly
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", data.user?.id)
      .single();

    return NextResponse.json({
      success: true,
      role: profile?.role || "buyer",
      user: { id: data.user?.id, email: data.user?.email },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Verification failed." },
      { status: 500 },
    );
  }
}
