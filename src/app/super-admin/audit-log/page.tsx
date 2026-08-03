import { createClient } from "@/utils/supabase/server";

type AuditLog = {
  id: string;
  admin_email: string;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, string>;
  created_at: string;
};

const actionStyle: Record<string, string> = {
  approve_property: "bg-green-100 text-green-700",
  reject_property: "bg-red-100 text-red-700",
  under_review_property: "bg-yellow-100 text-yellow-700",
  changes_requested_property: "bg-orange-100 text-orange-700",
  change_role: "bg-blue-100 text-blue-700",
  delete_user: "bg-red-100 text-red-700",
  update_settings: "bg-purple-100 text-purple-700",
  send_notification: "bg-indigo-100 text-indigo-700",
};

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const perPage = 25;
  const offset = (page - 1) * perPage;

  const supabase = await createClient();

  const { data: logs, count } = await supabase
    .from("admin_audit_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + perPage - 1);

  const totalPages = Math.ceil((count ?? 0) / perPage);

  return (
    <div className="p-8 max-w-[1400px] w-full mx-auto">
      <div className="mb-6">
        <p className="text-[13px] text-[#9ca3af] mb-1">Super Admin / Audit Log</p>
        <h1 className="text-[30px] font-bold text-[#111827]">Admin Audit Log</h1>
        <p className="text-[14px] text-[#6b7280] mt-1">
          Every admin action is recorded here for full accountability. Showing {count ?? 0} entries.
        </p>
      </div>

      {!logs || logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e9ee] p-12 text-center">
          <p className="text-[32px] mb-3">📋</p>
          <p className="font-semibold text-[#374151] text-[15px]">No admin actions recorded yet</p>
          <p className="text-[13px] text-[#9ca3af] mt-1">
            Actions like approvals, role changes, and setting updates will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-[#e5e9ee] shadow-sm overflow-hidden mb-4">
            <table className="w-full text-[13px]">
              <thead className="bg-[#f9fafb] border-b border-[#f3f4f6]">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-[#6b7280]">Action</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#6b7280] hidden md:table-cell">Admin</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#6b7280] hidden lg:table-cell">Target</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#6b7280] hidden lg:table-cell">Details</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#6b7280]">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f9fafb]">
                {(logs as AuditLog[]).map((log) => (
                  <tr key={log.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${actionStyle[log.action] || "bg-gray-100 text-gray-600"}`}>
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#6b7280] hidden md:table-cell truncate max-w-[180px]">
                      {log.admin_email || "—"}
                    </td>
                    <td className="px-5 py-3 text-[#6b7280] hidden lg:table-cell">
                      {log.target_type && <span className="text-[10px] bg-[#f3f4f6] text-[#374151] px-1.5 py-0.5 rounded font-semibold mr-1">{log.target_type}</span>}
                      <span className="font-mono text-[10px]">{log.target_id ? log.target_id.slice(0, 12) + "…" : "—"}</span>
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell text-[#9ca3af] max-w-[220px]">
                      {log.details ? (
                        <span className="truncate block">
                          {Object.entries(log.details)
                            .slice(0, 2)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" · ")}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3 text-[#9ca3af] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2 justify-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/super-admin/audit-log?page=${p}`}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-[13px] font-semibold transition-colors ${
                    p === page
                      ? "bg-[#111827] text-white"
                      : "bg-white border border-[#e5e9ee] text-[#6b7280] hover:border-[#111827]"
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
