"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PropertyCard from "@/components/property-card";
import { Property } from "@/lib/properties-data";
import { useProperties } from "@/lib/supabase-properties";
import dynamic from "next/dynamic";

const PropertiesMapView = dynamic(() => import("@/components/properties-map-view"), { ssr: false });

const CITIES = ["All Cities", "Mumbai", "Pune", "Delhi NCR", "Bengaluru", "Hyderabad", "Goa", "Nashik", "Chennai", "Other"];

const PROPERTY_TYPES = ["Apartment", "Villa", "Office", "Plot", "Builder floor", "Penthouse", "Commercial"];

const PRICE_PRESETS = [
  { label: "All Prices", min: "", max: "" },
  { label: "Under ₹ 1 Cr", min: "0", max: "10000000" },
  { label: "₹ 1 Cr - ₹ 5 Cr", min: "10000000", max: "50000000" },
  { label: "₹ 5 Cr - ₹ 20 Cr", min: "50000000", max: "200000000" },
  { label: "Above ₹ 20 Cr", min: "200000000", max: "" },
];

function PropertiesExplorerContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const initialPurpose = searchParams.get("purpose") || "";
  const initialType = searchParams.get("type") || "";
  const initialTag = searchParams.get("tag") || "";
  const initialCity = searchParams.get("city") || "";
  const initialView = (searchParams.get("view") as "grid" | "map") || "grid";

  const { properties, loading } = useProperties();

  const initialSelectedCity = CITIES.includes(initialCity || "All Cities") ? (initialCity || "All Cities") : "Other";
  
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [selectedCity, setSelectedCity] = useState(initialSelectedCity);
  const [customCity, setCustomCity] = useState(initialSelectedCity === "Other" ? initialCity : "");
  const [purposes, setPurposes] = useState<string[]>(
    initialPurpose && initialPurpose !== "Buy or rent" ? [initialPurpose] : []
  );
  const [types, setTypes] = useState<string[]>(
    initialType && initialType !== "Any type" ? [initialType] : []
  );
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [sort, setSort] = useState("new");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">(initialView);

  // Sync state if url params change
  useEffect(() => {
    if (initialQuery) setQueryInput(initialQuery);
    if (initialPurpose && initialPurpose !== "Buy or rent") setPurposes([initialPurpose]);
    if (initialType && initialType !== "Any type") setTypes([initialType]);
    if (initialTag) setSelectedTag(initialTag);
    if (initialCity) {
      if (CITIES.includes(initialCity)) {
        setSelectedCity(initialCity);
        setCustomCity("");
      } else {
        setSelectedCity("Other");
        setCustomCity(initialCity);
      }
    }
    if (initialView) setViewMode(initialView);
  }, [initialQuery, initialPurpose, initialType, initialTag, initialCity, initialView]);

  const togglePurpose = (val: string) => {
    setPurposes((prev) =>
      prev.includes(val) ? prev.filter((p) => p !== val) : [...prev, val]
    );
  };

  const toggleType = (val: string) => {
    setTypes((prev) =>
      prev.includes(val) ? prev.filter((t) => t !== val) : [...prev, val]
    );
  };

  const applyPricePreset = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const resetFilters = () => {
    setQueryInput("");
    setSelectedCity("All Cities");
    setCustomCity("");
    setPurposes([]);
    setTypes([]);
    setSelectedTag("");
    setMinPrice("");
    setMaxPrice("");
    setBeds("");
    setBaths("");
    setSort("new");
  };

  // Calculate active filter count
  const activeCount =
    (queryInput ? 1 : 0) +
    (selectedCity !== "All Cities" ? 1 : 0) +
    purposes.length +
    types.length +
    (selectedTag ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0) +
    (beds ? 1 : 0) +
    (baths ? 1 : 0);

  const filteredProperties = properties
    .filter((p) => {
      // 1. Search Query
      if (queryInput.trim()) {
        const q = queryInput.toLowerCase();
        const match =
          p.title.toLowerCase().includes(q) ||
          p.area.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q) ||
          p.tag?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q);
        if (!match) return false;
      }

      // 2. City Filter
      const cityToMatch = selectedCity === "Other" ? customCity : selectedCity;
      if (cityToMatch && cityToMatch !== "All Cities") {
        if (p.city.toLowerCase() !== cityToMatch.toLowerCase()) {
          return false;
        }
      }

      // 3. Purpose Filter
      if (purposes.length > 0) {
        const matchPurpose = purposes.some((purp) => {
          if (purp === "Buy") return p.purpose === "Buy" || p.purpose === "Sale";
          if (purp === "Rent") return p.purpose === "Rent" || p.purpose === "Lease" || p.purpose === "PG";
          return p.purpose.toLowerCase() === purp.toLowerCase();
        });
        if (!matchPurpose) return false;
      }

      // 4. Property Type Filter
      if (types.length > 0) {
        const matchType = types.some((t) => {
          const pType = p.type.toLowerCase();
          const target = t.toLowerCase();
          if (target === "villa") return pType.includes("villa") || pType.includes("house");
          if (target === "apartment") return pType.includes("apartment") || pType.includes("flat");
          if (target === "office") return pType.includes("office") || pType.includes("commercial");
          return pType.includes(target);
        });
        if (!matchType) return false;
      }

      // 5. Tag / Highlight Filter
      if (selectedTag) {
        const t = selectedTag.toLowerCase();
        const pTag = (p.tag || "").toLowerCase();
        if (!pTag.includes(t)) return false;
      }

      // 6. Price Range
      if (minPrice && p.price < Number(minPrice)) return false;
      if (maxPrice && p.price > Number(maxPrice)) return false;

      // 7. Bedrooms
      if (beds && p.beds < Number(beds)) return false;

      // 8. Bathrooms
      if (baths && p.baths < Number(baths)) return false;

      return true;
    })
    .sort((a, b) => {
      if (sort === "low") return a.price - b.price;
      if (sort === "high") return b.price - a.price;
      if (sort === "beds") return b.beds - a.beds;
      return 0; // default newest first
    });

  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      <Navbar variant="light" />

      {/* Top Section */}
      <section className="py-[42px] pb-[28px] border-b border-line bg-paper">
        <div className="max-w-[1216px] w-[calc(100%-48px)] max-md:w-[calc(100%-32px)] mx-auto flex justify-between items-end">
          <div>
            <p className="text-[#b57b22] font-bold uppercase tracking-[1.6px] text-[10px] m-0 mb-[13px]">
              Verified Real Estate Catalog
            </p>
            <h1 className="font-serif font-medium text-[clamp(34px,4vw,49px)] tracking-[-1.8px] leading-[1.1] m-0 text-ink">
              Explore properties
            </h1>
          </div>

          {activeCount > 0 && (
            <button
              onClick={resetFilters}
              className="border border-amber-600/40 bg-amber-50 text-amber-900 rounded-[20px] px-[16px] py-[8px] text-[12px] font-bold cursor-pointer hover:bg-amber-100 transition-colors max-md:hidden shadow-sm flex items-center gap-1.5"
            >
              Reset filters ({activeCount}) ✕
            </button>
          )}
        </div>

        {/* Mobile Filter Tools */}
        <div className="max-w-[1216px] w-[calc(100%-48px)] max-md:w-[calc(100%-32px)] mx-auto hidden max-md:flex gap-[10px] mt-[20px]">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex-1 border border-line bg-white py-[10px] rounded-[8px] text-[13px] font-bold shadow-sm flex items-center justify-center gap-2"
          >
            ⚙ Filters {activeCount > 0 ? `(${activeCount})` : ""}
          </button>
          {activeCount > 0 && (
            <button
              onClick={resetFilters}
              className="border border-line bg-white px-[14px] py-[10px] rounded-[8px] text-[13px] font-bold shadow-sm"
            >
              Reset
            </button>
          )}
        </div>
      </section>

      {/* Main Grid */}
      <main className="max-w-[1216px] w-[calc(100%-48px)] max-md:w-[calc(100%-32px)] mx-auto grid grid-cols-[290px_1fr] max-md:grid-cols-1 gap-[35px] py-[35px] pb-[80px]">
        {/* Sidebar Filters */}
        <aside
          className={`bg-white border border-line p-[24px] rounded-[14px] self-start sticky top-[95px] max-md:fixed max-md:inset-0 max-md:z-50 max-md:overflow-y-auto max-md:rounded-none max-md:top-0 shadow-sm ${
            mobileFiltersOpen ? "max-md:block" : "max-md:hidden"
          }`}
        >
          <div className="hidden max-md:flex justify-between items-center mb-6 pb-4 border-b border-line">
            <h2 className="font-serif text-xl font-bold m-0">Filters</h2>
            <div className="flex gap-4 items-center">
              <button onClick={resetFilters} className="text-sm text-gold font-bold">
                Clear all
              </button>
              <button onClick={() => setMobileFiltersOpen(false)} className="text-xl font-bold p-1 cursor-pointer">
                ✕
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="mb-[22px] flex flex-col gap-[8px] text-[13px]">
            <label htmlFor="queryInput" className="font-bold text-ink">
              Search location or keyword
            </label>
            <input
              id="queryInput"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Worli, Pune, Villa, Sea view..."
              className="border border-line p-[10px_12px] rounded-[8px] outline-0 text-[13px] w-full bg-white text-ink focus:border-gold"
            />
          </div>

          {/* City Selector */}
          <div className="mb-[22px] flex flex-col gap-[8px] text-[13px]">
            <label htmlFor="citySelect" className="font-bold text-ink">
              City / Region
            </label>
            {selectedCity === "Other" ? (
              <div className="flex gap-2">
                <input
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  placeholder="Type city/region..."
                  className="w-full border border-line p-[10px_12px] rounded-[8px] outline-0 text-[13px] bg-white text-ink focus:border-gold"
                  autoFocus
                />
                <button type="button" onClick={() => { setSelectedCity("All Cities"); setCustomCity(""); }} className="px-3 border border-line rounded-[8px] text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-500">✕</button>
              </div>
            ) : (
              <select
                id="citySelect"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="border border-line p-[10px_12px] rounded-[8px] outline-0 text-[13px] w-full bg-white text-ink cursor-pointer focus:border-gold font-medium"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Purpose */}
          <div className="mb-[22px] flex flex-col gap-[8px] text-[13px]">
            <span className="font-bold text-ink">Purpose</span>
            <label className="flex items-center gap-[8px] text-muted cursor-pointer font-normal hover:text-ink">
              <input
                type="checkbox"
                checked={purposes.includes("Buy")}
                onChange={() => togglePurpose("Buy")}
                className="rounded border-line accent-gold w-4 h-4"
              />{" "}
              For Sale
            </label>
            <label className="flex items-center gap-[8px] text-muted cursor-pointer font-normal hover:text-ink">
              <input
                type="checkbox"
                checked={purposes.includes("Rent")}
                onChange={() => togglePurpose("Rent")}
                className="rounded border-line accent-gold w-4 h-4"
              />{" "}
              For Rent / Lease
            </label>
          </div>

          {/* Property Type */}
          <div className="mb-[22px] flex flex-col gap-[8px] text-[13px]">
            <span className="font-bold text-ink">Property type</span>
            {PROPERTY_TYPES.map((t) => (
              <label key={t} className="flex items-center gap-[8px] text-muted cursor-pointer font-normal hover:text-ink">
                <input
                  type="checkbox"
                  checked={types.includes(t)}
                  onChange={() => toggleType(t)}
                  className="rounded border-line accent-gold w-4 h-4"
                />{" "}
                {t}
              </label>
            ))}
          </div>

          {/* Price Range */}
          <div className="mb-[22px] flex flex-col gap-[8px] text-[13px]">
            <span className="font-bold text-ink">Price range (₹)</span>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRICE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPricePreset(p.min, p.max)}
                  className={`text-[10px] font-semibold px-2 py-1 rounded border transition-colors ${
                    minPrice === p.min && maxPrice === p.max
                      ? "bg-navy !text-white border-navy"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-[8px]">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="border border-line p-[9px_11px] rounded-[8px] outline-0 text-[12px] w-full bg-white text-ink focus:border-gold"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="border border-line p-[9px_11px] rounded-[8px] outline-0 text-[12px] w-full bg-white text-ink focus:border-gold"
              />
            </div>
          </div>

          {/* Bedrooms & Bathrooms */}
          <div className="grid grid-cols-2 gap-3 mb-[22px] text-[13px]">
            <div>
              <label htmlFor="bedSelect" className="font-bold text-ink block mb-1.5">
                Bedrooms
              </label>
              <select
                id="bedSelect"
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                className="border border-line p-[8px_10px] rounded-[8px] outline-0 text-[12px] w-full bg-white text-ink cursor-pointer focus:border-gold"
              >
                <option value="">Any</option>
                <option value="1">1+ Bed</option>
                <option value="2">2+ Beds</option>
                <option value="3">3+ Beds</option>
                <option value="4">4+ Beds</option>
              </select>
            </div>
            <div>
              <label htmlFor="bathSelect" className="font-bold text-ink block mb-1.5">
                Bathrooms
              </label>
              <select
                id="bathSelect"
                value={baths}
                onChange={(e) => setBaths(e.target.value)}
                className="border border-line p-[8px_10px] rounded-[8px] outline-0 text-[12px] w-full bg-white text-ink cursor-pointer focus:border-gold"
              >
                <option value="">Any</option>
                <option value="1">1+ Bath</option>
                <option value="2">2+ Baths</option>
                <option value="3">3+ Baths</option>
                <option value="4">4+ Baths</option>
              </select>
            </div>
          </div>

          {/* Highlights / Tag Filter */}
          <div className="mb-[22px] flex flex-col gap-[8px] text-[13px]">
            <label htmlFor="tagSelect" className="font-bold text-ink">
              Highlights & Tags
            </label>
            <select
              id="tagSelect"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="border border-line p-[10px_12px] rounded-[8px] outline-0 text-[13px] w-full bg-white text-ink cursor-pointer focus:border-gold"
            >
              <option value="">All Properties</option>
              <option value="Prime">Prime / Signature</option>
              <option value="New launch">New Launch</option>
              <option value="Featured">Featured</option>
              <option value="Pool villa">Pool Villa</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>

          <button
            onClick={() => setMobileFiltersOpen(false)}
            className="hidden max-md:block w-full bg-navy !text-white font-bold py-[12px] rounded-[8px] mt-4 shadow-md"
          >
            Apply Filters ({filteredProperties.length})
          </button>
        </aside>

        {/* Listings Content */}
        <section>
          <div className="flex justify-between items-center mb-[20px] text-[13px] text-muted flex-wrap gap-3">
            <span>
              Showing <strong className="text-ink">{filteredProperties.length}</strong> verified properties
            </span>
            <div className="flex items-center gap-4">
              <div className="flex bg-slate-100 rounded-lg p-1 border border-line">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1 text-[12px] font-bold rounded-md transition-colors ${viewMode === "grid" ? "bg-white shadow-sm text-navy" : "text-muted hover:text-ink"}`}
                >
                  ▤ Grid
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`px-3 py-1 text-[12px] font-bold rounded-md transition-colors ${viewMode === "map" ? "bg-white shadow-sm text-navy" : "text-muted hover:text-ink"}`}
                >
                  📍 Map
                </button>
              </div>
              <label className="flex items-center gap-2 font-medium">
                Sort by:{" "}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border border-line p-[6px_10px] rounded-[6px] text-[12px] bg-white text-ink cursor-pointer focus:border-gold font-semibold"
              >
                <option value="new">Newest first</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
                <option value="beds">Most bedrooms</option>
              </select>
            </label>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1 gap-[19px]">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-[380px] bg-white border border-line rounded-[12px] animate-pulse p-4 flex flex-col justify-between">
                  <div className="h-[200px] bg-gray-200 rounded-[8px]" />
                  <div className="space-y-2 mt-4">
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : viewMode === "map" && filteredProperties.length > 0 ? (
            <PropertiesMapView properties={filteredProperties} />
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1 gap-[19px]">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-line p-[60px_20px] text-center rounded-[12px] mt-[10px] shadow-sm">
              <p className="text-[16px] font-serif font-medium text-ink mb-2">No matching properties found</p>
              <p className="text-[14px] text-muted mb-6 max-w-md mx-auto">
                We couldn't find any properties matching your selected filters. Try broadening your criteria.
              </p>
              <button
                onClick={resetFilters}
                className="border border-line bg-navy !text-white rounded-[20px] px-[22px] py-[10px] text-[13px] font-bold hover:bg-navy2 transition-colors shadow-sm"
              >
                Reset all filters
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper flex items-center justify-center font-serif text-xl">Loading properties...</div>}>
      <PropertiesExplorerContent />
    </Suspense>
  );
}
