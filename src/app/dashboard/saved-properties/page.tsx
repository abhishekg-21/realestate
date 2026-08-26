//  src/app/dashboard/saved-properties/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  toggleSavedPropertyIdDB,
  SAVED_CHANGE_EVENT,
  getSavedPropertyIdsDB,
} from "@/lib/auth-cache";

interface SavedProperty {
  saved_row_id: string;
  id: string;
  title: string;
  city: string;
  state: string;
  locality: string | null;
  price: number | null;
  price_period: string | null;  // ✅ exists in DB
  bedrooms: number | null;      // ✅ correct column name
  bathrooms: number | null;     // ✅ correct column name
  area_sqft: number | null;     // ✅ correct column name
  property_type: string;        // ✅ correct column name
  intent: string;               // ✅ correct column name
  image_url: string | null;
}

export default function SavedPropertiesPage() {
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    getSavedPropertyIdsDB();
  }, []);

  const showToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(""), 2500);
  };

  const loadSaved = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("saved_properties")
      .select(`
        id,
        property_id,
        property_submissions!saved_properties_property_id_fkey (
          id,
          title,
          city,
          state,
          locality,
          price,
          price_period,
          bedrooms,
          bathrooms,
          area_sqft,
          property_type,
          intent,
          status
        )
      `)
      .eq("user_id", user.id);

    if (error) {
      console.error("[SavedPage] fetch error:", error.message);
      setLoading(false);
      return;
    }

    const props: SavedProperty[] = (data ?? [])
      .filter((row: any) => row.property_submissions?.status === "approved")
      .map((row: any) => {
        const p = row.property_submissions;
        return {
          saved_row_id: row.id,
          id: p.id,
          title: p.title,
          city: p.city,
          state: p.state,
          locality: p.locality,
          price: p.price,
          price_period: p.price_period,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          area_sqft: p.area_sqft,
          property_type: p.property_type,
          intent: p.intent,
          image_url: null,
        };
      });

    // Fetch first image using storage_path → getPublicUrl
    if (props.length > 0) {
      const propertyIds = props.map((p) => p.id);
      const { data: mediaRows } = await supabase
        .from("property_submission_media")
        .select("submission_id, storage_path")  // ✅ correct column
        .in("submission_id", propertyIds)
        .order("sort_order", { ascending: true }); // ✅ correct column

      const mediaMap: Record<string, string> = {};
      for (const m of mediaRows ?? []) {
        if (!mediaMap[m.submission_id]) {
          const { data: urlData } = supabase.storage
            .from("property-media")             // ✅ correct bucket
            .getPublicUrl(m.storage_path);
          mediaMap[m.submission_id] = urlData.publicUrl;
        }
      }

      props.forEach((p) => {
        p.image_url = mediaMap[p.id] ?? null;
        console.log("[SavedPage] image_url for", p.id, "→", p.image_url);
      });
    }

    setSavedProperties(props);
    setLoading(false);
  };

  useEffect(() => {
    loadSaved();
    window.addEventListener(SAVED_CHANGE_EVENT, loadSaved);
    return () => window.removeEventListener(SAVED_CHANGE_EVENT, loadSaved);
  }, []);

  const removeSaved = async (propertyId: string) => {
    await toggleSavedPropertyIdDB(propertyId);
    setSavedProperties((prev) => prev.filter((p) => p.id !== propertyId));
    showToast("Removed from saved spaces.");
  };

  const formatPrice = (p: SavedProperty) => {
    if (!p.price) return "Price on request";
    const crore = p.price / 10000000;
    const lakh = p.price / 100000;
    const formatted = crore >= 1
      ? `₹ ${crore.toFixed(2)} Cr`
      : `₹ ${lakh.toFixed(2)} L`;
    return p.price_period ? `${formatted} / ${p.price_period}` : formatted;
  };

  return (
    <div className="flex flex-col min-h-screen bg-paper font-sans">
      <header className="h-[74px] max-md:h-[63px] bg-white border-b border-line flex items-center px-[clamp(20px,4vw,52px)] max-md:px-[16px] gap-[20px]">
        <span className="text-[12px] text-[#74828d] max-sm:hidden">
          My account / Saved spaces
        </span>
        <nav className="flex gap-[22px] ml-[24px] text-[12px] font-bold text-[#546471] max-md:hidden">
          <Link href="/properties">Properties</Link>
          <Link href="/#areas">Locations</Link>
        </nav>
        <div className="ml-auto">
          <Link
            href="/user-dashboard"
            className="border border-line bg-white rounded-[7px] px-[12px] h-[34px] text-[11px] font-bold text-[#50606d] flex items-center hover:bg-gray-50 transition-colors"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-[1280px] w-full p-[37px_clamp(20px,4vw,52px)_70px] max-md:p-[25px_16px_55px] mx-auto flex-1">
        <div className="flex items-end justify-between mb-[24px]">
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
          <div className="text-center text-[12px] text-muted py-[60px]">
            Loading your saved spaces…
          </div>
        ) : savedProperties.length > 0 ? (
          <div className="grid gap-[10px]">
            {savedProperties.map((p) => (
              <article
                key={p.id}
                className="grid grid-cols-[95px_1fr_auto] max-sm:grid-cols-[72px_1fr] gap-[13px] items-center border border-[#e3e8e9] p-[10px] rounded bg-white relative"
              >
                <Link
                  href={`/properties/${p.id}`}
                  className="h-[66px] w-[95px] max-sm:h-[57px] max-sm:w-[72px] bg-cover bg-center rounded block shrink-0 bg-slate-100"
                  style={p.image_url ? { backgroundImage: `url('${p.image_url}')` } : {}}
                />

                <div className="min-w-0 max-sm:col-start-2">
                  <Link href={`/properties/${p.id}`} className="hover:text-gold transition-colors block">
                    <h3 className="text-[13px] font-bold m-0 mb-[4px] text-ink truncate">
                      {p.title}
                    </h3>
                  </Link>
                  <p className="m-0 text-[10px] text-muted truncate">
                    {p.locality ? `${p.locality}, ` : ""}{p.city} ·{" "}
                    {p.bedrooms ? `${p.bedrooms} Bed` : p.property_type} ·{" "}
                    {p.area_sqft ? `${p.area_sqft.toLocaleString()} sq ft` : "—"}
                  </p>
                  <b className="text-[12px] font-bold block my-[7px] text-ink">
                    {formatPrice(p)}
                  </b>
                </div>

                <button
                  onClick={() => removeSaved(p.id)}
                  title="Remove"
                  className="border-0 bg-white text-[#9aa5ab] text-[20px] font-bold cursor-pointer hover:text-red-500 transition-colors max-sm:absolute max-sm:right-[9px] max-sm:top-[9px]"
                >
                  ×
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-[#bdc8cc] p-[38px] text-center text-[12px] text-muted rounded bg-white">
            No saved spaces yet.
            <br /><br />
            <Link href="/properties" className="inline-block bg-navy !text-white font-bold px-4 py-2 rounded">
              Explore properties
            </Link>
          </div>
        )}
      </div>

      {toastMsg && (
        <div className="fixed bottom-[20px] right-[20px] bg-[#143b60] text-white p-[12px_15px] rounded-[7px] text-[12px] shadow-[0_8px_22px_rgba(0,0,0,0.2)] z-50 animate-bounce">
          {toastMsg}
        </div>
      )}
    </div>
  );
}