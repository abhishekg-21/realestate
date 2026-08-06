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
  price_period: string;
  locality: string;
  address: string;
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

  const [editingImages, setEditingImages] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);

  const openDetail = async (sub: Submission) => {
    setSelected(sub);
    setNote("");
    setEditingImages(false);
    const { data } = await supabase
      .from("property_submission_media")
      .select("*")
      .eq("submission_id", sub.id)
      .order("sort_order");
    
    const mediaList = data ?? [];
    setMedia(mediaList);
    setImageUrls(mediaList.map((m) => m.storage_path));
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImageUrls([...imageUrls, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  const handleRemoveImageUrl = (idx: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== idx));
  };

  const handleAdminFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !selected) return;
    setUploadingImg(true);
    const files = Array.from(e.target.files);

    try {
      for (const file of files) {
        const path = `properties/${selected.id}/${Date.now()}_${file.name}`;
        const { error } = await supabase.storage
          .from("user-verification-docs")
          .upload(path, file);

        if (!error) {
          const { data: publicUrlData } = supabase.storage
            .from("user-verification-docs")
            .getPublicUrl(path);
          
          if (publicUrlData?.publicUrl) {
            setImageUrls((prev) => [...prev, publicUrlData.publicUrl]);
          }
        }
      }
      showToast("Files uploaded successfully.");
    } catch (err: any) {
      showToast("Upload failed: " + err.message);
    } finally {
      setUploadingImg(false);
    }
  };

  const saveUpdatedImages = async () => {
    if (!selected) return;
    setWorking(true);
    try {
      const res = await fetch("/api/admin/update-property-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: selected.id, images: imageUrls }),
      });
      const json = await res.json();
      if (json.error) {
        showToast("Error updating images: " + json.error);
      } else {
        showToast("Property images updated successfully!");
        setEditingImages(false);
        openDetail(selected);
      }
    } catch (err: any) {
      showToast("Failed to save images: " + err.message);
    } finally {
      setWorking(false);
    }
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
    <div className="p-8 max-w-[1400px] w-full mx-auto text-slate-900">
      {/* Toast alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 animate-bounce">
          {toast}
        </div>
      )}

      <div className="mb-6">
        <p className="text-[13px] text-slate-500 font-bold mb-1">Super Admin / Property Management</p>
        <h1 className="text-[32px] font-bold text-slate-900 tracking-tight">Property Control & Image Editor</h1>
        <p className="text-[14px] text-slate-600 mt-1">
          View all properties, edit property photos & walkthrough videos, approve listings, or request changes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2.5 rounded-xl text-[13px] font-bold border transition-all ${
              tab === t.value
                ? "bg-[#0f172a] text-amber-400 border-[#0f172a] shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-[14px] animate-pulse">
          Loading properties…
        </div>
      )}

      {!loading && submissions.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-[36px] mb-3">🏡</p>
          <p className="font-bold text-slate-900 text-[16px]">No listings found</p>
          <p className="text-[13px] text-slate-500 mt-1">No property submissions match this tab filter.</p>
        </div>
      )}

      {!loading && submissions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-slate-100/80 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3.5 font-bold text-slate-700">Property</th>
                <th className="text-left px-5 py-3.5 font-bold text-slate-700 hidden md:table-cell">Location</th>
                <th className="text-left px-5 py-3.5 font-bold text-slate-700 hidden lg:table-cell">Intent</th>
                <th className="text-left px-5 py-3.5 font-bold text-slate-700 hidden lg:table-cell">Submitted</th>
                <th className="text-left px-5 py-3.5 font-bold text-slate-700">Status</th>
                <th className="px-5 py-3.5 text-right font-bold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-900 max-w-[220px] truncate">
                    {s.title}
                  </td>
                  <td className="px-5 py-4 text-slate-600 hidden md:table-cell">
                    {s.city}, {s.state}
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell text-slate-700 capitalize font-medium">{s.intent}</td>
                  <td className="px-5 py-4 hidden lg:table-cell text-slate-500">
                    {new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${statusStyle[s.status]}`}>
                      {s.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right space-x-2">
                    <button
                      onClick={() => openDetail(s)}
                      className="bg-navy !text-white text-[12px] font-bold px-3.5 py-1.5 rounded-xl hover:bg-navy2 transition-colors shadow-sm"
                    >
                      Manage & Edit Images 📷
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Property Detail & Image Management Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-[720px] shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 bg-slate-900 text-white">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Super Admin Management
                </span>
                <h2 className="font-serif text-[22px] font-medium mt-1 text-white">{selected.title}</h2>
                <p className="text-[12px] text-slate-300 mt-0.5">{selected.city}, {selected.state} · Owner ID: {selected.owner_id} · Submitted: {new Date(selected.created_at).toLocaleString("en-IN")}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-white text-2xl font-bold ml-4"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
              {/* IMAGE EDITOR SECTION */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-[15px] text-slate-900 flex items-center gap-2">
                    📷 Property Photos & Gallery ({imageUrls.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingImages(!editingImages)}
                    className="text-[12px] font-bold text-blue-600 hover:underline"
                  >
                    {editingImages ? "Close Image Editor" : "✏️ Edit Images"}
                  </button>
                </div>

                {/* Display Current Images */}
                <div className="grid grid-cols-4 max-sm:grid-cols-2 gap-3 mb-4">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-200 group">
                      <img src={url} alt={`Property image ${idx + 1}`} className="w-full h-full object-cover" />
                      {editingImages && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImageUrl(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs shadow hover:scale-110"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Image Edit Controls */}
                {editingImages && (
                  <div className="space-y-3 pt-3 border-t border-slate-200">
                    <p className="text-[12px] font-bold text-slate-800 m-0">Add New Images as Super Admin:</p>
                    
                    {/* Add Image URL */}
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="Paste image or video URL (https://...)"
                        className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-[12px] bg-white outline-none focus:border-[#d49a38]"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-[12px] hover:bg-slate-800"
                      >
                        Add URL
                      </button>
                    </div>

                    {/* Direct Upload File */}
                    <label className="block border-2 border-dashed border-slate-300 p-4 text-center bg-white rounded-xl cursor-pointer hover:bg-slate-100">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleAdminFileUpload}
                        className="hidden"
                      />
                      <span className="text-[12px] font-bold text-slate-800">
                        {uploadingImg ? "Uploading files..." : "📁 Upload New Photos from Computer"}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={saveUpdatedImages}
                      disabled={working}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-[13px] transition-colors shadow-sm disabled:opacity-60"
                    >
                      {working ? "Saving..." : "Save Image Changes to Database"}
                    </button>
                  </div>
                )}
              </div>

              {/* Property Details Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                {[
                  ["Intent", intentBadge(selected.intent)],
                  ["Type", selected.property_type],
                  ["Price", selected.price ? `₹${Number(selected.price).toLocaleString("en-IN")}` : "—"],
                  ["Price Period", selected.price_period || "—"],
                  ["Bedrooms", selected.bedrooms ?? "—"],
                  ["Bathrooms", selected.bathrooms ?? "—"],
                  ["Area", selected.area_sqft ? `${selected.area_sqft} sqft` : "—"],
                  ["Locality", selected.locality || "—"],
                  ["Address", selected.address || "—"],
                  ["Contact Person", selected.contact_name],
                  ["Contact Phone", selected.contact_phone],
                ].map(([k, v]) => (
                  <div key={String(k)} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                    <p className="text-[11px] text-slate-500 font-medium">{k}</p>
                    <p className="text-slate-900 font-bold mt-0.5 truncate">{String(v)}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {selected.description && (
                <div>
                  <p className="text-[12px] font-bold text-slate-900 mb-1">Description</p>
                  <p className="text-[13px] text-slate-600 leading-relaxed bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                    {selected.description}
                  </p>
                </div>
              )}

              {/* Decision Note & Actions */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <label className="block">
                  <span className="block text-[12px] font-bold text-slate-900 mb-1">
                    Admin Review Note (optional)
                  </span>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Approved with updated high-res photos"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-[12px] bg-white outline-none focus:border-[#d49a38]"
                  />
                </label>

                <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-2">
                  <button
                    onClick={() => takeAction("approved")}
                    disabled={working}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[13px] py-3 rounded-xl transition-colors shadow-sm disabled:opacity-60"
                  >
                    ✓ Approve Listing
                  </button>
                  <button
                    onClick={() => takeAction("rejected")}
                    disabled={working}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-[13px] py-3 rounded-xl transition-colors shadow-sm disabled:opacity-60"
                  >
                    ✕ Reject Listing
                  </button>
                  <button
                    onClick={() => takeAction("changes_requested")}
                    disabled={working}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[13px] py-3 rounded-xl transition-colors shadow-sm disabled:opacity-60 col-span-full"
                  >
                    ⚠️ Request Changes from Owner
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
