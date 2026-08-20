import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

// ── helpers ─────────────────────────────────────────────────────────────────
function Badge({
  text,
  color,
}: {
  text: string;
  color: "blue" | "green" | "amber" | "red" | "gray";
}) {
  const map: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    gray: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`text-[10px] font-bold px-[8px] py-[3px] rounded-full shrink-0 whitespace-nowrap ${map[color]}`}
    >
      {text}
    </span>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub: string;
  accent: string;
}) {
  return (
    <article className="bg-white border border-line rounded-[10px] p-[18px] max-sm:p-[14px] hover:shadow-sm transition-shadow">
      <span className="text-[11px] text-muted font-semibold block mb-[10px]">
        {label}
      </span>
      <b
        className={`block font-serif text-[30px] max-sm:text-[24px] font-medium leading-none mb-[6px] ${accent}`}
      >
        {value}
      </b>
      <small className="text-[10px] text-muted font-medium block">{sub}</small>
    </article>
  );
}

function EmptyState({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-[40px] text-center">
      <span className="text-[40px] mb-[12px]">{icon}</span>
      <p className="text-[14px] font-semibold text-ink mb-[6px]">{title}</p>
      <p className="text-[12px] text-muted max-w-[260px]">{desc}</p>
    </div>
  );
}

function statusBadgeColor(
  status: string,
): "blue" | "green" | "amber" | "red" | "gray" {
  if (status === "approved") return "green";
  if (status === "rejected") return "red";
  if (status === "under_review") return "amber";
  if (status === "changes_requested") return "red";
  if (status === "submitted") return "blue";
  return "gray";
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    draft: "Draft",
    submitted: "Submitted",
    under_review: "Under Review",
    changes_requested: "Changes Needed",
    approved: "Approved ✓",
    rejected: "Rejected",
  };
  return map[status] || status;
}

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

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    redirect("/login?message=Please sign in to access your dashboard.");

  // Real profile from DB
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, phone, created_at")
    .eq("id", user.id)
    .single();

  const role = profile?.role || "user";
  const firstName = (
    profile?.full_name ||
    user.email?.split("@")[0] ||
    "there"
  ).split(" ")[0];

  // ── Fetch role-specific real data ────────────────────────────────────────
  let submissions: any[] = [];
  let submissionCounts = {
    draft: 0,
    submitted: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
    changes_requested: 0,
  };

  if (["agent", "builder", "lister", "super_admin"].includes(role)) {
    const { data } = await supabase
      .from("property_submissions")
      .select(
        "id, title, city, state, status, intent, price, bedrooms, created_at, updated_at",
      )
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(5);
    submissions = data || [];

    // Count by status
    const { data: allSubs } = await supabase
      .from("property_submissions")
      .select("status")
      .eq("owner_id", user.id);
    (allSubs || []).forEach((s: any) => {
      const k = s.status as keyof typeof submissionCounts;
      if (k in submissionCounts) submissionCounts[k]++;
    });
  }

  const totalListings = Object.values(submissionCounts).reduce(
    (a, b) => a + b,
    0,
  );

  // ── Role-specific headings & actions ─────────────────────────────────────
  const roleConfig: Record<
    string,
    {
      title: string;
      sub: string;
      primaryAction: { label: string; href: string };
    }
  > = {
    user: {
      title: `Welcome back, ${firstName} 👋`,
      sub: "Browse properties, save your favourites and track your enquiries.",
      primaryAction: { label: "Browse Properties", href: "/properties" },
    },
    agent: {
      title: `Good to see you, ${firstName} 👔`,
      sub: "Manage your listings, track leads and stay on top of viewings.",
      primaryAction: {
        label: "+ Add Listing",
        href: "/dashboard/add-property",
      },
    },
    builder: {
      title: `Project dashboard – ${firstName} 🏗️`,
      sub: "Monitor projects, track inventory and manage qualified leads.",
      primaryAction: {
        label: "+ Add Project",
        href: "/dashboard/add-property",
      },
    },
    lister: {
      title: `Hello, ${firstName} 🔑`,
      sub: "Submit your properties and track their review and approval status.",
      primaryAction: {
        label: "+ Submit Property",
        href: "/dashboard/add-property",
      },
    },
    super_admin: {
      title: `Admin Console ⚡`,
      sub: "You have full platform access.",
      primaryAction: { label: "Admin Panel", href: "/super-admin" },
    },
  };

  const config = roleConfig[role] || roleConfig.user;

  return (
    <div className="p-[27px_clamp(18px,4vw,52px)_60px] max-w-[1300px] w-full mx-auto font-sans">
      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-[30px]">
        <div className="flex items-center gap-[10px]">
          <span className="text-[24px] leading-none">
            {ROLE_EMOJI[role] || "👤"}
          </span>
          <div>
            <p className="text-[10px] text-muted font-bold uppercase tracking-[0.07em] m-0">
              Dashboard
            </p>
            <p className="text-[13px] font-bold text-ink m-0">
              {ROLE_LABELS[role] || role}
            </p>
          </div>
        </div>
        <Link
          href={config.primaryAction.href}
          className="inline-flex items-center border-0 bg-[#1c2b39] !text-white rounded-[8px] px-[18px] h-[38px] text-[13px] font-bold hover:bg-[#2c3f52] transition-colors no-underline"
        >
          {config.primaryAction.label}
        </Link>
      </div>

      {/* ── Heading ────────────────────────────────────────────────────────── */}
      <section className="mb-[28px]">
        <h1 className="font-serif text-[36px] max-sm:text-[28px] tracking-[-1.5px] font-medium m-0 mb-[6px] text-ink">
          {config.title}
        </h1>
        <p className="m-0 text-muted text-[13px]">{config.sub}</p>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          BUYER dashboard
      ══════════════════════════════════════════════════════════════════════ */}
      {role === "user" && (
        <>
          {/* Stats */}
          <section className="grid grid-cols-3 max-sm:grid-cols-1 gap-[14px] mb-[20px]">
            <StatCard
              label="Member since"
              value={new Date(
                profile?.created_at || Date.now(),
              ).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })}
              sub="Account active"
              accent="text-[#1c7cde]"
            />
            <StatCard
              label="Saved Properties"
              value="—"
              sub="Sign in on any device to sync"
              accent="text-[#d48a11]"
            />
            <StatCard
              label="Browse Properties"
              value="→"
              sub="Explore live listings now"
              accent="text-[#2d8a5f]"
            />
          </section>

          <div className="grid grid-cols-[1.4fr_0.8fr] max-lg:grid-cols-1 gap-[16px] mb-[16px]">
            <article className="bg-white border border-line rounded-[10px] p-[22px]">
              <h2 className="text-[15px] font-bold text-ink mb-[16px] m-0">
                Your saved properties
              </h2>
              <EmptyState
                icon="🔖"
                title="No saved properties yet"
                desc="Browse the marketplace and tap the heart icon to save properties you like."
              />
              <div className="flex justify-center mt-[8px]">
                <Link
                  href="/properties"
                  className="inline-flex items-center bg-[#1c2b39] !text-white rounded-[8px] px-[18px] h-[38px] text-[13px] font-bold hover:bg-[#2c3f52] transition-colors no-underline"
                >
                  Browse Properties
                </Link>
              </div>
            </article>
            <article className="bg-white border border-line rounded-[10px] p-[22px]">
              <h2 className="text-[15px] font-bold text-ink mb-[16px] m-0">
                Quick Actions
              </h2>
              <div className="flex flex-col gap-[10px]">
                <Link
                  href="/properties"
                  className="flex items-center gap-[10px] p-[12px] border border-line rounded-[8px] text-[13px] font-semibold text-ink hover:border-[#1c2b39] hover:bg-[#f8f9fa] transition-colors no-underline"
                >
                  <span className="text-[18px]">🔍</span> Browse Marketplace
                </Link>
                <Link
                  href="/user-dashboard?view=saved"
                  className="flex items-center gap-[10px] p-[12px] border border-line rounded-[8px] text-[13px] font-semibold text-ink hover:border-[#1c2b39] hover:bg-[#f8f9fa] transition-colors no-underline"
                >
                  <span className="text-[18px]">❤️</span> Saved Properties
                </Link>
                <Link
                  href="/user-dashboard?view=alerts"
                  className="flex items-center gap-[10px] p-[12px] border border-line rounded-[8px] text-[13px] font-semibold text-ink hover:border-[#1c2b39] hover:bg-[#f8f9fa] transition-colors no-underline"
                >
                  <span className="text-[18px]">🔔</span> Price Alerts
                </Link>
                <Link
                  href="/user-dashboard?view=settings"
                  className="flex items-center gap-[10px] p-[12px] border border-line rounded-[8px] text-[13px] font-semibold text-ink hover:border-[#1c2b39] hover:bg-[#f8f9fa] transition-colors no-underline"
                >
                  <span className="text-[18px]">⚙️</span> Account Settings
                </Link>
              </div>
            </article>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          LISTER / AGENT / BUILDER dashboard
      ══════════════════════════════════════════════════════════════════════ */}
      {["lister", "agent", "builder"].includes(role) && (
        <>
          {/* Real stats from DB */}
          <section className="grid grid-cols-4 max-md:grid-cols-2 max-sm:grid-cols-2 gap-[14px] mb-[20px]">
            <StatCard
              label="Total Submissions"
              value={totalListings || "0"}
              sub="All time"
              accent="text-[#1c7cde]"
            />
            <StatCard
              label="Approved"
              value={submissionCounts.approved || "0"}
              sub="Live on platform"
              accent="text-[#2d8a5f]"
            />
            <StatCard
              label="Under Review"
              value={
                submissionCounts.under_review + submissionCounts.submitted ||
                "0"
              }
              sub="Awaiting admin check"
              accent="text-[#d48a11]"
            />
            <StatCard
              label="Action Needed"
              value={submissionCounts.changes_requested || "0"}
              sub="Changes requested"
              accent="text-[#c0392b]"
            />
          </section>

          <div className="grid grid-cols-[1.4fr_0.8fr] max-lg:grid-cols-1 gap-[16px] mb-[16px]">
            {/* Real submissions table */}
            <article className="bg-white border border-line rounded-[10px] p-[22px]">
              <div className="flex justify-between items-center mb-[16px]">
                <h2 className="text-[15px] font-bold text-ink m-0">
                  Recent Submissions
                </h2>
                <Link
                  href="/dashboard/properties"
                  className="text-[#a66d1c] text-[11px] font-bold hover:underline no-underline"
                >
                  View all →
                </Link>
              </div>

              {submissions.length === 0 ? (
                <>
                  <EmptyState
                    icon="📋"
                    title="No submissions yet"
                    desc="Submit your first property to get started. Once submitted, it will appear here with a live status."
                  />
                  <div className="flex justify-center mt-[8px]">
                    <Link
                      href="/dashboard/add-property"
                      className="inline-flex items-center bg-[#1c2b39] !text-white rounded-[8px] px-[18px] h-[38px] text-[13px] font-bold hover:bg-[#2c3f52] transition-colors no-underline"
                    >
                      + Submit First Property
                    </Link>
                  </div>
                </>
              ) : (
                <div className="grid gap-[10px]">
                  {submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center gap-[14px] border border-[#eef0f2] rounded-[8px] p-[13px] hover:border-[#d4d8db] transition-colors"
                    >
                      <div className="w-[42px] h-[42px] rounded-[8px] bg-[#f3f5f7] flex items-center justify-center text-[20px] shrink-0">
                        {role === "builder" ? "🏗️" : "🏠"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[12px] font-bold m-0 mb-[2px] text-ink truncate">
                          {sub.title}
                        </h3>
                        <p className="text-[11px] text-muted m-0">
                          {sub.city}, {sub.state}
                          {sub.price
                            ? ` · ₹${Number(sub.price).toLocaleString("en-IN")}`
                            : ""}
                        </p>
                      </div>
                      <Badge
                        text={statusLabel(sub.status)}
                        color={statusBadgeColor(sub.status)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </article>

            {/* Quick actions panel */}
            <article className="bg-white border border-line rounded-[10px] p-[22px]">
              <h2 className="text-[15px] font-bold text-ink mb-[16px] m-0">
                Quick Actions
              </h2>
              <div className="flex flex-col gap-[10px]">
                <Link
                  href="/dashboard/add-property"
                  className="flex items-center gap-[10px] p-[12px] bg-[#1c2b39] rounded-[8px] text-[13px] font-semibold !text-white hover:bg-[#2c3f52] transition-colors no-underline"
                >
                  <span className="text-[18px]">➕</span>
                  {role === "builder" ? "Add Project" : "Submit Property"}
                </Link>
                <Link
                  href="/dashboard/properties"
                  className="flex items-center gap-[10px] p-[12px] border border-line rounded-[8px] text-[13px] font-semibold text-ink hover:border-[#1c2b39] hover:bg-[#f8f9fa] transition-colors no-underline"
                >
                  <span className="text-[18px]">📋</span> My Submissions
                </Link>
                <Link
                  href="/dashboard/leads"
                  className="flex items-center gap-[10px] p-[12px] border border-line rounded-[8px] text-[13px] font-semibold text-ink hover:border-[#1c2b39] hover:bg-[#f8f9fa] transition-colors no-underline"
                >
                  <span className="text-[18px]">👥</span> Leads & Enquiries
                </Link>
                <Link
                  href="/dashboard/billing"
                  className="flex items-center gap-[10px] p-[12px] border border-line rounded-[8px] text-[13px] font-semibold text-ink hover:border-[#1c2b39] hover:bg-[#f8f9fa] transition-colors no-underline"
                >
                  <span className="text-[18px]">💳</span> Billing
                </Link>
                <Link
                  href="/user-dashboard?view=settings"
                  className="flex items-center gap-[10px] p-[12px] border border-line rounded-[8px] text-[13px] font-semibold text-ink hover:border-[#1c2b39] hover:bg-[#f8f9fa] transition-colors no-underline"
                >
                  <span className="text-[18px]">⚙️</span> Account Settings
                </Link>
              </div>
            </article>
          </div>

          {/* Approval status summary */}
          {submissionCounts.changes_requested > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-[10px] p-[16px] flex items-center gap-[14px]">
              <span className="text-[28px]">⚠️</span>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-red-700 m-0 mb-[2px]">
                  Action required on {submissionCounts.changes_requested}{" "}
                  submission{submissionCounts.changes_requested > 1 ? "s" : ""}
                </p>
                <p className="text-[11px] text-red-600 m-0">
                  The admin has requested changes. Review and update your
                  submissions.
                </p>
              </div>
              <Link
                href="/dashboard/properties"
                className="inline-flex items-center bg-red-600 !text-white rounded-[8px] px-[14px] h-[34px] text-[12px] font-bold hover:bg-red-700 transition-colors no-underline shrink-0"
              >
                Review Now
              </Link>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SUPER ADMIN shortcut
      ══════════════════════════════════════════════════════════════════════ */}
      {role === "super_admin" && (
        <div className="bg-[#1c2b39] rounded-[12px] p-[28px] text-white text-center">
          <p className="text-[40px] mb-[12px]">⚡</p>
          <h2 className="font-serif text-[24px] font-medium m-0 mb-[8px]">
            You have Super Admin access
          </h2>
          <p className="text-[13px] text-white/70 m-0 mb-[20px]">
            Access the full admin console to manage users, listings, settings
            and analytics.
          </p>
          <Link
            href="/super-admin"
            className="inline-flex items-center bg-[#e5ad43] text-[#1c2b39] rounded-[8px] px-[24px] h-[42px] text-[14px] font-bold hover:bg-[#f0be57] transition-colors no-underline"
          >
            Open Admin Panel →
          </Link>
        </div>
      )}
    </div>
  );
}
