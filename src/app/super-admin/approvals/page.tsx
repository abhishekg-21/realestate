"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

type Submission = {
  id: string;
  title: string;
  city: string;
  state: string;
  intent: string;
  property_type: string;
  price: number;
  status: string;
  contact_name: string;
  contact_phone: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  created_at: string;
  owner_id: string;
};

type Media = { id: string; file_name: string; storage_path: string };

const TABS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "submitted" },
  { label: "Under Review", value: "under_review" },
  { label: "Changes Requested", value: "changes_requested" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const statusStyle: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  submitted: "bg-blue-100 text-blue-700",
  under_review: "bg-yellow-100 text-yellow-700",
  changes_requested: "bg-orange-100 text-orange-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function ApprovalsPage() {
  const supabase = createClient();
  const [tab, setTab] = useState("submitted");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [note, setNote] = useState("");
  const [working, setWorking] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("property_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (tab !== "all") q = q.eq("status", tab);
    const { data } = await q;
    setSubmissions(data ?? []);
    setLoading(false);
  }, [tab, supabase]);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (sub: Submission) => {
    setSelected(sub);
    setNote("");
    const { data } = await supabase
      .from("property_submission_media")
      .select("*")
      .eq("submission_id", sub.id)
      .order("sort_order");
    setMedia(data ?? []);
  };

  const takeAction = async (action: "approved" | "rejected" | "under_review" | "changes_requested") => {
    if (!selected) return;
    setWorking(true);
    const res = await fetch("/api/admin/approve-property", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId: selected.id, action, note }),
    });
    const json = await res.json();
    if (json.error) {
      showToast("Error: " + json.error);
    } else {
      showToast(`Property ${action.replace("_", " ")} successfully.`);
      setSelected(null);
      load();
    }
    setWorking(false);
  };

  const intentBadge = (v: string) =>
    v === "sale" ? "🏷️ For Sale" : v === "rent" ? "🔑 For Rent" : "🏢 Commercial";

  return (
    <div className="p-8 max-w-[1400px] w-full mx-auto">
      <div className="mb-6">
        <p className="text-[13px] text-[#9ca3af] mb-1">Super Admin / Property Approvals</p>
        <h1 className="text-[30px] font-bold text-[#111827]">Property Approvals</h1>
        <p className="text-[14px] text-[#6b7280] mt-1">Review, approve, reject or request changes on submitted listings.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold border transition-all ${
              tab === t.value
                ? "bg-[#111827] text-white border-[#111827]"
                : "bg-white text-[#6b7280] border-[#e5e9ee] hover:border-[#111827]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="bg-white rounded-2xl border border-[#e5e9ee] p-12 text-center text-[#9ca3af] text-[14px]">
          Loading submissions…
        </div>
      )}

      {!loading && submissions.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#e5e9ee] p-12 text-center">
          <p className="text-[32px] mb-3">🎉</p>
          <p className="font-semibold text-[#374151] text-[15px]">Nothing here</p>
          <p className="text-[13px] text-[#9ca3af] mt-1">No submissions match this filter.</p>
        </div>
      )}

      {!loading && submissions.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#e5e9ee] shadow-sm overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-[#f9fafb] border-b border-[#f3f4f6]">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-[#6b7280]">Property</th>
                <th className="text-left px-5 py-3 font-semibold text-[#6b7280] hidden md:table-cell">Location</th>
                <th className="text-left px-5 py-3 font-semibold text-[#6b7280] hidden lg:table-cell">Intent</th>
                <th className="text-left px-5 py-3 font-semibold text-[#6b7280] hidden lg:table-cell">Submitted</th>
                <th className="text-left px-5 py-3 font-semibold text-[#6b7280]">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f9fafb]">
              {submissions.map((s) => (
                <tr key={s.id} className="hover:bg-[#fafafa] transition-colors">
                  <td className="px-5 py-4 font-semibold text-[#111827] max-w-[200px] truncate">
                    {s.title}
                  </td>
                  <td className="px-5 py-4 text-[#6b7280] hidden md:table-cell">
                    {s.city}, {s.state}
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell text-[#6b7280] capitalize">{s.intent}</td>
                  <td className="px-5 py-4 hidden lg:table-cell text-[#9ca3af]">
                    {new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${statusStyle[s.status]}`}>
                      {s.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => openDetail(s)}
                      className="bg-[#111827] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#1f2937] transition-colors"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-end p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-[560px] shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-[#f3f4f6]">
              <div>
                <h2 className="font-bold text-[17px] text-[#111827]">{selected.title}</h2>
                <p className="text-[12px] text-[#9ca3af] mt-0.5">{selected.city}, {selected.state}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-[#9ca3af] hover:text-[#374151] text-xl ml-4 shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                {[
                  ["Intent", intentBadge(selected.intent)],
                  ["Type", selected.property_type],
                  ["Price", selected.price ? `₹${Number(selected.price).toLocaleString("en-IN")}` : "—"],
                  ["Bedrooms", selected.bedrooms ?? "—"],
                  ["Bathrooms", selected.bathrooms ?? "—"],
                  ["Area", selected.area_sqft ? `${selected.area_sqft} sqft` : "—"],
                  ["Contact", selected.contact_name],
                  ["Phone", selected.contact_phone],
                ].map(([k, v]) => (
                  <div key={String(k)} className="bg-[#f9fafb] rounded-xl p-3">
                    <p className="text-[11px] text-[#9ca3af] font-medium">{k}</p>
                    <p className="text-[#111827] font-semibold mt-0.5 truncate">{String(v)}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {selected.description && (
                <div>
                  <p className="text-[12px] font-bold text-[#374151] mb-1">Description</p>
                  <p className="text-[13px] text-[#6b7280] leading-relaxed bg-[#f9fafb] rounded-xl p-3">
                    {selected.description}
                  </p>
                </div>
              )}

              {/* Media */}
              {media.length > 0 && (
                <div>
                  <p className="text-[12px] font-bold text-[#374151] mb-2">Media ({media.length} files)</p>
                  <div className="flex flex-wrap gap-2">
                    {media.map((m) => (
                      <span
                        key={m.id}
                        className="bg-[#f3f4f6] text-[#374151] text-[11px] font-medium px-2 py-1 rounded-lg truncate max-w-[150px]"
                        title={m.file_name}
                      >
                        📎 {m.file_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin note */}
              <div>
                <label className="text-[12px] font-bold text-[#374151] block mb-1">
                  Admin note (optional — shown to owner)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note for the submitter…"
                  className="w-full border border-[#e5e9ee] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#d49a38] focus:ring-2 focus:ring-[#d49a38]/20 resize-none"
                  rows={3}
                />
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => takeAction("approved")}
                  disabled={working}
                  className="bg-green-600 text-white font-bold text-[13px] px-4 py-2.5 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => takeAction("under_review")}
                  disabled={working}
                  className="bg-yellow-500 text-white font-bold text-[13px] px-4 py-2.5 rounded-xl hover:bg-yellow-600 disabled:opacity-50 transition-colors"
                >
                  🔍 Mark Under Review
                </button>
                <button
                  onClick={() => takeAction("changes_requested")}
                  disabled={working}
                  className="bg-orange-500 text-white font-bold text-[13px] px-4 py-2.5 rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  📝 Request Changes
                </button>
                <button
                  onClick={() => takeAction("rejected")}
                  disabled={working}
                  className="bg-red-600 text-white font-bold text-[13px] px-4 py-2.5 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#111827] text-white px-5 py-3 rounded-xl text-[13px] font-medium shadow-xl z-[60] animate-bounce">
          {toast}
        </div>
      )}
    </div>
  );
}
