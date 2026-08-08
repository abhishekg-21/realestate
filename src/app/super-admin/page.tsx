import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

async function getStats(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [
    { count: totalUsers },
    { count: totalListings },
    { count: pendingApprovals },
    { count: approvedListings },
    { count: rejectedListings },
    { data: recentUsers },
    { data: recentListings },
    { data: auditLogs },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("property_submissions").select("*", { count: "exact", head: true }),
    supabase
      .from("property_submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "submitted"),
    supabase
      .from("property_submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved"),
    supabase
      .from("property_submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "rejected"),
    supabase
      .from("profiles")
      .select("id, full_name, role, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("property_submissions")
      .select("id, title, city, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("admin_audit_logs")
      .select("id, action, admin_email, details, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return {
    totalUsers: totalUsers ?? 0,
    totalListings: totalListings ?? 0,
    pendingApprovals: pendingApprovals ?? 0,
    approvedListings: approvedListings ?? 0,
    rejectedListings: rejectedListings ?? 0,
    recentUsers: recentUsers ?? [],
    recentListings: recentListings ?? [],
    auditLogs: auditLogs ?? [],
  };
}

const statusColor: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  submitted: "bg-blue-100 text-blue-700",
  under_review: "bg-yellow-100 text-yellow-700",
  changes_requested: "bg-orange-100 text-orange-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const roleColor: Record<string, string> = {
  user: "bg-slate-100 text-slate-700",
  buyer: "bg-blue-100 text-blue-700",
  seller: "bg-purple-100 text-purple-700",
  agent: "bg-indigo-100 text-indigo-700",
  builder: "bg-teal-100 text-teal-700",
  developer: "bg-amber-100 text-amber-800",
  investor: "bg-emerald-100 text-emerald-800",
  admin: "bg-orange-100 text-orange-700",
  super_admin: "bg-red-100 text-red-700",
};

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: number | string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#e5e9ee] p-6 flex flex-col gap-2 shadow-sm">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${color}`}>
        {sub?.startsWith("🔴") ? "🔴" : sub?.startsWith("🟢") ? "🟢" : "📊"}
      </span>
      <span className="text-[13px] text-[#6b7280] font-medium mt-1">{label}</span>
      <span className="text-[32px] font-bold text-[#111827] leading-none">{value}</span>
      {sub && (
        <span className="text-[12px] text-[#9ca3af]">
          {sub.replace(/^🔴\s*|^🟢\s*/, "")}
        </span>
      )}
    </div>
  );
}

export default async function SuperAdminOverview() {
  const supabase = await createClient();
  const stats = await getStats(supabase);

  return (
    <div className="p-8 max-w-[1400px] w-full mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[13px] text-slate-500 font-medium mb-1">Super Admin / Overview</p>
        <h1 className="text-[34px] font-bold text-[#111827] tracking-tight">
          Platform Command Centre
        </h1>
        <p className="text-[14px] text-slate-600 mt-1">
          Real-time overview of the entire PropertiesNexus platform.
        </p>
      </div>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-[#e5e9ee] p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl mb-3">👥</div>
          <p className="text-[13px] text-slate-600 font-medium">Total Users</p>
          <p className="text-[32px] font-bold text-[#111827] leading-none mt-1">{stats.totalUsers}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#e5e9ee] p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-xl mb-3">🏠</div>
          <p className="text-[13px] text-slate-600 font-medium">Total Listings</p>
          <p className="text-[32px] font-bold text-[#111827] leading-none mt-1">{stats.totalListings}</p>
        </div>
        <div className="bg-[#d49a38] rounded-2xl p-6 shadow-sm text-white">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl mb-3">⏳</div>
          <p className="text-[13px] font-semibold text-white/90">Pending Approvals</p>
          <p className="text-[32px] font-bold leading-none mt-1 text-white">{stats.pendingApprovals}</p>
          <Link href="/super-admin/approvals" className="text-[12px] font-bold mt-3 inline-block bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg transition-colors">
            Review now →
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-[#e5e9ee] p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-xl mb-3">✅</div>
          <p className="text-[13px] text-[#6b7280] font-medium">Approved</p>
          <p className="text-[32px] font-bold text-[#111827] leading-none mt-1">{stats.approvedListings}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#e5e9ee] p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-xl mb-3">❌</div>
          <p className="text-[13px] text-[#6b7280] font-medium">Rejected</p>
          <p className="text-[32px] font-bold text-[#111827] leading-none mt-1">{stats.rejectedListings}</p>
        </div>
      </section>

      {/* Two column panels */}
      <section className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-[#e5e9ee] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f3f4f6]">
            <h2 className="font-bold text-[15px] text-[#111827]">Recent Sign-ups</h2>
            <Link href="/super-admin/users" className="text-[12px] text-[#d49a38] font-bold hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[#f9fafb]">
            {stats.recentUsers.length === 0 && (
              <p className="px-6 py-8 text-[13px] text-[#9ca3af] text-center">No users yet</p>
            )}
            {stats.recentUsers.map((u: { id: string; full_name: string; role: string; created_at: string }) => (
              <div key={u.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#f3f4f6] flex items-center justify-center text-[13px] font-bold text-[#374151]">
                    {(u.full_name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#111827]">{u.full_name || "—"}</p>
                    <p className="text-[11px] text-[#9ca3af]">
                      {new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${roleColor[u.role] || "bg-gray-100 text-gray-600"}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Listings */}
        <div className="bg-white rounded-2xl border border-[#e5e9ee] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f3f4f6]">
            <h2 className="font-bold text-[15px] text-[#111827]">Recent Listings</h2>
            <Link href="/super-admin/approvals" className="text-[12px] text-[#d49a38] font-bold hover:underline">
              Review →
            </Link>
          </div>
          <div className="divide-y divide-[#f9fafb]">
            {stats.recentListings.length === 0 && (
              <p className="px-6 py-8 text-[13px] text-[#9ca3af] text-center">No listings yet</p>
            )}
            {stats.recentListings.map((l: { id: string; title: string; city: string; status: string; created_at: string }) => (
              <div key={l.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-[13px] font-semibold text-[#111827] truncate max-w-[200px]">{l.title}</p>
                  <p className="text-[11px] text-[#9ca3af]">
                    {l.city} · {new Date(l.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${statusColor[l.status] || "bg-gray-100 text-gray-600"}`}>
                  {l.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audit Log Preview */}
      <div className="bg-white rounded-2xl border border-[#e5e9ee] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f3f4f6]">
          <h2 className="font-bold text-[15px] text-[#111827]">Recent Admin Actions</h2>
          <Link href="/super-admin/audit-log" className="text-[12px] text-[#d49a38] font-bold hover:underline">
            Full log →
          </Link>
        </div>
        {stats.auditLogs.length === 0 ? (
          <p className="px-6 py-8 text-[13px] text-[#9ca3af] text-center">
            No admin actions recorded yet. Actions you take will appear here.
          </p>
        ) : (
          <div className="divide-y divide-[#f9fafb]">
            {stats.auditLogs.map((log: { id: string; action: string; admin_email: string; details: Record<string, string>; created_at: string }) => (
              <div key={log.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-[#111827] capitalize">
                    {log.action.replace(/_/g, " ")}
                  </p>
                  <p className="text-[11px] text-[#9ca3af]">by {log.admin_email}</p>
                </div>
                <p className="text-[11px] text-[#9ca3af]">
                  {new Date(log.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-gradient-to-r from-[#0a0f1c] to-[#1a2540] rounded-2xl p-6 flex flex-wrap gap-3">
        <Link href="/super-admin/approvals"
          className="bg-[#d49a38] font-bold text-[13px] px-5 py-3 rounded-xl hover:bg-[#f0b844] transition-colors"
          style={{ color: "#0a0f1c" }}>
          ⚡ Review Pending Properties
        </Link>
        <Link href="/super-admin/users"
          className="bg-white/10 border border-white/20 font-semibold text-[13px] px-5 py-3 rounded-xl hover:bg-white/20 transition-colors"
          style={{ color: "#ffffff" }}>
          👥 Manage Users
        </Link>
        <Link href="/super-admin/notifications"
          className="bg-white/10 border border-white/20 font-semibold text-[13px] px-5 py-3 rounded-xl hover:bg-white/20 transition-colors"
          style={{ color: "#ffffff" }}>
          📣 Broadcast Notification
        </Link>
        <Link href="/super-admin/settings"
          className="bg-white/10 border border-white/20 font-semibold text-[13px] px-5 py-3 rounded-xl hover:bg-white/20 transition-colors"
          style={{ color: "#ffffff" }}>
          ⚙️ Platform Settings
        </Link>
      </div>
    </div>
  );
}
