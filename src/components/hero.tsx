"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Hero() {
  const router = useRouter();
  const [place, setPlace] = useState("");
  const [purpose, setPurpose] = useState("Buy or rent");
  const [type, setType] = useState("Any type");
  const [resultMsg, setResultMsg] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimPlace = place.trim();
    if (!trimPlace && purpose === "Buy or rent" && type === "Any type") {
      setResultMsg("Enter a city or locality to begin your search.");
      return;
    }
    setResultMsg(trimPlace ? `We are preparing properties in ${trimPlace}.` : "Searching properties...");
    
    // Redirect to /properties with query params after a brief moment or directly
    const params = new URLSearchParams();
    if (trimPlace) params.set("query", trimPlace);
    if (purpose !== "Buy or rent") params.set("purpose", purpose);
    if (type !== "Any type") params.set("type", type);
    
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <div className="relative pt-[103px] max-md:pt-[70px] min-h-[633px] pb-16">
      <div className="max-w-[1216px] w-[calc(100%-48px)] max-md:w-[calc(100%-32px)] mx-auto relative">
        <p className="m-0 mb-[17px] uppercase tracking-[1.7px] text-[10px] font-bold text-[#e7bb70]">
          India&apos;s trusted property network
        </p>
        <h1 className="text-[clamp(49px,5.7vw,78px)] max-md:text-[49px] max-md:tracking-[-2px] leading-[1.04] tracking-[-3px] font-serif font-medium m-0 max-w-[670px] text-white">
          Find a place<br />that feels like <em className="not-italic text-[#f5bd45]">yours.</em>
        </h1>
        <p className="text-[18px] max-md:text-[16px] leading-[1.65] text-[#d0d9e4] mt-[22px] mb-[38px] max-md:mb-[27px] max-w-[570px]">
          Discover verified homes, investments and commercial spaces in India&apos;s neighbourhoods worth knowing.
        </p>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="w-[min(785px,70%)] max-md:w-full grid grid-cols-[1.55fr_0.72fr_0.74fr_110px] max-md:grid-cols-[1fr_54px] bg-white p-[7px] rounded-[18px] max-md:rounded-[14px] shadow-[0_15px_35px_rgba(0,0,0,0.22)]"
        >
          <label className="flex gap-[8px] items-center px-[15px] border-r border-[#e4e6e8] text-[#718090]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px] shrink-0">
              <circle cx="11" cy="11" r="6" />
              <path d="m20 20-4-4" />
            </svg>
            <input
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="Search a city, locality or landmark"
              className="w-full border-0 outline-0 text-[#405166] bg-transparent text-[13px]"
            />
          </label>

          <label className="max-md:hidden flex gap-[8px] items-center px-[15px] border-r border-[#e4e6e8] text-[#718090]">
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full border-0 outline-0 text-[#405166] bg-transparent text-[13px] cursor-pointer"
            >
              <option>Buy or rent</option>
              <option>Buy</option>
              <option>Rent</option>
            </select>
          </label>

          <label className="max-md:hidden flex gap-[8px] items-center px-[15px] border-r border-[#e4e6e8] text-[#718090]">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border-0 outline-0 text-[#405166] bg-transparent text-[13px] cursor-pointer"
            >
              <option>Any type</option>
              <option>Apartment</option>
              <option>Villa</option>
              <option>Office</option>
            </select>
          </label>

          <button
            type="submit"
            className="border-0 bg-[#ca8b29] hover:bg-gold text-white rounded-[13px] font-bold cursor-pointer text-[13px] max-md:text-[0px] transition-colors flex items-center justify-center"
          >
            <span className="max-md:hidden">Search</span>
            <span className="hidden max-md:inline-block text-[23px] leading-none">⌕</span>
          </button>
        </form>

        <div className="flex gap-[17px] mt-[15px] text-[11px] text-[#c7d2df] max-md:hidden">
          <span>Popular:</span>
          <Link href="/properties?type=Apartment" className="underline underline-offset-3 hover:text-white">Luxury apartments</Link>
          <Link href="/properties?query=Goa&type=Villa" className="underline underline-offset-3 hover:text-white">Villas in Goa</Link>
          <Link href="/properties" className="underline underline-offset-3 hover:text-white">New launches</Link>
        </div>
        
        {resultMsg && (
          <p className="text-[12px] text-[#f5bd45] mt-2 font-medium animate-pulse" aria-live="polite">
            {resultMsg}
          </p>
        )}

        <div className="flex gap-[43px] mt-[35px] max-md:hidden">
          <div className="flex flex-col">
            <b className="text-[27px] font-semibold text-white">250+</b>
            <span className="text-[10px] tracking-[0.7px] uppercase text-[#c5d1dd] mt-[4px]">Verified partners</span>
          </div>
          <div className="flex flex-col">
            <b className="text-[27px] font-semibold text-white">12k+</b>
            <span className="text-[10px] tracking-[0.7px] uppercase text-[#c5d1dd] mt-[4px]">Active listings</span>
          </div>
          <div className="flex flex-col">
            <b className="text-[27px] font-semibold text-white">350+</b>
            <span className="text-[10px] tracking-[0.7px] uppercase text-[#c5d1dd] mt-[4px]">Neighbourhoods</span>
          </div>
        </div>

        {/* Spotlight Card */}
        <aside className="absolute right-0 top-[80px] w-[355px] max-md:relative max-md:top-auto max-md:right-auto max-md:w-full max-md:mt-[30px]">
          <p className="text-[10px] tracking-[1.2px] font-bold m-0 mb-[15px] uppercase text-[#dce5ed] max-md:hidden">
            Freshly verified listings →
          </p>
          <article className="overflow-hidden bg-[rgba(9,28,48,0.88)] rounded-[18px] max-md:rounded-[12px] shadow-[0_18px_45px_rgba(0,0,0,0.32)] max-md:flex">
            <div
              className="h-[223px] max-md:h-[115px] max-md:w-[43%] max-md:shrink-0 relative bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(0deg,rgba(6,20,36,.55),transparent 52%), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=86')`
              }}
            >
              <span className="absolute top-[13px] left-[13px] bg-[#0e9b65] text-white rounded-[14px] px-[9px] py-[5px] text-[9px] font-bold">
                FOR SALE
              </span>
            </div>
            <div className="p-[12px_16px_16px] max-md:p-[11px] flex flex-col justify-center">
              <span className="text-[#ffd48b] text-[13px] font-bold">₹ 8.75 Cr</span>
              <h3 className="text-[15px] max-md:text-[13px] leading-[1.35] my-[9px] max-md:my-[5px] text-white font-medium">
                Skyline living above Mumbai&apos;s coast
              </h3>
              <small className="text-[#b9c7d3] text-[11px]">Worli, Mumbai</small>
            </div>
          </article>
          <Link
            href="/properties"
            className="block w-max mx-auto mt-[17px] text-white text-[12px] font-bold border-b border-white/70 pb-[4px] hover:opacity-80 transition-opacity max-md:hidden"
          >
            View all properties
          </Link>
        </aside>
      </div>
    </div>
  );
}
