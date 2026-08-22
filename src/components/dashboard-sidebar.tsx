"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

// Role-specific nav links
const ROLE_NAV: Record<string, { label: string; href: string; dot?: string }[]> = {
  user: [
    { label: "My Dashboard", href: "/dashboard" },
    { label: "Browse Properties", href: "/properties" },
    { label: "My Listed Properties", href: "/dashboard/properties" },
    { label: "Saved Properties", href: "/dashboard/saved properties" },
    { label: "My Enquiries", href: "/user-dashboard?view=enquiries" },
    { label: "Price Alerts", href: "/user-dashboard?view=alerts" },
    { label: "Account Settings", href: "/user-dashboard?view=settings" },
  ],
  agent: [
    { label: "My Dashboard", href: "/dashboard" },
    { label: "Add Listing", href: "/dashboard/add-property", dot: "green" },
    { label: "My Listings", href: "/dashboard/properties" },
    { label: "Leads & Enquiries", href: "/dashboard/leads" },
    { label: "Earnings & Billing", href: "/dashboard/billing" },
    { label: "Account Settings", href: "/user-dashboard?view=settings" },
  ],
  builder: [
    { label: "Project Overview", href: "/dashboard" },
    { label: "Add Project", href: "/dashboard/add-property", dot: "green" },
    { label: "My Projects", href: "/dashboard/properties" },
    { label: "Lead Reports", href: "/dashboard/leads" },
    { label: "Billing & Packages", href: "/dashboard/billing" },
    { label: "Account Settings", href: "/user-dashboard?view=settings" },
  ],
  lister: [
    { label: "My Dashboard", href: "/dashboard" },
    { label: "Submit Property", href: "/dashboard/add-property", dot: "green" },
    { label: "My Submissions", href: "/dashboard/properties" },
    { label: "Enquiries", href: "/dashboard/leads" },
    { label: "Billing", href: "/dashboard/billing" },
    { label: "Account Settings", href: "/user-dashboard?view=settings" },
  ],
  super_admin: [
    { label: "Admin Console ⚡", href: "/super-admin" },
    { label: "Pending Approvals", href: "/super-admin/approvals", dot: "green" },
    { label: "User Management", href: "/super-admin/users" },
    { label: "Platform Analytics", href: "/super-admin/analytics" },
    { label: "Audit Log", href: "/super-admin/audit-log" },
    { label: "Platform Settings", href: "/super-admin/settings" },
  ],
};

const ROLE_LABELS: Record<string, string> = {
  user: "Property Buyer",
  agent: "Real Estate Agent",
  builder: "Builder / Developer",
  lister: "Property Owner",
  super_admin: "Super Admin",
};

const ROLE_EMOJI: Record<string, string> = {
  user: "🏠",
  agent: "🤝",
  builder: "🏗️",
  lister: "🔑",
  super_admin: "⚡",
};

export default function DashboardSidebar({
  userEmail,
  role,
  fullName,
}: {
  userEmail: string;
  role: string;
  fullName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navLinks = ROLE_NAV[role] || ROLE_NAV["user"];
  const isActive = (href: string) => {
    if (href === "/dashboard" && pathname === "/dashboard" && !searchParams.toString()) return true;
    if (href === "/super-admin" && pathname === "/super-admin" && !searchParams.toString()) return true;
    if (href !== "/dashboard" && href !== "/super-admin" && pathname.startsWith(href.split("?")[0])) return true;
    if (href.includes("?") && pathname + "?" + searchParams.toString() === href) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#051426] text-white h-[60px] flex items-center justify-between px-4 sticky top-0 z-50 border-b border-white/15">
        <Link href="/" className="font-bold tracking-[1.2px] text-[18px] flex items-center whitespace-nowrap">
          <span className="inline-flex items-end gap-[2px] mr-2 h-[20px]">
            <i className="block w-[3px] h-[9px] bg-gold" />
            <i className="block w-[3px] h-[16px] bg-gold" />
            <i className="block w-[3px] h-[12px] bg-gold" />
          </span>
          Properties<span className="font-normal opacity-75">Nexus</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white text-2xl font-bold p-1"
          aria-label="Toggle Menu"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-[#051426] text-white p-[26px_20px] flex flex-col gap-[20px] w-[255px] shrink-0 min-h-screen max-md:min-h-0 max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 transition-transform duration-200 ${isOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full md:translate-x-0"
          }`}
      >
        {/* Brand */}
        <Link href="/" className="font-bold tracking-[1.2px] text-[18px] flex items-center whitespace-nowrap max-md:hidden">
          <span className="inline-flex items-end gap-[2px] mr-2 h-[23px]">
            <i className="block w-[4px] h-[11px] bg-gold" />
            <i className="block w-[4px] h-[20px] bg-gold" />
            <i className="block w-[4px] h-[15px] bg-gold" />
          </span>
          Properties<span className="font-normal opacity-75">Nexus</span>
        </Link>

        {/* Role badge */}
        <div className="flex items-center gap-[10px] bg-white/8 rounded-[10px] px-[13px] py-[11px]">
          <span className="text-[22px] leading-none">{ROLE_EMOJI[role] || "👤"}</span>
          <div className="min-w-0">
            <p className="text-[10px] text-white/70 font-bold uppercase tracking-[0.08em] m-0">Account type</p>
            <p className="text-[13px] text-white font-semibold m-0 truncate">{ROLE_LABELS[role] || role}</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-[4px]">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-[11px] p-[11px_13px] rounded-[10px] text-[13px] font-semibold transition-colors ${isActive(link.href)
                ? "bg-white/12 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
            >
              <i
                className={`w-[8px] h-[8px] rounded-full inline-block shrink-0 ${link.dot === "green"
                  ? "bg-green"
                  : isActive(link.href)
                    ? "bg-gold"
                    : "bg-white/25"
                  }`}
              />
              {link.label}
            </Link>
          ))}

          <div className="border-t border-white/10 mt-[6px] pt-[6px]">
            <Link
              href="/properties"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-[11px] p-[11px_13px] rounded-[10px] text-[13px] font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <i className="w-[8px] h-[8px] rounded-full bg-white/25 inline-block shrink-0" />
              Browse Marketplace
            </Link>
          </div>
        </nav>

        {/* User chip */}
        <div className="mt-auto border-t border-white/15 pt-[18px]">
          <div className="flex items-center gap-[10px] mb-[12px]">
            <div className="w-[34px] h-[34px] rounded-full bg-gold flex items-center justify-center text-[14px] font-bold text-[#051426] shrink-0">
              {(fullName || userEmail || "U").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <b className="block text-white text-[13px] truncate font-semibold">
                {fullName || userEmail?.split("@")[0] || "User"}
              </b>
              <span className="block truncate text-white/70 text-[11px]">{userEmail}</span>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-[#e5ad43] font-bold bg-transparent border-0 p-0 hover:underline cursor-pointer text-[12px] text-left"
            >
              Sign out →
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
