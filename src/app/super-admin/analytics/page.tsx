import { createClient } from "@/utils/supabase/server";

type RoleRow = { role: string; count: number };
type CityRow = { city: string; count: number };
type DayRow = { day: string; count: number };

async function getAnalytics(supabase: Awaited<ReturnType<typeof createClient>>) {
  // Role distribution
  const { data: roleData } = await supabase
    .from("profiles")
    .select("role");

  const roleCounts: Record<string, number> = {};
  (roleData ?? []).forEach((r: { role: string }) => {
    roleCounts[r.role] = (roleCounts[r.role] || 0) + 1;
  });
  const roles: RoleRow[] = Object.entries(roleCounts).map(([role, count]) => ({ role, count }));

  // Listings by city
  const { data: cityData } = await supabase
    .from("property_submissions")
    .select("city");

  const cityCounts: Record<string, number> = {};
  (cityData ?? []).forEach((r: { city: string }) => {
    if (r.city) cityCounts[r.city] = (cityCounts[r.city] || 0) + 1;
  });
  const cities: CityRow[] = Object.entries(cityCounts)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Sign-ups last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const { data: signupData } = await supabase
    .from("profiles")
    .select("created_at")
    .gte("created_at", sevenDaysAgo.toISOString());

  const dayCounts: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dayCounts[d.toISOString().slice(0, 10)] = 0;
  }
  (signupData ?? []).forEach((r: { created_at: string }) => {
    const day = r.created_at.slice(0, 10);
    if (day in dayCounts) dayCounts[day]++;
  });
  const days: DayRow[] = Object.entries(dayCounts).map(([day, count]) => ({
    day: new Date(day).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
    count,
  }));

  // Listing status breakdown
  const { data: statusData } = await supabase
    .from("property_submissions")
    .select("status");

  const statusCounts: Record<string, number> = {};
  (statusData ?? []).forEach((r: { status: string }) => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  });

  return { roles, cities, days, statusCounts };
}

const ROLE_COLORS: Record<string, string> = {
  user: "#6b7280",
  agent: "#6366f1",
  builder: "#14b8a6",
  lister: "#06b6d4",
  admin: "#f97316",
  super_admin: "#ef4444",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "#9ca3af",
  submitted: "#3b82f6",
  under_review: "#f59e0b",
  changes_requested: "#f97316",
  approved: "#10b981",
  rejected: "#ef4444",
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { roles, cities, days, statusCounts } = await getAnalytics(supabase);

  const maxSignups = Math.max(...days.map((d) => d.count), 1);
  const maxCity = Math.max(...cities.map((c) => c.count), 1);
  const totalRoles = roles.reduce((a, r) => a + r.count, 0) || 1;

  return (
    <div className="p-8 max-w-[1400px] w-full mx-auto">
      <div className="mb-8">
        <p className="text-[13px] text-[#9ca3af] mb-1">Super Admin / Analytics</p>
        <h1 className="text-[30px] font-bold text-[#111827]">Platform Analytics</h1>
        <p className="text-[14px] text-[#6b7280] mt-1">
          Sign-up trends, listing distributions, and user role breakdown.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sign-up Trend */}
        <div className="bg-white rounded-2xl border border-[#e5e9ee] shadow-sm p-6">
          <h2 className="font-bold text-[15px] text-[#111827] mb-5">New Sign-ups (Last 7 Days)</h2>
          <div className="flex items-end gap-3 h-[180px]">
            {days.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-[11px] font-bold text-[#111827]">{d.count}</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-[#0a0f1c] to-[#3b4a6b] transition-all"
                  style={{ height: `${(d.count / maxSignups) * 100}%`, minHeight: d.count > 0 ? "8px" : "2px" }}
                />
                <span className="text-[10px] text-[#9ca3af] text-center whitespace-pre-line leading-tight">{d.day}</span>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-[#9ca3af] mt-4">
            Total: <strong className="text-[#111827]">{days.reduce((a, d) => a + d.count, 0)}</strong> new users this week
          </p>
        </div>

        {/* Role Distribution */}
        <div className="bg-white rounded-2xl border border-[#e5e9ee] shadow-sm p-6">
          <h2 className="font-bold text-[15px] text-[#111827] mb-5">User Role Distribution</h2>
          {roles.length === 0 ? (
            <p className="text-[13px] text-[#9ca3af] text-center py-8">No user data yet.</p>
          ) : (
            <div className="space-y-3">
              {roles.sort((a, b) => b.count - a.count).map((r) => (
                <div key={r.role}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="font-semibold text-[#374151] capitalize">{r.role}</span>
                    <span className="text-[#6b7280]">{r.count} ({Math.round((r.count / totalRoles) * 100)}%)</span>
                  </div>
                  <div className="h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(r.count / totalRoles) * 100}%`,
                        backgroundColor: ROLE_COLORS[r.role] || "#6b7280",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Listings by City */}
        <div className="bg-white rounded-2xl border border-[#e5e9ee] shadow-sm p-6">
          <h2 className="font-bold text-[15px] text-[#111827] mb-5">Listings by City (Top 10)</h2>
          {cities.length === 0 ? (
            <p className="text-[13px] text-[#9ca3af] text-center py-8">No listings yet.</p>
          ) : (
            <div className="space-y-3">
              {cities.map((c) => (
                <div key={c.city}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="font-semibold text-[#374151]">{c.city}</span>
                    <span className="text-[#6b7280]">{c.count}</span>
                  </div>
                  <div className="h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#d49a38] to-[#f0c060] transition-all"
                      style={{ width: `${(c.count / maxCity) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Listing Status Breakdown */}
        <div className="bg-white rounded-2xl border border-[#e5e9ee] shadow-sm p-6">
          <h2 className="font-bold text-[15px] text-[#111827] mb-5">Listing Status Breakdown</h2>
          {Object.keys(statusCounts).length === 0 ? (
            <p className="text-[13px] text-[#9ca3af] text-center py-8">No listings yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div
                  key={status}
                  className="rounded-xl p-4 flex items-center gap-3"
                  style={{ backgroundColor: (STATUS_COLORS[status] || "#9ca3af") + "15" }}
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: STATUS_COLORS[status] || "#9ca3af" }}
                  />
                  <div>
                    <p className="text-[12px] font-bold text-[#111827]">{count}</p>
                    <p className="text-[10px] text-[#6b7280] capitalize">{status.replace(/_/g, " ")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
