"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PROPERTIES } from "@/lib/properties-data";
import {
  getSavedPropertyIds,
  getSavedPropertyIdsDB,
  toggleSavedPropertyIdDB,
  SAVED_CHANGE_EVENT,
} from "@/lib/auth-cache";

export default function SavedPropertiesPage() {
  const [savedIds, setSavedIds] = useState<string[]>(() => getSavedPropertyIds());
  const [toastMsg, setToastMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from Supabase on mount (syncs to localStorage automatically)
    getSavedPropertyIdsDB().then((ids) => {
      console.log("[SavedPage] IDs from DB:", ids);
      console.log("[SavedPage] All property IDs:", PROPERTIES.map((p) => p.id));
      setSavedIds(ids);
      setLoading(false);
    });

    const handleChange = () => setSavedIds(getSavedPropertyIds());
    window.addEventListener(SAVED_CHANGE_EVENT, handleChange);
    return () => window.removeEventListener(SAVED_CHANGE_EVENT, handleChange);
  }, []);

  const savedProperties = PROPERTIES.filter((p) => savedIds.includes(p.id));

  const showToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(""), 2500);
  };

  const removeSaved = async (id: string) => {
    await toggleSavedPropertyIdDB(id);
    showToast("Removed from saved spaces.");
  };

  return (
    <div className="flex flex-col min-h-screen bg-paper font-sans">
      {/* Header */}
      <header className="h-[74px] max-md:h-[63px] bg-white border-b border-line flex items-center px-[clamp(20px,4vw,52px)] max-md:px-[16px] gap-[20px]">
        <span className="text-[12px] text-[#74828d] max-sm:hidden">
          My account / Saved spaces
        </span>
        <nav className="flex gap-[22px] ml-[24px] text-[12px] font-bold text-[#546471] max-md:hidden">
          <Link href="/properties">Properties</Link>
          <Link href="/#areas">Locations</Link>
        </nav>
        <div className="ml-auto flex items-center gap-[11px]">
          <Link
            href="/user-dashboard"
            className="border border-line bg-white rounded-[7px] px-[12px] h-[34px] text-[11px] font-bold text-[#50606d] flex items-center hover:bg-gray-50 transition-colors"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* Main */}
      <div className="max-w-[1280px] w-full p-[37px_clamp(20px,4vw,52px)_70px] max-md:p-[25px_16px_55px] mx-auto flex-1">
        <div className="flex items-end justify-between my-[30px] mb-[15px]">
          <div>
            <h1 className="font-serif text-[34px] max-sm:text-[28px] font-medium tracking-[-1.6px] m-0 text-ink">
              Saved spaces
            </h1>
            <p className="text-[12px] text-muted mt-[7px] mb-0">
              Keep the homes you want to revisit close at hand.
            </p>
          </div>
          <Link
            href="/properties"
            className="border-0 rounded-[7px] bg-navy !text-white p-[11px_14px] text-[12px] font-bold hover:bg-navy2 transition-colors"
          >
            Browse properties
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-[12px] text-muted py-[38px]">
            Loading your saved spaces…
          </div>
        ) : (
          <div className="grid gap-[10px]">
            {savedProperties.length > 0 ? (
              savedProperties.map((p) => (
                <article
                  key={p.id}
                  className="grid grid-cols-[95px_1fr_auto] max-sm:grid-cols-[72px_1fr] gap-[13px] items-center border border-[#e3e8e9] p-[10px] rounded bg-white relative"
                >
                  <Link
                    href={`/properties/${p.id}`}
                    className="h-[66px] w-[95px] max-sm:h-[57px] max-sm:w-[72px] bg-cover bg-center rounded block shrink-0"
                    style={{ backgroundImage: `url('${p.image}')` }}
                  />
                  <div className="min-w-0 max-sm:col-start-2">
                    <Link
                      href={`/properties/${p.id}`}
                      className="hover:text-gold transition-colors block"
                    >
                      <h3 className="text-[13px] font-bold m-0 mb-[4px] text-ink truncate">
                        {p.title}
                      </h3>
                    </Link>
                    <p className="m-0 text-[10px] text-muted truncate">
                      {p.area}, {p.city} · {p.beds || "—"} Bed · {p.areaSq}
                    </p>
                    <b className="text-[12px] font-bold block my-[7px] text-ink">
                      {p.displayPrice}
                    </b>
                  </div>
                  <button
                    onClick={() => removeSaved(p.id)}
                    title="Remove"
                    className="border-0 bg-white text-[#9aa5ab] text-[20px] font-bold cursor-pointer hover:text-red transition-colors max-sm:absolute max-sm:right-[9px] max-sm:top-[9px]"
                  >
                    ×
                  </button>
                </article>
              ))
            ) : (
              <div className="border border-dashed border-[#bdc8cc] p-[38px] text-center text-[12px] text-muted rounded bg-white">
                No saved spaces yet.
                <br />
                <br />
                <Link
                  href="/properties"
                  className="inline-block bg-navy !text-white font-bold px-4 py-2 rounded"
                >
                  Explore properties
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-[20px] right-[20px] bg-[#143b60] text-white p-[12px_15px] rounded-[7px] text-[12px] shadow-[0_8px_22px_rgba(0,0,0,0.2)] z-50 animate-bounce">
          {toastMsg}
        </div>
      )}
    </div>
  );
}