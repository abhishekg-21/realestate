import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT!) || 465,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
    },
});

export async function sendOTPEmail(email: string, otp: string, fullName?: string) {
    await transporter.sendMail({
        from: process.env.SMTP_FROM!,
        to: email,
        subject: "Your PropertiesNexus verification code",
        html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e1e5e8;border-radius:12px;">
        <h2 style="color:#07182d;margin:0 0 8px;">Verify your account</h2>
        <p style="color:#596a75;font-size:14px;margin:0 0 28px;">
          Hello ${fullName || "there"}, use the code below to verify your PropertiesNexus account.
        </p>
        <div style="background:#f8f9fa;border:2px solid #e1e5e8;border-radius:10px;padding:24px;text-align:center;margin-bottom:28px;">
          <span style="font-family:monospace;font-size:48px;font-weight:bold;letter-spacing:12px;color:#07182d;">
            ${otp}
          </span>
        </div>
        <p style="color:#596a75;font-size:13px;margin:0 0 8px;">
          ⏱ This code expires in <strong>10 minutes</strong>.
        </p>
        <p style="color:#596a75;font-size:13px;margin:0;">
          🔒 Never share this code with anyone.
        </p>
        <hr style="border:none;border-top:1px solid #e1e5e8;margin:24px 0;" />
        <p style="color:#9aa5ab;font-size:11px;margin:0;">
          If you didn't create a PropertiesNexus account, you can safely ignore this email.
        </p>
      </div>
    `,
    });
}