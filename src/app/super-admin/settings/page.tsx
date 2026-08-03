"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Setting = {
  key: string;
  value: string;
  description: string;
  updated_at: string;
  updated_by: string;
};

export default function SettingsPage() {
  const supabase = createClient();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [working, setWorking] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("platform_settings").select("*").order("key");
    setSettings(data ?? []);
    const map: Record<string, string> = {};
    (data ?? []).forEach((s: Setting) => { map[s.key] = s.value; });
    setEditing(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const save = async (key: string) => {
    setWorking(key);
    const res = await fetch("/api/admin/update-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: editing[key] }),
    });
    const json = await res.json();
    setWorking(null);
    if (json.error) { showToast("Error: " + json.error); return; }
    showToast(`"${key}" saved.`);
    load();
  };

  const isBoolean = (v: string) => v === "true" || v === "false";

  return (
    <div className="p-8 max-w-[900px] w-full mx-auto">
      <div className="mb-6">
        <p className="text-[13px] text-[#9ca3af] mb-1">Super Admin / Platform Settings</p>
        <h1 className="text-[30px] font-bold text-[#111827]">Platform Settings</h1>
        <p className="text-[14px] text-[#6b7280] mt-1">
          Manage global configuration. Changes take effect immediately.
        </p>
      </div>

      {loading && (
        <div className="bg-white rounded-2xl border border-[#e5e9ee] p-12 text-center text-[#9ca3af]">
          Loading settings…
        </div>
      )}

      {!loading && (
        <div className="space-y-4">
          {settings.map((s) => (
            <div key={s.key} className="bg-white rounded-2xl border border-[#e5e9ee] shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-[12px] font-bold text-[#111827] bg-[#f3f4f6] px-2 py-0.5 rounded-lg">
                      {s.key}
                    </code>
                    {s.updated_by && (
                      <span className="text-[10px] text-[#9ca3af]">
                        last by {s.updated_by}
                      </span>
                    )}
                  </div>
                  {s.description && (
                    <p className="text-[12px] text-[#6b7280] mb-3">{s.description}</p>
                  )}

                  {isBoolean(s.value) ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEditing((p) => ({ ...p, [s.key]: p[s.key] === "true" ? "false" : "true" }))}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          editing[s.key] === "true" ? "bg-[#10b981]" : "bg-[#d1d5db]"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            editing[s.key] === "true" ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span className="text-[13px] font-semibold text-[#374151]">
                        {editing[s.key] === "true" ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={editing[s.key] ?? ""}
                      onChange={(e) => setEditing((p) => ({ ...p, [s.key]: e.target.value }))}
                      className="border border-[#e5e9ee] rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#d49a38] focus:ring-2 focus:ring-[#d49a38]/20 w-full"
                    />
                  )}
                </div>

                <button
                  onClick={() => save(s.key)}
                  disabled={working === s.key || editing[s.key] === s.value}
                  className="bg-[#111827] text-white font-bold text-[12px] px-4 py-2 rounded-xl hover:bg-[#1f2937] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  {working === s.key ? "Saving…" : "Save"}
                </button>
              </div>

              <p className="text-[10px] text-[#d1d5db] mt-3">
                Last updated: {new Date(s.updated_at).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#111827] text-white px-5 py-3 rounded-xl text-[13px] font-medium shadow-xl z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
