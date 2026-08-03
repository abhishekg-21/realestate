"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import AuthLayout from "@/components/auth-layout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"error" | "success">("success");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("Sending…");
    setMsgType("success");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setMsg("If an account exists, a secure reset link is on its way.");
      setMsgType("success");
    } catch (err: any) {
      setMsg(err.message || "Failed to send reset link. Please try again.");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="We’ll help you find your way back."
      highlightedWord="back."
      description="Request a secure password reset link. It expires automatically for your protection."
      fact1Value="12k+"
      fact1Label="Active properties"
      fact2Value="250+"
      fact2Label="Verified partners"
    >
      <Link href="/login" className="text-[12px] text-[#667581] hover:underline inline-block mb-[40px] font-semibold">
        ← Back to sign in
      </Link>
      <h2 className="font-serif text-[39px] max-md:text-[34px] font-medium tracking-[-1.4px] m-0 mb-[8px] text-ink">
        Reset your password
      </h2>
      <p className="text-[13px] leading-[1.6] text-muted m-0 mb-[27px]">
        Enter the email address linked to your account.
      </p>

      <form onSubmit={handleReset} className="flex flex-col">
        <label className="block my-[14px]">
          <span className="block text-[11px] font-bold text-ink mb-[7px]">Email address</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-[47px] border border-line rounded-[8px] px-[12px] text-[13px] outline-0 bg-white text-ink focus:border-[#a9772b] focus:shadow-[0_0_0_3px_rgba(203,141,49,0.14)] transition-all"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="h-[49px] border-0 rounded-[8px] bg-navy hover:bg-navy2 text-white w-full text-[13px] font-bold cursor-pointer mt-[9px] transition-colors disabled:opacity-65"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>

        {msg && (
          <p
            className={`text-[11px] leading-[1.5] min-h-[18px] text-center my-[12px] font-semibold ${
              msgType === "success" ? "text-green" : "text-red"
            }`}
            aria-live="polite"
          >
            {msg}
          </p>
        )}
      </form>
    </AuthLayout>
  );
}
