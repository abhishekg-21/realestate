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
    setResultMsg(
      trimPlace
        ? `Preparing properties in ${trimPlace}…`
        : "Searching properties…"
    );
    const params = new URLSearchParams();
    if (trimPlace) params.set("query", trimPlace);
    if (purpose !== "Buy or rent") params.set("purpose", purpose);
    if (type !== "Any type") params.set("type", type);
    router.push(`/properties?${params.toString()}`);
  };

  return (
    /*
      No pt here — the parent page.tsx already offsets pt-[67px] md:pt-[83px]
      for the fixed navbar. We only add the hero's own breathing room below that.
    */
    <div className="relative pb-14 sm:pb-16 lg:pb-20">
      <div className="mx-auto w-[calc(100%-32px)] max-w-[1216px] sm:w-[calc(100%-48px)]">

        {/*
          Two-column layout on lg+:
            left  → headline + form + stats
            right → spotlight card
          Stacks to single column on mobile/tablet.
        */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-10 xl:gap-16 pt-10 sm:pt-14 lg:pt-[72px]">

          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 min-w-0">
            <p className="m-0 mb-[15px] uppercase tracking-[1.7px] text-[10px] font-bold text-[#e7bb70]">
              India&apos;s trusted property network
            </p>

            <h1 className="font-serif font-medium m-0 text-white leading-[1.04] tracking-[-2.5px] text-[clamp(42px,5.7vw,78px)] max-w-[670px]">
              Find a place
              <br />
              that feels like{" "}
              <em className="not-italic text-[#f5bd45]">yours.</em>
            </h1>

            <p className="text-[15px] sm:text-[17px] lg:text-[18px] leading-[1.65] text-[#d0d9e4] mt-5 mb-7 sm:mb-8 max-w-[570px]">
              Discover verified homes, investments and commercial spaces in
              India&apos;s neighbourhoods worth knowing.
            </p>

            <form
              onSubmit={handleSearch}
              className="
    w-full
    lg:w-[min(785px,70%)]
    max-w-[785px]
    grid
    grid-cols-[1.55fr_0.72fr_0.74fr_110px]
    bg-white
    p-[7px]
    rounded-[18px]
    shadow-[0_15px_35px_rgba(0,0,0,0.22)]

    max-lg:grid-cols-[1fr_54px]
    max-lg:rounded-[14px]
  "
            >
              {/* Location */}
              <label
                className="
      flex items-center gap-2
      px-[15px]
      border-r border-[#e4e6e8]
      text-[#718090]

      max-lg:border-r
    "
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-[18px] h-[18px] shrink-0"
                >
                  <circle cx="11" cy="11" r="6" />
                  <path d="m20 20-4-4" />
                </svg>

                <input
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  placeholder="Search a city, locality or landmark"
                  className="
        w-full
        border-0
        outline-0
        text-[#405166]
        bg-transparent
        text-[13px]
      "
                />
              </label>

              {/* Buy / Rent */}
              <label
                className="
      flex items-center
      px-[15px]
      border-r border-[#e4e6e8]
      text-[#718090]

      max-lg:hidden
    "
              >
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="
        w-full
        border-0
        outline-0
        text-[#405166]
        bg-transparent
        text-[13px]
      "
                >
                  <option>Buy or rent</option>
                  <option>Buy</option>
                  <option>Rent</option>
                </select>
              </label>

              {/* Property Type */}
              <label
                className="
      flex items-center
      px-[15px]
      border-r border-[#e4e6e8]
      text-[#718090]

      max-lg:hidden
    "
              >
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="
        w-full
        border-0
        outline-0
        text-[#405166]
        bg-transparent
        text-[13px]
      "
                >
                  <option>Any type</option>
                  <option>Apartment</option>
                  <option>Villa</option>
                  <option>Office</option>
                </select>
              </label>

              {/* Search button */}
              <button
                type="submit"
                className="
      border-0
      bg-[#ca8b29]
      hover:bg-[#b87b20]
      text-white
      rounded-[13px]
      font-bold
      text-[13px]
      cursor-pointer

      max-lg:text-[0px]
      max-lg:rounded-[13px]
    "
              >
                <span className="lg:inline hidden">Search</span>
                <span className="lg:hidden text-[23px]">⌕</span>
              </button>
            </form>


            {/* Popular links */}
            <div className="hidden sm:flex gap-4 mt-3 text-[11px] text-[#c7d2df] flex-wrap">
              <span>Popular:</span>
              <Link
                href="/properties?type=Apartment"
                className="underline underline-offset-3 hover:text-white transition-colors"
              >
                Luxury apartments
              </Link>
              <Link
                href="/properties?query=Goa&type=Villa"
                className="underline underline-offset-3 hover:text-white transition-colors"
              >
                Villas in Goa
              </Link>
              <Link
                href="/properties"
                className="underline underline-offset-3 hover:text-white transition-colors"
              >
                New launches
              </Link>
            </div>

            {resultMsg && (
              <p
                className="text-[12px] text-[#f5bd45] mt-2 font-medium animate-pulse"
                aria-live="polite"
              >
                {resultMsg}
              </p>
            )}

            {/* Stats — hidden on mobile, shown sm+ */}
            <div className="hidden sm:flex gap-8 lg:gap-[43px] mt-8 lg:mt-[35px]">
              {[
                { value: "250+", label: "Verified partners" },
                { value: "12k+", label: "Active listings" },
                { value: "350+", label: "Neighbourhoods" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col">
                  <b className="text-[24px] lg:text-[27px] font-semibold text-white">
                    {s.value}
                  </b>
                  <span className="text-[10px] tracking-[0.7px] uppercase text-[#c5d1dd] mt-1">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN — Spotlight Card ── */}
          {/*
            lg+  : right column, fixed width, floats beside the headline
            sm   : below the form, horizontal card layout
            xs   : compact horizontal card
          */}
          <div className="mt-8 sm:mt-10 lg:mt-0 lg:w-[330px] xl:w-[355px] shrink-0 lg:pt-2">
            <p className="hidden lg:block text-[10px] tracking-[1.2px] font-bold mb-[15px] uppercase text-[#dce5ed]">
              Freshly verified listings →
            </p>

            <article className="overflow-hidden bg-[rgba(9,28,48,0.88)] rounded-[14px] sm:rounded-[18px] shadow-[0_18px_45px_rgba(0,0,0,0.32)] flex sm:flex-col lg:flex-col">
              {/* Card image */}
              <div
                className="h-[100px] w-[38%] sm:w-full sm:h-[210px] lg:h-[223px] shrink-0 relative bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(0deg,rgba(6,20,36,.55),transparent 52%), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=86')`,
                }}
              >
                <span className="absolute top-[10px] left-[10px] bg-[#0e9b65] text-white rounded-[14px] px-[8px] py-[4px] text-[9px] font-bold tracking-wide">
                  FOR SALE
                </span>
              </div>

              {/* Card body */}
              <div className="p-3 sm:p-4 lg:p-[12px_16px_16px] flex flex-col justify-center gap-1">
                <span className="text-[#ffd48b] text-[12px] sm:text-[13px] font-bold">
                  ₹ 8.75 Cr
                </span>
                <h3 className="text-[12px] sm:text-[15px] leading-[1.35] text-white font-medium m-0">
                  Skyline living above Mumbai&apos;s coast
                </h3>
                <small className="text-[#b9c7d3] text-[10px] sm:text-[11px]">
                  Worli, Mumbai
                </small>
              </div>
            </article>

            <Link
              href="/properties"
              className="hidden lg:block w-max mx-auto mt-[17px] text-white text-[12px] font-bold border-b border-white/70 pb-[4px] hover:opacity-80 transition-opacity"
            >
              View all properties
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}