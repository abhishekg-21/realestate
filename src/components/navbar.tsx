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
        className={`fixed top-0 left-0 right-0 w-full z-[9999] ${isDark
          ? "border-b border-white/20 text-white bg-navy/90 backdrop-blur-md"
          : "border-b border-line text-ink bg-white/90 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
          }`}
      >
        <div className="max-w-[1216px] w-[calc(100%-48px)] max-md:w-[calc(100%-32px)] mx-auto h-[83px] max-md:h-[67px] flex items-center gap-6">
          <Link
            href="/"
            className="font-bold tracking-[1.2px] text-lg flex items-center whitespace-nowrap"
          >
            <span className="inline-flex items-end gap-[2px] mr-2 h-[23px]">
              <i className="block w-[4px] h-[11px] bg-gold" />
              <i className="block w-[4px] h-[20px] bg-gold" />
              <i className="block w-[4px] h-[15px] bg-gold" />
            </span>
            Properties
            <span
              className={`font-normal ${isDark ? "opacity-75" : "text-[#697886]"
                }`}
            >
              Nexus
            </span>
          </Link>

          <nav
            className={`hidden md:flex items-center gap-[29px] border-l pl-6 text-[13px] font-semibold ${isDark
              ? "border-white/25 text-white/90"
              : "border-line text-[#596875]"
              }`}
          >
            <Link
              href="/properties?view=map"
              className="hover:opacity-100 transition-opacity"
            >
              Map
            </Link>
            <Link
              href="/properties"
              className="hover:opacity-100 transition-opacity"
            >
              Properties
            </Link>
            <Link
              href="/guidance"
              className="hover:opacity-100 transition-opacity"
            >
              Guidance
            </Link>
            <Link
              href={pathname === "/" ? "#agents" : "/#agents"}
              className="hover:opacity-100 transition-opacity"
            >
              For partners
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-[10px] text-[13px] max-md:text-[11px] font-bold">
            {user ? (
              /* AUTHENTICATED NAVBAR USER ACTIONS */
              <>
                <Link
                  href="/dashboard"
                  className={`hidden sm:inline-block px-3.5 py-2 rounded-[24px] transition-colors font-bold text-[13px] ${isDark
                    ? "bg-white/15 text-white hover:bg-white/25 border border-white/20"
                    : "bg-[#f3f5f7] text-[#1c2b39] hover:bg-[#e8eaed] border border-line"
                    }`}
                >
                  My Dashboard
                </Link>

                <Link
                  href="/dashboard/add-property"
                  className="hidden sm:inline-flex items-center px-4 py-2 rounded-[24px] bg-[#1c2b39] !text-white font-bold text-[13px] hover:bg-[#2c3f52] transition-colors"
                >
                  List property
                </Link>

                {/* Notifications Bell */}
                <button
                  onClick={() => router.push("/user-dashboard?view=alerts")}
                  className={`h-[36px] w-[36px] rounded-full flex items-center justify-center relative transition-colors cursor-pointer ${isDark
                    ? "border border-white/30 bg-white/10 text-white hover:bg-white/20"
                    : "border border-line bg-white text-[#50606d] hover:bg-gray-50"
                    }`}
                  title="Active alerts & updates"
                >
                  🔔
                  {savedCount > 0 && (
                    <span className="absolute top-[2px] right-[3px] h-[8px] w-[8px] rounded-full bg-gold ring-2 ring-white" />
                  )}
                </button>

                {/* Account Avatar Dropdown Container */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className={`flex items-center gap-[8px] p-[4px_11px_4px_5px] rounded-[22px] border transition-all cursor-pointer ${isDark
                      ? "border-white/35 bg-white/12 text-white hover:bg-white/20"
                      : "border-line bg-white text-ink hover:bg-gray-50 shadow-sm"
                      }`}
                  >
                    <span className="h-[28px] w-[28px] rounded-full bg-gradient-to-br from-[#d7a343] to-[#a76b1d] text-white flex items-center justify-center font-serif text-[13px] shrink-0 shadow-sm">
                      {user.avatar || user.name.charAt(0)}
                    </span>
                    <span className="max-sm:hidden truncate max-w-[100px] text-[12px]">
                      {user.name.split(" ")[0]}
                    </span>
                    <span className="text-[10px] opacity-70">▼</span>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 top-[calc(100%+10px)] w-[250px] bg-white text-ink border border-line rounded-[12px] shadow-[0_15px_35px_rgba(7,24,45,0.18)] p-[8px] z-50 animate-fadeIn font-sans">
                      {/* User Info Header */}
                      <div className="p-[10px_12px] border-b border-[#edf0f1] mb-[6px] bg-[#f8fafb] rounded-[8px]">
                        <b className="block text-[13px] text-ink truncate">{user.name}</b>
                        <span className="block text-[11px] text-muted truncate mt-[2px]">
                          {user.email || "Signed in account"}
                        </span>
                        <span className="inline-block mt-[6px] px-[8px] py-[2px] rounded-[10px] bg-[#eef5fb] text-[#1c558e] text-[9px] font-bold uppercase tracking-wide">
                          {user.role || "Buyer"} Account
                        </span>
                      </div>

                      {/* Dropdown Links */}
                      <div className="flex flex-col text-[12px] font-semibold text-[#40515e]">
                        {user.role === "super_admin" ? (
                          <>
                            <Link
                              href="/super-admin"
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center gap-[10px] p-[9px_12px] rounded-[7px] hover:bg-gray-50 hover:text-navy transition-colors text-[#9a6a1a] font-bold"
                            >
                              <span className="w-[6px] h-[6px] rounded-full bg-gold" />
                              Admin Console ⚡
                            </Link>
                            <Link
                              href="/super-admin/approvals"
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center gap-[10px] p-[9px_12px] rounded-[7px] hover:bg-gray-50 hover:text-navy transition-colors"
                            >
                              <span className="w-[6px] h-[6px] rounded-full bg-green" />
                              Pending Approvals
                            </Link>
                            <Link
                              href="/super-admin/users"
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center gap-[10px] p-[9px_12px] rounded-[7px] hover:bg-gray-50 hover:text-navy transition-colors"
                            >
                              <span className="w-[6px] h-[6px] rounded-full bg-[#52749a]" />
                              User Management
                            </Link>
                            <Link
                              href="/super-admin/settings"
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center gap-[10px] p-[9px_12px] rounded-[7px] hover:bg-gray-50 hover:text-navy transition-colors"
                            >
                              <span className="w-[6px] h-[6px] rounded-full bg-[#83919c]" />
                              Platform Settings
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              href="/dashboard"
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center gap-[10px] p-[9px_12px] rounded-[7px] hover:bg-gray-50 hover:text-navy transition-colors font-bold text-ink"
                            >
                              <span className="w-[6px] h-[6px] rounded-full bg-gold" />
                              My Dashboard
                            </Link>
                            <Link
                              href="/user-dashboard?view=saved"
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center justify-between p-[9px_12px] rounded-[7px] hover:bg-gray-50 hover:text-navy transition-colors"
                            >
                              <span className="flex items-center gap-[10px]">
                                <span className="w-[6px] h-[6px] rounded-full bg-[#e86a58]" />
                                Saved spaces
                              </span>
                              {savedCount > 0 && (
                                <span className="bg-[#edf0f2] text-ink text-[10px] font-bold px-[7px] py-[2px] rounded-full">
                                  {savedCount}
                                </span>
                              )}
                            </Link>
                            <Link
                              href="/user-dashboard?view=messages"
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center gap-[10px] p-[9px_12px] rounded-[7px] hover:bg-gray-50 hover:text-navy transition-colors"
                            >
                              <span className="w-[6px] h-[6px] rounded-full bg-green" />
                              Conversations
                            </Link>
                            <Link
                              href="/user-dashboard?view=settings"
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center gap-[10px] p-[9px_12px] rounded-[7px] hover:bg-gray-50 hover:text-navy transition-colors"
                            >
                              <span className="w-[6px] h-[6px] rounded-full bg-[#83919c]" />
                              Account Studio
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="border-t border-[#edf0f1] my-[6px] pt-[6px]">
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left flex items-center gap-[10px] p-[9px_12px] rounded-[7px] text-[12px] font-bold text-red hover:bg-red/5 transition-colors cursor-pointer border-0 bg-transparent"
                        >
                          🚪 Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* SIGNED OUT NAVBAR ACTIONS */
              <>
                <Link
                  href={pathname === "/" ? "#agents" : "/#agents"}
                  className={`hidden md:inline-block px-3 py-2 transition-opacity hover:opacity-80 ${isDark ? "text-white" : "text-[#596875]"
                    }`}
                >
                  Partner with us
                </Link>
                <Link
                  href="/login"
                  className={`whitespace-nowrap px-4 py-2 max-md:py-1.5 max-md:px-3 rounded-full border transition-colors ${isDark
                    ? "border-white/40 text-white hover:bg-white/10"
                    : "border-line text-ink hover:bg-gray-50"
                    }`}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="whitespace-nowrap px-4 py-2 max-md:py-1.5 max-md:px-3 rounded-full bg-[#1c2b39] !text-white font-bold text-[13px] hover:bg-[#2c3f52] transition-colors"
                >
                  Get started
                </Link>
              </>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden ml-1 p-1 text-lg"
              aria-label="Toggle Menu"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div
          className={`md:hidden fixed top-[67px] left-0 right-0 z-50 p-6 shadow-2xl border-b ${isDark
            ? "bg-navy text-white border-white/20"
            : "bg-white text-ink border-line"
            }`}
        >
          {user ? (
            <div className="flex flex-col gap-3">
              {/* Mobile User Header */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 border border-white/15 mb-2">
                <span className="h-[38px] w-[38px] rounded-full bg-gradient-to-br from-[#d7a343] to-[#a76b1d] text-white flex items-center justify-center font-serif text-[16px] shrink-0">
                  {user.avatar || user.name.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <b className="block text-sm truncate">{user.name}</b>
                  <span className="block text-xs opacity-75 truncate">{user.email}</span>
                </div>
              </div>

              {user.role === "super_admin" ? (
                <>
                  <Link
                    href="/super-admin"
                    onClick={() => setMobileOpen(false)}
                    className="py-1.5 font-bold text-sm text-gold flex items-center justify-between"
                  >
                    <span>Admin Console ⚡</span>
                    <span className="text-xs">→</span>
                  </Link>
                  <Link
                    href="/super-admin/approvals"
                    onClick={() => setMobileOpen(false)}
                    className="py-1.5 font-semibold text-sm flex items-center justify-between"
                  >
                    <span>Pending Approvals</span>
                    <span className="text-xs text-gold">→</span>
                  </Link>
                  <Link
                    href="/super-admin/users"
                    onClick={() => setMobileOpen(false)}
                    className="py-1.5 font-semibold text-sm flex items-center justify-between"
                  >
                    <span>User Management</span>
                    <span className="text-xs text-gold">→</span>
                  </Link>
                  <Link
                    href="/super-admin/settings"
                    onClick={() => setMobileOpen(false)}
                    className="py-1.5 font-semibold text-sm flex items-center justify-between"
                  >
                    <span>Platform Settings</span>
                    <span className="text-xs text-gold">→</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="py-1.5 font-bold text-sm flex items-center justify-between"
                  >
                    <span>My Dashboard</span>
                    <span className="text-xs text-gold">→</span>
                  </Link>
                  <Link
                    href="/user-dashboard?view=saved"
                    onClick={() => setMobileOpen(false)}
                    className="py-1.5 font-semibold text-sm flex items-center justify-between"
                  >
                    <span>Saved spaces ({savedCount})</span>
                    <span className="text-xs text-gold">→</span>
                  </Link>
                  <Link
                    href="/user-dashboard?view=messages"
                    onClick={() => setMobileOpen(false)}
                    className="py-1.5 font-semibold text-sm flex items-center justify-between"
                  >
                    <span>Conversations</span>
                    <span className="text-xs text-gold">→</span>
                  </Link>
                  <Link
                    href="/user-dashboard?view=settings"
                    onClick={() => setMobileOpen(false)}
                    className="py-1.5 font-semibold text-sm flex items-center justify-between"
                  >
                    <span>Account Studio</span>
                    <span className="text-xs text-gold">→</span>
                  </Link>
                </>
              )}
              <hr className={`my-2 ${isDark ? "border-white/15" : "border-line"}`} />
              <button
                onClick={handleSignOut}
                className="text-left py-1.5 font-bold text-sm text-red flex items-center gap-2 border-0 bg-transparent cursor-pointer"
              >
                🚪 Sign out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 font-semibold text-sm">
              <Link
                href="/properties?view=map"
                onClick={() => setMobileOpen(false)}
                className="py-1"
              >
                Map
              </Link>
              <Link
                href="/properties"
                onClick={() => setMobileOpen(false)}
                className="py-1"
              >
                Properties
              </Link>
              <Link
                href="/guidance"
                onClick={() => setMobileOpen(false)}
                className="py-1"
              >
                Guidance
              </Link>
              <Link
                href={pathname === "/" ? "#agents" : "/#agents"}
                onClick={() => setMobileOpen(false)}
                className="py-1"
              >
                For partners
              </Link>
              <hr
                className={`my-1 ${isDark ? "border-white/10" : "border-line"}`}
              />
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="py-1"
              >
                Log in
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="py-1"
              >
                Create user account
              </Link>
              <Link
                href="/business-signup"
                onClick={() => setMobileOpen(false)}
                className="py-1 font-bold text-gold"
              >
                Partner sign up
              </Link>
            </div>
          )}
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