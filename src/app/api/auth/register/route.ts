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

    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "signup",
        email,
        password,
        options: {
          data: { full_name: fullName, phone, role },
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      });

    if (linkError || !linkData?.properties?.action_link) {
      return NextResponse.json(
        { error: linkError?.message ?? "Failed to generate link" },
        { status: 400 },
      );
    }

    const userId = linkData.user.id;

    await supabaseAdmin.from("profiles").upsert({
      id: userId,
      full_name: fullName,
      phone,
      role,
      verification_status: role === "buyer" ? "approved" : "pending",
    });

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

    // ─── Email ────────────────────────────────────────────────────────────────
    const isDev = process.env.NODE_ENV === "development";
    const resendTestEmail = process.env.RESEND_TEST_EMAIL; // your resend account email

    // In dev: only send if recipient is your verified test address,
    // because onboarding@resend.dev won't deliver to arbitrary addresses.
    const shouldSendEmail = !isDev || email === resendTestEmail;

    if (shouldSendEmail) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY!);

        // Use your verified domain in production; resend.dev only works for
        // the test address in dev.
        const fromAddress = isDev
          ? "PropertiesNexus <onboarding@resend.dev>"
          : `PropertiesNexus <noreply@${process.env.RESEND_FROM_DOMAIN}>`;

        const { error: resendError } = await resend.emails.send({
          from: fromAddress,
          to: email,
          subject: "Welcome to PropertiesNexus - Verify your email",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e1e5e8;border-radius:10px;">
              <h2 style="color:#07182d;">Verify your email address</h2>
              <p style="color:#344556;">Hello ${fullName || "there"},</p>
              <p style="color:#344556;">Thank you for registering on PropertiesNexus. Click below to verify your email and activate your account.</p>
              <div style="margin:30px 0;">
                <a href="${linkData.properties.action_link}" style="background:#2862e8;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">
                  Confirm your email
                </a>
              </div>
              <p style="color:#6b7986;font-size:12px;margin-top:40px;padding-top:20px;border-top:1px solid #e1e5e8;">
                If you did not request this, you can safely ignore this email.
              </p>
            </div>
          `,
        });

        // Log but don't block — user is already created in Supabase
        if (resendError) {
          console.error("[Resend] Email send failed:", resendError);
        }
      } catch (emailErr) {
        console.error("[Resend] Unexpected email error:", emailErr);
        // Still don't block — registration succeeded
      }
    } else {
      // Dev mode, non-test recipient: log the verify link so you can test manually
      console.log(
        `[Dev] Skipping email to <${email}>. Verify link:\n${linkData.properties.action_link}`,
      );
    }
    // ─────────────────────────────────────────────────────────────────────────

    return NextResponse.json({ success: true, user: { id: userId } });
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
