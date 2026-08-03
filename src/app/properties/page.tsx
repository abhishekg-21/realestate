"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PropertyCard from "@/components/property-card";
import { useProperties } from "@/lib/supabase-properties";

function PropertiesExplorerContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const initialPurpose = searchParams.get("purpose") || "";
  const initialType = searchParams.get("type") || "";

  const { properties, loading } = useProperties();

  const [queryInput, setQueryInput] = useState(initialQuery);
  const [purposes, setPurposes] = useState<string[]>(
    initialPurpose && initialPurpose !== "Buy or rent" ? [initialPurpose] : []
  );
  const [types, setTypes] = useState<string[]>(
    initialType && initialType !== "Any type" ? [initialType] : []
  );
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [beds, setBeds] = useState("");
  const [sort, setSort] = useState("new");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync state if url params change
  useEffect(() => {
    if (initialQuery) setQueryInput(initialQuery);
    if (initialPurpose && initialPurpose !== "Buy or rent") setPurposes([initialPurpose]);
    if (initialType && initialType !== "Any type") setTypes([initialType]);
  }, [initialQuery, initialPurpose, initialType]);

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

  const resetFilters = () => {
    setQueryInput("");
    setPurposes([]);
    setTypes([]);
    setMinPrice("");
    setMaxPrice("");
    setBeds("");
    setSort("new");
  };

  const filteredProperties = properties.filter((p) => {
    if (queryInput.trim()) {
      const q = queryInput.toLowerCase();
      const match =
        p.title.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (purposes.length > 0) {
      const matchPurpose = purposes.some(purp => {
        if (purp === "Buy") return p.purpose === "Buy" || p.purpose === "Sale";
        if (purp === "Rent") return p.purpose === "Rent" || p.purpose === "Lease" || p.purpose === "PG";
        return p.purpose.toLowerCase() === purp.toLowerCase();
      });
      if (!matchPurpose) return false;
    }
    if (types.length > 0) {
      const matchType = types.some(t => {
        if (t === "Villa") return p.type.toLowerCase().includes("villa") || p.type.toLowerCase().includes("house");
        if (t === "Apartment") return p.type.toLowerCase().includes("apartment") || p.type.toLowerCase().includes("flat");
        if (t === "Office") return p.type.toLowerCase().includes("office") || p.type.toLowerCase().includes("commercial");
        return p.type.toLowerCase() === t.toLowerCase();
      });
      if (!matchType) return false;
    }
    if (minPrice && p.price < Number(minPrice)) return false;
    if (maxPrice && p.price > Number(maxPrice)) return false;
    if (beds && p.beds < Number(beds)) return false;
    return true;
  }).sort((a, b) => {
    if (sort === "low") return a.price - b.price;
    if (sort === "high") return b.price - a.price;
    return 0; // default new (already sorted newest first in fetch)
  });

  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      <Navbar variant="light" />

      {/* Top Section */}
      <section className="py-[42px] pb-[28px] border-b border-line bg-paper">
        <div className="max-w-[1216px] w-[calc(100%-48px)] max-md:w-[calc(100%-32px)] mx-auto flex justify-between items-end">
          <div>
            <p className="text-[#b57b22] font-bold uppercase tracking-[1.6px] text-[10px] m-0 mb-[13px]">
              All listings
            </p>
            <h1 className="font-serif font-medium text-[clamp(34px,4vw,49px)] tracking-[-1.8px] leading-[1.1] m-0 text-ink">
              Explore properties
            </h1>
          </div>
          <button
            onClick={resetFilters}
            className="border border-line bg-white rounded-[20px] px-[14px] py-[8px] text-[12px] font-bold cursor-pointer hover:bg-gray-50 transition-colors max-md:hidden shadow-sm"
          >
            Reset all filters ✕
          </button>
        </div>

        {/* Mobile Filter Tools */}
        <div className="max-w-[1216px] w-[calc(100%-48px)] max-md:w-[calc(100%-32px)] mx-auto hidden max-md:flex gap-[10px] mt-[20px]">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex-1 border border-line bg-white py-[10px] rounded-[8px] text-[13px] font-bold shadow-sm"
          >
            ⚙ Filters {purposes.length + types.length > 0 ? `(${purposes.length + types.length})` : ""}
          </button>
          <button
            onClick={resetFilters}
            className="border border-line bg-white px-[14px] py-[10px] rounded-[8px] text-[13px] font-bold shadow-sm"
          >
            Reset
          </button>
        </div>
      </section>

      {/* Main Grid */}
      <main className="max-w-[1216px] w-[calc(100%-48px)] max-md:w-[calc(100%-32px)] mx-auto grid grid-cols-[280px_1fr] max-md:grid-cols-1 gap-[35px] py-[35px] pb-[80px]">
        {/* Sidebar Filters */}
        <aside
          className={`bg-white border border-line p-[24px] rounded-[12px] self-start sticky top-[95px] max-md:fixed max-md:inset-0 max-md:z-50 max-md:overflow-y-auto max-md:rounded-none max-md:top-0 shadow-sm ${
            mobileFiltersOpen ? "max-md:block" : "max-md:hidden"
          }`}
        >
          <div className="hidden max-md:flex justify-between items-center mb-6 pb-4 border-b border-line">
            <h2 className="font-serif text-xl font-bold m-0">Filters</h2>
            <div className="flex gap-4 items-center">
              <button
                onClick={resetFilters}
                className="text-sm text-gold font-bold"
              >
                Clear
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

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

          <div className="mb-[22px] flex flex-col gap-[8px] text-[13px]">
            <span className="font-bold text-ink">Purpose</span>
            <label className="flex items-center gap-[8px] text-muted cursor-pointer font-normal hover:text-ink">
              <input
                type="checkbox"
                checked={purposes.includes("Buy")}
                onChange={() => togglePurpose("Buy")}
                className="rounded border-line accent-gold w-4 h-4"
              />{" "}
              For sale
            </label>
            <label className="flex items-center gap-[8px] text-muted cursor-pointer font-normal hover:text-ink">
              <input
                type="checkbox"
                checked={purposes.includes("Rent")}
                onChange={() => togglePurpose("Rent")}
                className="rounded border-line accent-gold w-4 h-4"
              />{" "}
              For rent / lease
            </label>
          </div>

          <div className="mb-[22px] flex flex-col gap-[8px] text-[13px]">
            <span className="font-bold text-ink">Property type</span>
            {["Apartment", "Villa", "Office", "Plot", "Builder floor"].map((t) => (
              <label
                key={t}
                className="flex items-center gap-[8px] text-muted cursor-pointer font-normal hover:text-ink"
              >
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

          <div className="mb-[22px] flex flex-col gap-[8px] text-[13px]">
            <span className="font-bold text-ink">Price range (₹)</span>
            <div className="grid grid-cols-2 gap-[8px]">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="border border-line p-[10px_12px] rounded-[8px] outline-0 text-[13px] w-full bg-white text-ink focus:border-gold"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="border border-line p-[10px_12px] rounded-[8px] outline-0 text-[13px] w-full bg-white text-ink focus:border-gold"
              />
            </div>
          </div>

          <div className="mb-[22px] flex flex-col gap-[8px] text-[13px]">
            <label htmlFor="bedSelect" className="font-bold text-ink">
              Bedrooms
            </label>
            <select
              id="bedSelect"
              value={beds}
              onChange={(e) => setBeds(e.target.value)}
              className="border border-line p-[10px_12px] rounded-[8px] outline-0 text-[13px] w-full bg-white text-ink cursor-pointer focus:border-gold"
            >
              <option value="">Any number</option>
              <option value="1">1+ Bedroom</option>
              <option value="2">2+ Bedrooms</option>
              <option value="3">3+ Bedrooms</option>
              <option value="4">4+ Bedrooms</option>
            </select>
          </div>

          <button
            onClick={() => setMobileFiltersOpen(false)}
            className="hidden max-md:block w-full bg-navy text-white font-bold py-[12px] rounded-[8px] mt-4 shadow-md"
          >
            Apply filters
          </button>
        </aside>

        {/* Listings Content */}
        <section>
          <div className="flex justify-between items-center mb-[20px] text-[13px] text-muted">
            <span>Showing <strong className="text-ink">{filteredProperties.length}</strong> properties</span>
            <label className="flex items-center gap-2">
              Sort by:{" "}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border border-line p-[6px_10px] rounded-[6px] text-[12px] bg-white text-ink cursor-pointer focus:border-gold"
              >
                <option value="new">Newest first</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </label>
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
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1 gap-[19px]">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-line p-[60px_20px] text-center rounded-[12px] mt-[10px] shadow-sm">
              <p className="text-[16px] font-serif font-medium text-ink mb-2">No matching properties</p>
              <p className="text-[14px] text-muted mb-6 max-w-md mx-auto">
                We couldn't find any properties matching your current search criteria or filters.
              </p>
              <button
                onClick={resetFilters}
                className="border border-line bg-navy text-white rounded-[20px] px-[22px] py-[10px] text-[13px] font-bold hover:bg-navy2 transition-colors shadow-sm"
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
