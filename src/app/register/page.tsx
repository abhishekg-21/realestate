"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { setCachedUser } from "@/lib/auth-cache";
import AuthLayout from "@/components/auth-layout";

const ROLES = [
  {
    value: "user",
    label: "Property Buyer",
    icon: "🏠",
    desc: "I'm looking to buy or rent a property",
  },
  {
    value: "agent",
    label: "Real Estate Agent",
    icon: "🤝",
    desc: "I help clients buy, sell or rent properties",
  },
  {
    value: "builder",
    label: "Builder / Developer",
    icon: "🏗️",
    desc: "I develop and sell new construction projects",
  },
  {
    value: "lister",
    label: "Property Owner",
    icon: "🔑",
    desc: "I want to list my property for sale or rent",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"error" | "success">("error");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      setMsg("Please select your account type.");
      setMsgType("error");
      return;
    }
    setLoading(true);
    setMsg("Creating account…");
    setMsgType("success");

    const fullName = `${first} ${last}`.trim() || email.split("@")[0];

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            role: selectedRole,
          },
        },
      });

      if (error) {
        setMsg(error.message);
        setMsgType("error");
        setLoading(false);
        return;
      }

      // Update profile role immediately after signup
      if (data?.user?.id) {
        const profileSupabase = createClient();
        await profileSupabase.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName,
          phone,
          role: selectedRole,
        });
      }

      if (data?.session) {
        setCachedUser({
          name: fullName,
          email: data.user?.email || email,
          role: selectedRole,
        });
        setMsg("Account created! Redirecting to dashboard…");
        setMsgType("success");
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
        return;
      }

      // Try auto sign in
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInData?.session) {
        // Update profile role after sign in
        if (signInData.user?.id) {
          await supabase.from("profiles").upsert({
            id: signInData.user.id,
            full_name: fullName,
            phone,
            role: selectedRole,
          });
        }
        setCachedUser({
          name: fullName,
          email: signInData.user?.email || email,
          role: selectedRole,
        });
        setMsg("Account created! Redirecting to dashboard…");
        setMsgType("success");
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      } else {
        setMsg("Account created! Please sign in.");
        setMsgType("success");
        setTimeout(() => {
          router.push(
            "/login?message=" + encodeURIComponent("Account created! Please sign in.")
          );
        }, 800);
      }
    } catch (err: any) {
      setMsg(err.message || "An unexpected error occurred.");
      setMsgType("error");
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="India's considered property network"
      title="Your next chapter starts here."
      highlightedWord="here."
      description="Create a secure account to save properties, create match alerts and manage every enquiry in one place."
      fact1Value="28"
      fact1Label="States covered"
      fact2Value="350+"
      fact2Label="Neighbourhoods"
    >
      <h2 className="font-serif text-[39px] max-md:text-[34px] font-medium tracking-[-1.4px] m-0 mb-[6px] text-ink">
        Create your account
      </h2>
      <p className="text-[13px] leading-[1.6] text-muted m-0 mb-[22px]">
        Instant access upon registration. No email confirmation required.
      </p>

      {/* Step indicator */}
      <div className="flex items-center gap-[10px] mb-[28px]">
        <div
          className={`flex items-center justify-center w-[26px] h-[26px] rounded-full text-[11px] font-bold transition-all ${
            step === 1
              ? "bg-[#1c2b39] text-white"
              : "bg-[#d1e8c0] text-[#2a7a3a]"
          }`}
        >
          {step === 1 ? "1" : "✓"}
        </div>
        <span className={`text-[11px] font-semibold ${step === 1 ? "text-ink" : "text-[#5a9e6a]"}`}>
          Account type
        </span>
        <div className="flex-1 h-[1px] bg-line" />
        <div
          className={`flex items-center justify-center w-[26px] h-[26px] rounded-full text-[11px] font-bold transition-all ${
            step === 2
              ? "bg-[#1c2b39] text-white"
              : "bg-[#eef0f2] text-[#8b9aa5]"
          }`}
        >
          2
        </div>
        <span className={`text-[11px] font-semibold ${step === 2 ? "text-ink" : "text-muted"}`}>
          Your details
        </span>
      </div>

      {/* STEP 1 — Role selection */}
      {step === 1 && (
        <div>
          <p className="text-[12px] font-bold text-ink mb-[14px] uppercase tracking-[0.06em]">
            What best describes you?
          </p>
          <div className="grid grid-cols-1 gap-[10px] mb-[24px]">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setSelectedRole(r.value)}
                className={`flex items-center gap-[14px] text-left p-[14px] rounded-[10px] border-2 transition-all cursor-pointer w-full ${
                  selectedRole === r.value
                    ? "border-[#1c2b39] bg-[#f3f6f8] shadow-[0_0_0_2px_rgba(28,43,57,0.10)]"
                    : "border-line bg-white hover:border-[#a9b5bf] hover:bg-[#fafbfb]"
                }`}
              >
                <span className="text-[28px] leading-none shrink-0">{r.icon}</span>
                <span className="flex flex-col">
                  <span
                    className={`text-[13px] font-bold leading-snug ${
                      selectedRole === r.value ? "text-[#1c2b39]" : "text-ink"
                    }`}
                  >
                    {r.label}
                  </span>
                  <span className="text-[11px] text-muted leading-snug mt-[2px]">
                    {r.desc}
                  </span>
                </span>
                {selectedRole === r.value && (
                  <span className="ml-auto shrink-0 w-[20px] h-[20px] rounded-full bg-[#1c2b39] flex items-center justify-center">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.8 7L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={!selectedRole}
            onClick={() => setStep(2)}
            className="h-[49px] border-0 rounded-[8px] bg-navy hover:bg-navy2 text-white w-full text-[13px] font-bold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      )}

      {/* STEP 2 — Details form */}
      {step === 2 && (
        <form onSubmit={handleRegister} className="flex flex-col">
          {/* Selected role pill */}
          <div className="flex items-center gap-[8px] mb-[18px]">
            <span className="text-[18px]">
              {ROLES.find((r) => r.value === selectedRole)?.icon}
            </span>
            <span className="text-[12px] font-semibold text-[#1c2b39]">
              {ROLES.find((r) => r.value === selectedRole)?.label}
            </span>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="ml-auto text-[11px] text-[#9a6419] font-bold border-0 bg-transparent cursor-pointer hover:underline p-0"
            >
              Change
            </button>
          </div>

          <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-[12px] my-[10px]">
            <label className="block">
              <span className="block text-[11px] font-bold text-ink mb-[7px]">First name</span>
              <input
                type="text"
                required
                autoComplete="given-name"
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                placeholder="First name"
                className="w-full h-[47px] border border-line rounded-[8px] px-[12px] text-[13px] outline-0 bg-white text-ink focus:border-[#a9772b] focus:shadow-[0_0_0_3px_rgba(203,141,49,0.14)] transition-all"
              />
            </label>
            <label className="block">
              <span className="block text-[11px] font-bold text-ink mb-[7px]">Last name</span>
              <input
                type="text"
                required
                autoComplete="family-name"
                value={last}
                onChange={(e) => setLast(e.target.value)}
                placeholder="Last name"
                className="w-full h-[47px] border border-line rounded-[8px] px-[12px] text-[13px] outline-0 bg-white text-ink focus:border-[#a9772b] focus:shadow-[0_0_0_3px_rgba(203,141,49,0.14)] transition-all"
              />
            </label>
          </div>

          <label className="block my-[10px]">
            <span className="block text-[11px] font-bold text-ink mb-[7px]">Email address</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-[47px] border border-line rounded-[8px] px-[12px] text-[13px] outline-0 bg-white text-ink focus:border-[#a9772b] focus:shadow-[0_0_0_3px_rgba(203,141,49,0.14)] transition-all"
            />
          </label>

          <label className="block my-[10px]">
            <span className="block text-[11px] font-bold text-ink mb-[7px]">
              Phone number <small className="font-normal text-muted">(optional)</small>
            </span>
            <input
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 00000 00000"
              className="w-full h-[47px] border border-line rounded-[8px] px-[12px] text-[13px] outline-0 bg-white text-ink focus:border-[#a9772b] focus:shadow-[0_0_0_3px_rgba(203,141,49,0.14)] transition-all"
            />
          </label>

          <label className="block my-[10px] relative">
            <span className="block text-[11px] font-bold text-ink mb-[7px]">Create password</span>
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full h-[47px] border border-line rounded-[8px] px-[12px] text-[13px] outline-0 bg-white text-ink focus:border-[#a9772b] focus:shadow-[0_0_0_3px_rgba(203,141,49,0.14)] transition-all pr-[50px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-[9px] bottom-[15px] border-0 bg-white text-[#62717c] text-[11px] cursor-pointer font-bold hover:text-ink"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </label>

          <label className="flex items-center gap-[8px] text-[11px] my-[10px] text-[#687783] cursor-pointer font-normal">
            <input
              type="checkbox"
              required
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="rounded border-line shrink-0"
            />
            I agree to the Terms and Privacy Policy.
          </label>

          <button
            type="submit"
            disabled={loading}
            className="h-[49px] border-0 rounded-[8px] bg-navy hover:bg-navy2 text-white w-full text-[13px] font-bold cursor-pointer mt-[9px] transition-colors disabled:opacity-65"
          >
            {loading ? "Creating account…" : "Create account"}
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
      )}

      <p className="text-center text-[12px] text-[#687783] mt-[22px] mb-0">
        Already have an account?{" "}
        <Link href="/login" className="text-[#9a6419] font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
