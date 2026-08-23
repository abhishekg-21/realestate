"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { setCachedUser } from "@/lib/auth-cache";
import { createClient } from "@/utils/supabase/client";

function VerifyOTPContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"error" | "success">("error");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setMsg("Please enter all 6 digits.");
      setMsgType("error");
      return;
    }

    setLoading(true);
    setMsg("Verifying your code…");
    setMsgType("success");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpString }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || "Verification failed.");
        setMsgType("error");
        setLoading(false);
        return;
      }

      // Now sign in to create a real Supabase session
      // Password was set during registration — we need it here
      // So pass it via sessionStorage (set it in register page before redirecting)
      const tempPassword = sessionStorage.getItem("pn_temp_pw");

      if (tempPassword) {
        const supabase = createClient();
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({ email, password: tempPassword });

        sessionStorage.removeItem("pn_temp_pw"); // clean up immediately

        if (signInError) {
          // Verification succeeded but auto-login failed — redirect to login
          setMsg("Verified! Please sign in to continue.");
          setMsgType("success");
          setTimeout(() => router.push("/login?message=Email verified. Please sign in."), 1500);
          return;
        }
      }

      setCachedUser({
        name: data.user?.name || email.split("@")[0],
        email: data.user?.email || email,
        role: data.role || "buyer",
      });

      setMsg("Email verified! Redirecting…");
      setMsgType("success");

      setTimeout(() => {
        router.push(data.role === "super_admin" ? "/super-admin" : "/dashboard");
      }, 1000);
    } catch (err: any) {
      setMsg(err.message || "Something went wrong.");
      setMsgType("error");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    // Extra guard — don't even call the API if countdown isn't done
    if (!canResend) return;

    setResending(true);
    setMsg("");

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.status === 429) {
        // Supabase rate limit hit
        setMsg("Too many requests. Please wait a few minutes before trying again.");
        setMsgType("error");
        // Set a longer cooldown of 5 minutes
        setCountdown(300);
        setCanResend(false);
        return;
      }

      if (!res.ok) {
        setMsg(data.error || "Failed to resend. Please try again.");
        setMsgType("error");
        return;
      }

      setMsg("A new code has been sent to your email.");
      setMsgType("success");
      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      setMsg("Failed to resend. Please check your connection.");
      setMsgType("error");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-[20px]">
      <div className="bg-white border border-line rounded-2xl p-[40px] max-sm:p-[28px] w-full max-w-[420px] shadow-sm">

        {/* Icon */}
        <div className="w-[56px] h-[56px] rounded-full bg-[#eaf1ff] flex items-center justify-center text-[26px] mb-[24px] mx-auto">
          📧
        </div>

        <h1 className="font-serif text-[28px] font-medium tracking-[-1px] text-ink text-center m-0 mb-[8px]">
          Check your email
        </h1>
        <p className="text-[12px] text-muted text-center leading-[1.6] mb-[8px]">
          We sent a 6-digit verification code to
        </p>
        <p className="text-[13px] font-bold text-ink text-center mb-[32px]">
          {email || "your email address"}
        </p>

        {/* OTP Input boxes */}
        <div className="flex gap-[10px] justify-center mb-[28px]">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              className={`w-[52px] h-[56px] max-sm:w-[42px] max-sm:h-[48px] text-center text-[22px] font-bold border-2 rounded-xl outline-none transition-all text-ink
                ${digit ? "border-[#d49a38] bg-amber-50/30" : "border-slate-200 bg-white"}
                focus:border-[#d49a38] focus:shadow-[0_0_0_3px_rgba(212,154,56,0.15)]`}
            />
          ))}
        </div>

        {/* Verify button */}
        <button
          onClick={handleVerify}
          disabled={loading || otp.join("").length !== 6}
          className="w-full h-[48px] border-0 rounded-xl bg-navy hover:bg-navy2 text-white text-[13px] font-bold cursor-pointer transition-colors disabled:opacity-60 mb-[16px]"
        >
          {loading ? "Verifying…" : "Verify & Continue"}
        </button>

        {/* Message */}
        {msg && (
          <p className={`text-[11px] text-center font-semibold mb-[16px] leading-[1.5]
            ${msgType === "success" ? "text-emerald-600" : "text-red-600"}`}
            aria-live="polite"
          >
            {msg}
          </p>
        )}

        {/* Resend */}
        <div className="text-center">
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-[12px] font-bold text-[#d49a38] hover:underline border-0 bg-transparent cursor-pointer disabled:opacity-60"
            >
              {resending ? "Sending…" : "Resend code"}
            </button>
          ) : (
            <p className="text-[11px] text-muted">
              Resend code in{" "}
              <span className="font-bold text-ink">
                {countdown >= 60
                  ? `${Math.floor(countdown / 60)}m ${countdown % 60}s`
                  : `${countdown}s`}
              </span>
            </p>
          )}
        </div>

        {/* Back to register */}
        <p className="text-center text-[11px] text-muted mt-[24px] mb-0">
          Wrong email?{" "}
          <Link href="/register" className="text-[#d49a38] font-bold hover:underline">
            Go back
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" />}>
      <VerifyOTPContent />
    </Suspense>
  );
}