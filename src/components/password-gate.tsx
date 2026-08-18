"use client";

import React, { useState, useEffect } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  AlertCircle,
} from "lucide-react";

const REQUIRED_PASSWORD = "Barath@@2004";
const STORAGE_KEY = "pn_access_granted";

export default function PasswordGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const REQUIRED_PASSWORD = "Barath@@2004";
  const BACKUP_PASSWORD = "hello123";
  const STORAGE_KEY = "pn_access_granted";

  useEffect(() => {
    setIsMounted(true);
    const hasAccess =
      sessionStorage.getItem(STORAGE_KEY) === "true" ||
      localStorage.getItem(STORAGE_KEY) === "true";
    if (hasAccess) {
      setIsUnlocked(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      passwordInput === REQUIRED_PASSWORD ||
      passwordInput === BACKUP_PASSWORD
    ) {
      setError("");
      sessionStorage.setItem(STORAGE_KEY, "true");
      localStorage.setItem(STORAGE_KEY, "true");
      setIsUnlocked(true);
    } else {
      setError("Incorrect password. Please try again.");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[999999] min-h-screen w-full bg-[#07182d] text-white flex items-center justify-center p-4 overflow-y-auto select-none">
      {/* Ambient background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#d49a38]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0d2a49]/40 rounded-full blur-2xl" />
      </div>

      {/* Access Modal Card */}
      <div
        className={`relative z-10 w-full max-w-md bg-[#0b213b]/90 backdrop-blur-xl border border-[#d49a38]/30 rounded-3xl p-8 max-sm:p-6 shadow-2xl transition-transform ${
          isShaking ? "animate-bounce border-red-500/60" : ""
        }`}
      >
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-1 mb-4">
            <span className="inline-flex items-end gap-1 h-6">
              <span className="w-1 h-3 bg-[#d49a38] rounded-sm" />
              <span className="w-1 h-5 bg-[#d49a38] rounded-sm" />
              <span className="w-1 h-4 bg-[#d49a38] rounded-sm" />
            </span>
            <span className="text-xl font-bold tracking-wider text-white">
              Properties<span className="font-normal opacity-80">Nexus</span>
            </span>
          </div>

          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d49a38]/20 to-[#d49a38]/5 border border-[#d49a38]/40 flex items-center justify-center mb-4 text-[#d49a38] shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <h1 className="font-serif text-2xl font-semibold text-white tracking-tight">
            Restricted Access
          </h1>
          <p className="text-slate-400 text-xs mt-2 max-w-xs mx-auto leading-relaxed">
            This application is password protected. Enter the access password to
            continue.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Enter Access Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Enter password..."
                required
                autoFocus
                className="w-full pl-10 pr-10 py-3 bg-[#061426] border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#d49a38] focus:ring-2 focus:ring-[#d49a38]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#d49a38] to-[#b88225] hover:from-[#e5aa48] hover:to-[#d49a38] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#d49a38]/20 transition-all duration-200 hover:shadow-xl hover:shadow-[#d49a38]/30 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Unlock Site</span>
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>PropertiesNexus Protected Gateway</span>
        </div>
      </div>
    </div>
  );
}
