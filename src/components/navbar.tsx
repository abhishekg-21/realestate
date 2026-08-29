"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  getCachedUser,
  clearCachedUser,
  getSavedPropertyIds,
  AUTH_CHANGE_EVENT,
  SAVED_CHANGE_EVENT,
  UserCache,
} from "@/lib/auth-cache";

interface NavbarProps {
  variant?: "dark" | "light";
}

export default function Navbar({ variant }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserCache | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [toastMsg, setToastMsg] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isDark = variant === "dark" || (!variant && pathname === "/");

  const loadUserState = async () => {
    // 1. Check local account cache first for instant UI response
    const cached = getCachedUser();
    if (cached) {
      setUser(cached);
    }
    // 2. Always verify against Supabase active session & profiles table in background
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        let role = session.user.user_metadata?.role || cached?.role || "buyer";
        let name = session.user.user_metadata?.full_name || cached?.name || session.user.email?.split("@")[0] || "User";
        try {
          const { data: dbProfile } = await supabase.from("profiles").select("role, full_name").eq("id", session.user.id).single();
          if (dbProfile?.role) role = dbProfile.role;
          if (dbProfile?.full_name) name = dbProfile.full_name;
        } catch { }
        const profile: UserCache = {
          name,
          email: session.user.email || "",
          role,
          avatar: (name || session.user.email || "U").charAt(0).toUpperCase(),
        };
        setUser(profile);
      } else if (!cached) {
        setUser(null);
      }
    } catch {
      if (!cached) setUser(null);
    }

    setSavedCount(getSavedPropertyIds().length);
  };

  useEffect(() => {
    loadUserState();

    const handleAuthChange = () => loadUserState();
    const handleSavedChange = () => setSavedCount(getSavedPropertyIds().length);

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    window.addEventListener(SAVED_CHANGE_EVENT, handleSavedChange);

    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
      window.removeEventListener(SAVED_CHANGE_EVENT, handleSavedChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const showToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(""), 2500);
  };

  const handleSignOut = async () => {
    setProfileMenuOpen(false);
    setMobileOpen(false);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Sign out error", e);
    }
    clearCachedUser();
    setUser(null);
    showToast("Signed out securely.");
    router.push("/");
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[9999] w-full ${isDark
          ? "bg-navy/95 text-white border-b border-white/20"
          : "bg-white/95 text-ink border-b border-line shadow-sm"
          } backdrop-blur-md`}
      >
        <div
          className="
      mx-auto flex h-[72px] w-full max-w-[1216px] items-center
      gap-4 px-4
      sm:px-6
      lg:h-[83px] lg:px-0
    "
        >
          {/* LOGO */}
          <Link
            href="/"
            className="
        flex shrink-0 items-center whitespace-nowrap
        text-[16px] font-bold tracking-[1px]
        sm:text-[18px]
      "
          >
            <span className="mr-2 inline-flex h-[23px] items-end gap-[2px]">
              <i className="block h-[11px] w-[4px] bg-gold" />
              <i className="block h-[20px] w-[4px] bg-gold" />
              <i className="block h-[15px] w-[4px] bg-gold" />
            </span>

            Properties
            <span
              className={
                isDark ? "font-normal opacity-75" : "font-normal text-[#697886]"
              }
            >
              Nexus
            </span>
          </Link>

          {/* DESKTOP / LAPTOP NAV */}
          <nav
            className={`
        hidden items-center gap-5 border-l pl-5
        text-[12px] font-semibold
        lg:flex
        xl:gap-7 xl:pl-6 xl:text-[13px]
        ${isDark
                ? "border-white/25 text-white/90"
                : "border-line text-[#596875]"
              }
      `}
          >
            <Link href="/properties?view=map" className="hover:opacity-70">
              Map
            </Link>

            <Link href="/properties" className="hover:opacity-70">
              Properties
            </Link>

            <Link href="/guidance" className="hover:opacity-70">
              Guidance
            </Link>

            <Link
              href={pathname === "/" ? "#agents" : "/#agents"}
              className="hover:opacity-70"
            >
              For partners
            </Link>
          </nav>

          {/* RIGHT SIDE */}
          <div className="ml-auto flex min-w-0 items-center gap-2">
            {user ? (
              <>
                {/* Dashboard - large screens only */}
                <Link
                  href="/dashboard"
                  className={`
              hidden rounded-full px-3 py-2 text-[12px] font-bold
              xl:inline-block
              ${isDark
                      ? "border border-white/20 bg-white/15 text-white hover:bg-white/25"
                      : "border border-line bg-[#f3f5f7] text-[#1c2b39] hover:bg-[#e8eaed]"
                    }
            `}
                >
                  My Dashboard
                </Link>

                {/* List Property - large screens only */}
                <Link
                  href="/dashboard/add-property"
                  className="
              hidden rounded-full bg-[#1c2b39]
              px-4 py-2 text-[12px] font-bold !text-white
              hover:bg-[#2c3f52]
              xl:inline-flex
            "
                >
                  List property
                </Link>

                {/* Notifications */}
                <button
                  onClick={() => router.push("/user-dashboard?view=alerts")}
                  className={`
              relative flex h-[36px] w-[36px] shrink-0
              items-center justify-center rounded-full
              ${isDark
                      ? "border border-white/30 bg-white/10 hover:bg-white/20"
                      : "border border-line bg-white text-[#50606d] hover:bg-gray-50"
                    }
            `}
                  title="Active alerts & updates"
                >
                  🔔

                  {savedCount > 0 && (
                    <span className="absolute right-[3px] top-[2px] h-2 w-2 rounded-full bg-gold ring-2 ring-white" />
                  )}
                </button>

                {/* PROFILE */}
                <div className="relative shrink-0" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className={`
                flex items-center gap-2 rounded-full
                border p-1 pr-2.5
                ${isDark
                        ? "border-white/35 bg-white/10 text-white hover:bg-white/20"
                        : "border-line bg-white text-ink hover:bg-gray-50"
                      }
              `}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#d7a343] to-[#a76b1d] text-[13px] font-serif text-white">
                      {user.avatar || user.name.charAt(0)}
                    </span>

                    {/* Hide name on tablet/mobile */}
                    <span className="hidden max-w-[90px] truncate text-[12px] sm:block">
                      {user.name.split(" ")[0]}
                    </span>

                    <span className="text-[9px] opacity-70">▼</span>
                  </button>

                  {/* PROFILE DROPDOWN */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 top-[calc(100%+10px)] z-[10000] w-[250px] rounded-xl border border-line bg-white p-2 text-ink shadow-[0_15px_35px_rgba(7,24,45,0.18)]">
                      <div className="mb-1 rounded-lg border-b border-[#edf0f1] bg-[#f8fafb] p-3">
                        <b className="block truncate text-[13px]">
                          {user.name}
                        </b>

                        <span className="mt-1 block truncate text-[11px] text-muted">
                          {user.email || "Signed in account"}
                        </span>

                        <span className="mt-1.5 inline-block rounded-full bg-[#eef5fb] px-2 py-0.5 text-[9px] font-bold uppercase text-[#1c558e]">
                          {user.role || "Buyer"} Account
                        </span>
                      </div>

                      <div className="flex flex-col text-[12px] font-semibold text-[#40515e]">
                        <Link
                          href="/dashboard"
                          onClick={() => setProfileMenuOpen(false)}
                          className="rounded-md p-2.5 hover:bg-gray-50"
                        >
                          🏠 My Dashboard
                        </Link>

                        <Link
                          href="/user-dashboard?view=saved"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex justify-between rounded-md p-2.5 hover:bg-gray-50"
                        >
                          <span>♡ Saved spaces</span>

                          {savedCount > 0 && (
                            <span className="rounded-full bg-[#edf0f2] px-2 py-0.5 text-[10px]">
                              {savedCount}
                            </span>
                          )}
                        </Link>

                        <Link
                          href="/user-dashboard?view=messages"
                          onClick={() => setProfileMenuOpen(false)}
                          className="rounded-md p-2.5 hover:bg-gray-50"
                        >
                          💬 Conversations
                        </Link>

                        <Link
                          href="/user-dashboard?view=settings"
                          onClick={() => setProfileMenuOpen(false)}
                          className="rounded-md p-2.5 hover:bg-gray-50"
                        >
                          ⚙ Account Studio
                        </Link>
                      </div>

                      <div className="my-1 border-t border-[#edf0f1] pt-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full rounded-md p-2.5 text-left text-[12px] font-bold text-red hover:bg-red/5"
                        >
                          🚪 Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Partner - desktop */}
                <Link
                  href={pathname === "/" ? "#agents" : "/#agents"}
                  className={`
              hidden px-2 py-2 text-[12px]
              lg:inline-block
              ${isDark ? "text-white" : "text-[#596875]"}
            `}
                >
                  Partner with us
                </Link>

                {/* Login */}
                <Link
                  href="/login"
                  className={`
              whitespace-nowrap rounded-full border
              px-3 py-1.5 text-[11px]
              sm:px-4 sm:py-2 sm:text-[13px]
              ${isDark
                      ? "border-white/40 text-white hover:bg-white/10"
                      : "border-line text-ink hover:bg-gray-50"
                    }
            `}
                >
                  Log in
                </Link>

                {/* Register */}
                <Link
                  href="/register"
                  className="
              whitespace-nowrap rounded-full
              bg-[#1c2b39] px-3 py-1.5
              text-[11px] font-bold !text-white
              sm:px-4 sm:py-2 sm:text-[13px]
              hover:bg-[#2c3f52]
            "
                >
                  <span className="hidden sm:inline">Get started</span>
                  <span className="sm:hidden">Start</span>
                </Link>
              </>
            )}

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="
          ml-1 flex h-9 w-9 shrink-0
          items-center justify-center
          rounded-lg text-xl
          md:flex lg:hidden
        "
              aria-label="Toggle Menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div
          className={`
      fixed left-0 right-0 top-[72px] z-[9998]
      max-h-[calc(100vh-72px)] overflow-y-auto
      border-b p-5 shadow-2xl
      lg:hidden
      sm:top-[72px]
      ${isDark
              ? "border-white/20 bg-navy text-white"
              : "border-line bg-white text-ink"
            }
    `}
        >
          <div className="mx-auto flex max-w-[1216px] flex-col gap-3">
            <Link
              href="/properties?view=map"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 font-semibold hover:bg-white/10"
            >
              Map
            </Link>

            <Link
              href="/properties"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 font-semibold hover:bg-white/10"
            >
              Properties
            </Link>

            <Link
              href="/guidance"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 font-semibold hover:bg-white/10"
            >
              Guidance
            </Link>

            <Link
              href={pathname === "/" ? "#agents" : "/#agents"}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 font-semibold hover:bg-white/10"
            >
              For partners
            </Link>

            {user && (
              <>
                <div
                  className={`my-1 border-t ${isDark ? "border-white/10" : "border-line"
                    }`}
                />

                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 font-bold hover:bg-white/10"
                >
                  My Dashboard
                </Link>

                <Link
                  href="/dashboard/add-property"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 font-semibold hover:bg-white/10"
                >
                  List property
                </Link>

                <Link
                  href="/user-dashboard?view=saved"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 font-semibold hover:bg-white/10"
                >
                  Saved spaces ({savedCount})
                </Link>

                <Link
                  href="/user-dashboard?view=messages"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 font-semibold hover:bg-white/10"
                >
                  Conversations
                </Link>

                <Link
                  href="/user-dashboard?view=settings"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 font-semibold hover:bg-white/10"
                >
                  Account Studio
                </Link>

                <button
                  onClick={handleSignOut}
                  className="rounded-lg px-3 py-2.5 text-left font-bold text-red hover:bg-red/5"
                >
                  🚪 Sign out
                </button>
              </>
            )}

            {!user && (
              <>
                <div
                  className={`my-1 border-t ${isDark ? "border-white/10" : "border-line"
                    }`}
                />

                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 font-semibold hover:bg-white/10"
                >
                  Log in
                </Link>

                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 font-semibold hover:bg-white/10"
                >
                  Create user account
                </Link>

                <Link
                  href="/business-signup"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 font-bold text-gold hover:bg-white/10"
                >
                  Partner sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}


      {/* Toast Notice */}
      {toastMsg && (
        <div className="fixed bottom-[20px] right-[20px] bg-[#143b60] text-white p-[12px_18px] rounded-[8px] text-[13px] shadow-[0_10px_25px_rgba(0,0,0,0.25)] z-50 animate-bounce font-semibold flex items-center gap-2">
          <span>✓</span>
          {toastMsg}
        </div>
      )}
    </>
  );
}
