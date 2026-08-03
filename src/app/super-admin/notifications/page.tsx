"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const ROLES_TARGET = ["all", "user", "agent", "builder", "lister", "admin"];

type Notification = {
  id: string;
  title: string;
  body: string;
  target_role: string;
  sent_by: string;
  created_at: string;
};

export default function NotificationsPage() {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [working, setWorking] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false });
    setNotifications(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setWorking(true);
    const res = await fetch("/api/admin/send-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, targetRole }),
    });
    const json = await res.json();
    setWorking(false);
    if (json.error) { showToast("Error: " + json.error); return; }
    showToast("Notification sent!");
    setTitle("");
    setBody("");
    setTargetRole("all");
    load();
  };

  return (
    <div className="p-8 max-w-[900px] w-full mx-auto">
      <div className="mb-6">
        <p className="text-[13px] text-[#9ca3af] mb-1">Super Admin / Notifications</p>
        <h1 className="text-[30px] font-bold text-[#111827]">Broadcast Notifications</h1>
        <p className="text-[14px] text-[#6b7280] mt-1">
          Send platform-wide announcements to all users or specific roles.
        </p>
      </div>

      {/* Compose */}
      <form onSubmit={send} className="bg-white rounded-2xl border border-[#e5e9ee] shadow-sm p-6 mb-6">
        <h2 className="font-bold text-[16px] text-[#111827] mb-4">📣 Compose Message</h2>
        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-bold text-[#374151] block mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Platform Maintenance on Sunday"
              required
              className="w-full border border-[#e5e9ee] rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#d49a38] focus:ring-2 focus:ring-[#d49a38]/20"
            />
          </div>
          <div>
            <label className="text-[12px] font-bold text-[#374151] block mb-1">Message *</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message to users…"
              required
              rows={4}
              className="w-full border border-[#e5e9ee] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#d49a38] focus:ring-2 focus:ring-[#d49a38]/20 resize-none"
            />
          </div>
          <div>
            <label className="text-[12px] font-bold text-[#374151] block mb-1">Target Audience</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="border border-[#e5e9ee] bg-white rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#d49a38] cursor-pointer"
            >
              {ROLES_TARGET.map((r) => (
                <option key={r} value={r}>
                  {r === "all" ? "🌐 All Users" : `👤 ${r.charAt(0).toUpperCase() + r.slice(1)}s only`}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-5">
          <button
            type="submit"
            disabled={working || !title.trim() || !body.trim()}
            className="bg-[#111827] text-white font-bold text-[13px] px-6 py-3 rounded-xl hover:bg-[#1f2937] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {working ? "Sending…" : "📨 Send Notification"}
          </button>
          <span className="text-[12px] text-[#9ca3af]">
            Will be visible to: <strong className="text-[#374151]">{targetRole === "all" ? "All users" : `${targetRole}s`}</strong>
          </span>
        </div>
      </form>

      {/* History */}
      <div className="bg-white rounded-2xl border border-[#e5e9ee] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f3f4f6] flex items-center justify-between">
          <h2 className="font-bold text-[15px] text-[#111827]">Notification History</h2>
          <button onClick={load} className="text-[12px] text-[#d49a38] font-bold hover:underline">Refresh</button>
        </div>

        {loading ? (
          <p className="px-6 py-8 text-center text-[13px] text-[#9ca3af]">Loading…</p>
        ) : notifications.length === 0 ? (
          <p className="px-6 py-8 text-center text-[13px] text-[#9ca3af]">
            No notifications sent yet. Compose one above.
          </p>
        ) : (
          <div className="divide-y divide-[#f9fafb]">
            {notifications.map((n) => (
              <div key={n.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-[14px] text-[#111827] truncate">{n.title}</p>
                    <p className="text-[12px] text-[#6b7280] mt-1 leading-relaxed">{n.body}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-full capitalize">
                      {n.target_role === "all" ? "🌐 All" : n.target_role}
                    </span>
                    <p className="text-[10px] text-[#9ca3af] mt-1">
                      {new Date(n.created_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                {n.sent_by && (
                  <p className="text-[10px] text-[#d1d5db] mt-1">by {n.sent_by}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#111827] text-white px-5 py-3 rounded-xl text-[13px] font-medium shadow-xl z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
