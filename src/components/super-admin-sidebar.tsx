"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  {
    href: "/super-admin",
    label: "Overview",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    exact: true,
  },
  {
    href: "/super-admin/approvals",
    label: "Property Approvals",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    badge: "pending",
  },
  {
    href: "/super-admin/users",
    label: "User Management",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    href: "/super-admin/analytics",
    label: "Analytics",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    href: "/super-admin/notifications",
    label: "Notifications",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
    ),
  },
  {
    href: "/super-admin/settings",
    label: "Platform Settings",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
      </svg>
    ),
  },
  {
    href: "/super-admin/audit-log",
    label: "Audit Log",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
];

export default function SuperAdminSidebar({
  userEmail,
  userName,
}: {
  userEmail: string;
  userName: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-[28px_24px_18px]">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex items-end gap-[2px] h-[22px]">
            <i className="block w-[3px] h-[9px] bg-[#d49a38]" />
            <i className="block w-[3px] h-[18px] bg-[#d49a38]" />
            <i className="block w-[3px] h-[13px] bg-[#d49a38]" />
          </span>
          <span className="font-bold text-[17px] tracking-[0.8px] text-white">
            Properties<span className="font-normal opacity-60">Nexus</span>
          </span>
        </Link>
        <div className="mt-3 flex items-center gap-2 bg-[#c84f4b]/20 border border-[#c84f4b]/40 rounded-lg px-3 py-2">
          <span className="w-2 h-2 rounded-full bg-[#ff6b6b] animate-pulse shrink-0" />
          <span className="text-[11px] font-bold text-[#ff9999] tracking-wider uppercase">
            Admin Panel
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 flex-1">
        <p className="text-[10px] font-bold tracking-[1.5px] text-[#4a5568] uppercase px-3 mb-1">
          Control Panel
        </p>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-[10px] rounded-lg text-[13px] font-semibold transition-all duration-150 ${
              isActive(item.href, item.exact)
                ? "bg-[#d49a38] text-[#0a0f1c] shadow-[0_2px_12px_rgba(212,154,56,0.4)]"
                : "text-[#8899aa] hover:bg-white/8 hover:text-white"
            }`}
          >
            <span className={isActive(item.href, item.exact) ? "text-[#0a0f1c]" : "text-[#8899aa]"}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}

        <div className="border-t border-white/10 mt-3 pt-3">
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-[10px] rounded-lg text-[13px] font-semibold text-[#8899aa] hover:bg-white/8 hover:text-white transition-all"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            User Dashboard
          </Link>
        </div>
      </nav>

      {/* User chip */}
      <div className="p-[18px_24px] border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#d49a38] to-[#f0c060] flex items-center justify-center text-[#0a0f1c] font-bold text-[14px] shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-[13px] font-semibold truncate">{userName}</p>
            <p className="text-[#8899aa] text-[11px] truncate">{userEmail}</p>
          </div>
        </div>
        <form action="/auth/signout" method="post" className="mt-3">
          <button
            type="submit"
            className="text-[#d49a38] text-[11px] font-bold bg-transparent border-0 p-0 hover:underline cursor-pointer"
          >
            Sign out →
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="md:hidden bg-[#0a0f1c] text-white h-14 flex items-center justify-between px-4 sticky top-0 z-50 border-b border-white/10">
        <Link href="/super-admin" className="font-bold text-[16px] tracking-[0.8px] flex items-center gap-2">
          <span className="inline-flex items-end gap-[2px] h-[18px]">
            <i className="block w-[3px] h-[8px] bg-[#d49a38]" />
            <i className="block w-[3px] h-[15px] bg-[#d49a38]" />
            <i className="block w-[3px] h-[11px] bg-[#d49a38]" />
          </span>
          Super Admin
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white text-2xl p-1"
          aria-label="Toggle Menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-[#0a0f1c] flex flex-col w-[270px] shrink-0 min-h-screen max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 transition-transform duration-200 ${
          mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full md:translate-x-0"
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
