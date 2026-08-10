"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Countdown for resend button cooldown
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (!email || countdown > 0) return;
    setResendLoading(true);
    setResendMsg("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (error) {
        setResendMsg("Could not resend. Please try again in a few minutes.");
      } else {
        setResendMsg("Verification email resent! Check your inbox.");
        setCountdown(60); // 60 second cooldown
      }
    } catch {
      setResendMsg("An unexpected error occurred.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center px-4 font-sans">
      <div className="bg-white rounded-2xl shadow-sm border border-[#e4e8eb] max-w-[460px] w-full p-[48px_40px_40px] max-sm:p-[36px_24px_28px]">
        {/* Icon */}
        <div className="w-[68px] h-[68px] rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-[32px] mx-auto mb-[24px]">
          📬
        </div>

        <h1 className="font-serif text-[30px] font-medium tracking-[-1px] text-[#111827] text-center m-0 mb-[10px]">
          Check your inbox
        </h1>
        <p className="text-[13px] text-[#6b7280] leading-[1.65] text-center m-0 mb-[28px]">
          We&apos;ve sent a verification link to{" "}
          {email ? (
            <strong className="text-[#111827]">{email}</strong>
          ) : (
            "your email address"
          )}
          . Click the link in the email to activate your account.
        </p>

        {/* Steps */}
        <div className="bg-[#f9fafb] rounded-xl border border-[#e5e7eb] p-[18px_20px] mb-[24px] flex flex-col gap-[14px]">
          {[
            { step: "1", text: "Open the email from PropertiesNexus" },
            { step: "2", text: 'Click the "Confirm your email" button' },
            { step: "3", text: "You will be signed in automatically" },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-[12px]">
              <span className="w-[22px] h-[22px] rounded-full bg-[#1c2b39] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-[1px]">
                {step}
              </span>
              <span className="text-[13px] text-[#374151]">{text}</span>
            </div>
          ))}
        </div>

        {/* Resend */}
        {email && (
          <div className="text-center mb-[20px]">
            <p className="text-[12px] text-[#6b7280] mb-[10px]">
              Didn&apos;t receive it? Check your spam folder, or:
            </p>
            <button
              onClick={handleResend}
              disabled={resendLoading || countdown > 0}
              className="border border-[#d4d8db] rounded-[8px] px-[18px] h-[38px] text-[12px] font-bold text-[#374151] bg-white hover:bg-[#f9fafb] disabled:opacity-50 cursor-pointer transition-colors"
            >
              {resendLoading
                ? "Sending…"
                : countdown > 0
                ? `Resend in ${countdown}s`
                : "Resend verification email"}
            </button>
            {resendMsg && (
              <p
                className={`text-[11px] mt-[8px] font-semibold ${
                  resendMsg.includes("resent") ? "text-green-600" : "text-red-600"
                }`}
              >
                {resendMsg}
              </p>
            )}
          </div>
        )}

        <div className="border-t border-[#e5e7eb] pt-[20px] text-center">
          <Link
            href="/login"
            className="text-[12px] font-bold text-[#9a6419] hover:underline"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#6b7280]">Loading…</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
