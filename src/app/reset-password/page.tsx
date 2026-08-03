"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import AuthLayout from "@/components/auth-layout";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"error" | "success">("error");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (password !== confirm) {
      setMsg("The passwords do not match.");
      setMsgType("error");
      return;
    }

    setLoading(true);
    setMsg("Saving…");
    setMsgType("success");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      setMsg("Password updated. You can sign in now.");
      setMsgType("success");
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (err: any) {
      setMsg(err.message || "Failed to update password. Please try again.");
      setMsgType("error");
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Secure account recovery"
      title="Set a password that feels new."
      highlightedWord="new."
      description="Choose a strong password with at least eight characters."
      fact1Value="12k+"
      fact1Label="Active properties"
      fact2Value="250+"
      fact2Label="Verified partners"
    >
      <Link href="/login" className="text-[12px] text-[#667581] hover:underline inline-block mb-[40px] font-semibold">
        ← Back to sign in
      </Link>
      <h2 className="font-serif text-[39px] max-md:text-[34px] font-medium tracking-[-1.4px] m-0 mb-[8px] text-ink">
        Create a new password
      </h2>
      <p className="text-[13px] leading-[1.6] text-muted m-0 mb-[27px]">
        Your reset link has securely identified your account.
      </p>

      <form onSubmit={handleSave} className="flex flex-col">
        <label className="block my-[14px]">
          <span className="block text-[11px] font-bold text-ink mb-[7px]">New password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full h-[47px] border border-line rounded-[8px] px-[12px] text-[13px] outline-0 bg-white text-ink focus:border-[#a9772b] focus:shadow-[0_0_0_3px_rgba(203,141,49,0.14)] transition-all"
          />
        </label>

        <label className="block my-[14px]">
          <span className="block text-[11px] font-bold text-ink mb-[7px]">Confirm new password</span>
          <input
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat new password"
            className="w-full h-[47px] border border-line rounded-[8px] px-[12px] text-[13px] outline-0 bg-white text-ink focus:border-[#a9772b] focus:shadow-[0_0_0_3px_rgba(203,141,49,0.14)] transition-all"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="h-[49px] border-0 rounded-[8px] bg-navy hover:bg-navy2 text-white w-full text-[13px] font-bold cursor-pointer mt-[9px] transition-colors disabled:opacity-65"
        >
          {loading ? "Saving…" : "Save new password"}
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
