import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * Supabase Auth Callback Handler
 * 
 * This route handles the redirect after a user clicks the email confirmation link.
 * Supabase redirects to: /auth/callback?code=XXXXX
 * 
 * We exchange the code for a session here, then redirect the user to the dashboard.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successfully verified — redirect to dashboard
      return NextResponse.redirect(`${origin}${next}`);
    }

    // Code was invalid or expired
    return NextResponse.redirect(
      `${origin}/login?message=${encodeURIComponent("Email verification link expired. Please sign in or register again.")}`
    );
  }

  // No code in URL — redirect to login
  return NextResponse.redirect(
    `${origin}/login?message=${encodeURIComponent("Invalid verification link.")}`
  );
}
