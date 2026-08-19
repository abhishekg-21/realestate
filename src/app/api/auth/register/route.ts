/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

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

    // Step 1: Create user with email_confirm: false so Supabase does NOT
    // send its own confirmation email — we send ours via Resend below
    const { data: userData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false, // ← key: prevents Supabase default email
        user_metadata: { full_name: fullName, phone, role },
      });

    if (createError || !userData?.user) {
      return NextResponse.json(
        { error: createError?.message ?? "Failed to create user" },
        { status: 400 },
      );
    }

    const userId = userData.user.id;

    // Step 2: Generate the confirmation link separately (no email sent)
    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "signup",
        email,
        password,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      });

    if (linkError || !linkData?.properties?.action_link) {
      return NextResponse.json(
        { error: linkError?.message ?? "Failed to generate link" },
        { status: 400 },
      );
    }

    // Step 3: Upsert profile
    await supabaseAdmin.from("profiles").upsert({
      id: userId,
      full_name: fullName,
      phone,
      role,
      verification_status: role === "buyer" ? "approved" : "pending",
    });

    // Step 4: Store pending doc metadata
    if (pendingDocs && pendingDocs.length > 0) {
      const docRows = pendingDocs.map((doc: any) => ({
        user_id: userId,
        role,
        doc_category: doc.docCategory,
        doc_type: doc.docType,
        storage_path: "",
        file_name: doc.fileName,
        verification_status: "pending",
      }));
      await supabaseAdmin.from("user_verification_documents").insert(docRows);
    }

    // Step 5: Send OUR branded email via Resend (only one email, from us)
    const isDev = process.env.NODE_ENV === "development";
    const resendTestEmail = process.env.RESEND_TEST_EMAIL;
    const shouldSendEmail = !isDev || email === resendTestEmail;

    if (shouldSendEmail) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY!);
        const fromAddress = isDev
          ? "PropertiesNexus <onboarding@resend.dev>"
          : `PropertiesNexus <noreply@${process.env.RESEND_FROM_DOMAIN}>`;

        const { error: resendError } = await resend.emails.send({
          from: fromAddress,
          to: email,
          subject: "Welcome to PropertiesNexus – Verify your email",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e1e5e8;border-radius:10px;">
              <h2 style="color:#07182d;">Verify your email address</h2>
              <p style="color:#344556;">Hello ${fullName || "there"},</p>
              <p style="color:#344556;">Thank you for registering on PropertiesNexus. Click below to verify your email and activate your account.</p>
              <div style="margin:30px 0;">
                <a href="${linkData.properties.action_link}" 
                   style="background:#2862e8;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">
                  Confirm your email
                </a>
              </div>
              <p style="color:#6b7986;font-size:12px;margin-top:40px;padding-top:20px;border-top:1px solid #e1e5e8;">
                If you did not request this, you can safely ignore this email.
              </p>
            </div>
          `,
        });

        if (resendError) {
          console.error("[Resend] Email send failed:", resendError);
        }
      } catch (emailErr) {
        console.error("[Resend] Unexpected email error:", emailErr);
      }
    } else {
      console.log(
        `[Dev] Skipping email to <${email}>. Verify link:\n${linkData.properties.action_link}`,
      );
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
