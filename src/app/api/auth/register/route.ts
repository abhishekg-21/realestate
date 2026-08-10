import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone, role } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Initialize Supabase Admin client to bypass normal auth limits and generate links
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: "Server misconfiguration: Missing service role key" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Generate a signup link using Supabase Admin
    // This creates the user but leaves them unconfirmed, and returns the magic link.
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          role,
        },
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://propertiesnexus.com"}/auth/callback`,
      },
    });

    if (linkError) {
      return NextResponse.json({ error: linkError.message }, { status: 400 });
    }

    const actionLink = linkData.properties?.action_link;

    if (!actionLink) {
      return NextResponse.json({ error: "Failed to generate confirmation link." }, { status: 500 });
    }

    // 2. Send the email using Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ error: "Server misconfiguration: Missing Resend API key" }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);

    const { error: resendError } = await resend.emails.send({
      from: "PropertiesNexus <onboarding@resend.dev>",
      to: email,
      subject: "Welcome to PropertiesNexus - Verify your email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e5e8; border-radius: 10px;">
          <h2 style="color: #07182d;">Verify your email address</h2>
          <p style="color: #344556; line-height: 1.6;">
            Hello ${fullName || "there"},
          </p>
          <p style="color: #344556; line-height: 1.6;">
            Thank you for creating an account on PropertiesNexus. Please click the button below to verify your email address and securely activate your account.
          </p>
          <div style="margin: 30px 0;">
            <a href="${actionLink}" style="background-color: #2862e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Confirm your email
            </a>
          </div>
          <p style="color: #6b7986; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e1e5e8;">
            If you did not request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (resendError) {
      console.error("Resend Error:", resendError);
      
      // If Resend is in sandbox mode and blocks the email (very common when testing), 
      // we auto-verify the user so the developer isn't blocked from testing the app.
      if (resendError.name === "validation_error" || resendError.message?.toLowerCase().includes("sandbox") || resendError.statusCode === 403) {
        await supabaseAdmin.auth.admin.updateUserById(linkData.user.id, { email_confirm: true });
        
        return NextResponse.json({ 
          success: true, 
          user: { id: linkData.user.id },
          warning: "Resend is in sandbox mode. Email was not sent, but your account was automatically verified for testing purposes! You can log in now."
        });
      }

      return NextResponse.json(
        { 
          error: "Failed to send email via Resend. " + resendError.message,
          details: resendError 
        }, 
        { status: 500 }
      );
    }

    // Return the user ID so the client can upload documents
    return NextResponse.json({ 
      success: true, 
      user: { id: linkData.user.id } 
    });

  } catch (err: any) {
    console.error("Server Registration Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
