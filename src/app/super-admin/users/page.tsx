"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

type User = {
  id: string;
  full_name: string;
  phone: string;
  role: string;
  created_at: string;
  email?: string;
};

const ROLES = ["user", "agent", "builder", "lister", "admin", "super_admin"];

const roleStyle: Record<string, string> = {
  user: "bg-gray-100 text-gray-600",
  agent: "bg-indigo-100 text-indigo-700",
  builder: "bg-teal-100 text-teal-700",
  lister: "bg-cyan-100 text-cyan-700",
  admin: "bg-orange-100 text-orange-700",
  super_admin: "bg-red-100 text-red-700",
};

export default function UsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (roleFilter !== "all") q = q.eq("role", roleFilter);
    const { data } = await q;
    setUsers(data ?? []);
    setLoading(false);
  }, [roleFilter, supabase]);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter((u) =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.id.includes(search)
  );

  const changeRole = async () => {
    if (!selectedUser || !newRole) return;
    setWorking(selectedUser.id);
    const res = await fetch("/api/admin/update-user-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUser.id, newRole }),
    });
    const json = await res.json();
    setWorking(null);
    setSelectedUser(null);
    if (json.error) { showToast("Error: " + json.error); return; }
    showToast(`Role updated to ${newRole}.`);
    load();
  };

  const deleteUser = async () => {
    if (!confirmDelete) return;
    setWorking(confirmDelete.id);
    const res = await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: confirmDelete.id }),
    });
    const json = await res.json();
    setWorking(null);
    setConfirmDelete(null);
    if (json.error) { showToast("Error: " + json.error); return; }
    showToast("User deleted.");
    load();
  };

  return (
    <div className="p-8 max-w-[1400px] w-full mx-auto">
      <div className="mb-6">
        <p className="text-[13px] text-[#9ca3af] mb-1">Super Admin / User Management</p>
        <h1 className="text-[30px] font-bold text-[#111827]">User Management</h1>
        <p className="text-[14px] text-[#6b7280] mt-1">Search, filter, update roles, and manage all platform users.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or user ID…"
          className="border border-[#e5e9ee] bg-white rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#d49a38] focus:ring-2 focus:ring-[#d49a38]/20 w-72"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-[#e5e9ee] bg-white rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#d49a38] cursor-pointer"
        >
          <option value="all">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button onClick={load} className="bg-[#111827] text-white font-semibold text-[13px] px-4 py-2.5 rounded-xl hover:bg-[#1f2937] transition-colors">
          Refresh
        </button>
        <span className="ml-auto text-[13px] text-[#9ca3af] flex items-center">
          {filtered.length} user{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading && (
        <div className="bg-white rounded-2xl border border-[#e5e9ee] p-12 text-center text-[#9ca3af]">Loading users…</div>
      )}

      {!loading && (
        <div className="bg-white rounded-2xl border border-[#e5e9ee] shadow-sm overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-[#f9fafb] border-b border-[#f3f4f6]">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-[#6b7280]">User</th>
                <th className="text-left px-5 py-3 font-semibold text-[#6b7280] hidden md:table-cell">Phone</th>
                <th className="text-left px-5 py-3 font-semibold text-[#6b7280]">Role</th>
                <th className="text-left px-5 py-3 font-semibold text-[#6b7280] hidden lg:table-cell">Joined</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f9fafb]">
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-[#9ca3af]">No users found.</td></tr>
              )}
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-[#fafafa] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#f3f4f6] flex items-center justify-center text-[13px] font-bold text-[#374151] shrink-0">
                        {(u.full_name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-[#111827]">{u.full_name || "—"}</p>
                        <p className="text-[10px] text-[#9ca3af] font-mono">{u.id.slice(0, 12)}…</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#6b7280] hidden md:table-cell">{u.phone || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${roleStyle[u.role] || "bg-gray-100 text-gray-600"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#9ca3af] hidden lg:table-cell">
                    {new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => { setSelectedUser(u); setNewRole(u.role); }}
                        className="bg-[#111827] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#1f2937] transition-colors"
                      >
                        Change Role
                      </button>
                      <button
                        onClick={() => setConfirmDelete(u)}
                        disabled={working === u.id}
                        className="bg-red-50 text-red-600 border border-red-200 text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Change Role Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[400px] shadow-2xl p-6">
            <h2 className="font-bold text-[17px] text-[#111827] mb-1">Change Role</h2>
            <p className="text-[13px] text-[#6b7280] mb-4">
              User: <strong>{selectedUser.full_name || selectedUser.id}</strong>
            </p>
            <label className="text-[12px] font-bold text-[#374151] block mb-1">New Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full border border-[#e5e9ee] rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#d49a38] mb-4 cursor-pointer"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <div className="flex gap-3">
              <button
                onClick={changeRole}
                disabled={!!working}
                className="flex-1 bg-[#111827] text-white font-bold text-[13px] py-2.5 rounded-xl hover:bg-[#1f2937] disabled:opacity-50 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 bg-[#f3f4f6] text-[#374151] font-bold text-[13px] py-2.5 rounded-xl hover:bg-[#e5e7eb] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[380px] shadow-2xl p-6">
            <h2 className="font-bold text-[17px] text-red-600 mb-2">⚠️ Delete User?</h2>
            <p className="text-[13px] text-[#6b7280] mb-5">
              This will permanently delete <strong>{confirmDelete.full_name || confirmDelete.id}</strong> and all their data. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={deleteUser}
                disabled={!!working}
                className="flex-1 bg-red-600 text-white font-bold text-[13px] py-2.5 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Delete Forever
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-[#f3f4f6] text-[#374151] font-bold text-[13px] py-2.5 rounded-xl hover:bg-[#e5e7eb] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#111827] text-white px-5 py-3 rounded-xl text-[13px] font-medium shadow-xl z-[60]">
          {toast}
        </div>
      )}
    </div>
  );
}
