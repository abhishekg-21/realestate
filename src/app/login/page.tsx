"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { setCachedUser } from "@/lib/auth-cache";
import AuthLayout from "@/components/auth-layout";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"error" | "success">("error");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("Signing in…");
    setMsgType("success");

    // Extract default friendly name from email if no full name exists
    const prefix = email.split("@")[0];
    const friendlyName = prefix.charAt(0).toUpperCase() + prefix.slice(1);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMsg(error.message);
        setMsgType("error");
        setLoading(false);
        return;
      }

      let userRole = data?.user?.user_metadata?.role || "buyer";
      let fullName = data?.user?.user_metadata?.full_name || friendlyName;

      if (data?.user?.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", data.user.id)
          .single();
        if (profile?.role) userRole = profile.role;
        if (profile?.full_name) fullName = profile.full_name;
      }

      // Cache user profile locally so Navbar updates reactively across all pages
      setCachedUser({
        name: fullName,
        email: email,
        role: userRole,
      });

      setMsg("Signed in. Opening your account…");
      setMsgType("success");
      const targetUrl = userRole === "super_admin" ? "/super-admin" : "/dashboard";
      setTimeout(() => {
        router.push(targetUrl);
      }, 500);
    } catch (err: any) {
      setMsg(err.message || "An unexpected error occurred during sign in.");
      setMsgType("error");
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="A better place to keep moving"
      title="Good decisions begin with clarity."
      highlightedWord="clarity."
      description="Sign in to save the places you care about, manage enquiries, and take your next property step with confidence."
      fact1Value="12k+"
      fact1Label="Active properties"
      fact2Value="250+"
      fact2Label="Verified partners"
    >
      <h2 className="font-serif text-[39px] max-md:text-[34px] font-medium tracking-[-1.4px] m-0 mb-[8px] text-ink">
        Welcome back
      </h2>
      <p className="text-[13px] leading-[1.6] text-muted m-0 mb-[27px]">
        Sign in securely to continue your property journey.
      </p>

      <form onSubmit={handleLogin} className="flex flex-col">
        <label className="block my-[14px]">
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

        <label className="block my-[14px] relative">
          <span className="block text-[11px] font-bold text-ink mb-[7px]">Password</span>
          <input
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
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

        <div className="flex justify-between items-center text-[11px] my-[14px] text-[#687783]">
          <label className="flex items-center gap-[6px] cursor-pointer font-normal">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="rounded border-line"
            />
            Keep me signed in
          </label>
          <Link href="/forgot-password" className="text-[#9a6419] font-bold hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-[49px] border-0 rounded-[8px] bg-navy hover:bg-navy2 text-white w-full text-[13px] font-bold cursor-pointer mt-[9px] transition-colors disabled:opacity-65"
        >
          {loading ? "Signing in…" : "Sign in"}
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

      <p className="text-center text-[12px] text-[#687783] mt-[22px] mb-0">
        New to PropertiesNexus?{" "}
        <Link href="/register" className="text-[#9a6419] font-bold hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
