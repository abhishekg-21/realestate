"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import Footer from "@/components/footer";
import PropertyCard from "@/components/property-card";
import { useProperties } from "@/lib/supabase-properties";

export default function Home() {
  const [activeTab, setActiveTab] = useState("All homes");
  const { properties, loading } = useProperties();

  const filteredProperties = properties
    .filter((p) => {
      const type = p.type?.toLowerCase() || "";
      const tag = p.tag?.toLowerCase() || "";

      if (activeTab === "Apartments") {
        return type === "apartment" || type.includes("flat");
      }
      if (activeTab === "Villas") {
        return (
          type === "villa" ||
          type.includes("house") ||
          type.includes("bungalow")
        );
      }
      if (activeTab === "New launches") {
        return (
          tag.includes("new") ||
          tag.includes("launch") ||
          tag.includes("verified") ||
          p.id === "aurelia-gurugram"
        );
      }
      return true;
    })
    .slice(0, 6);

  const featuredVillas = properties
    .filter((p) => {
      const type = p.type?.toLowerCase() || "";
      return type === "villa" || type.includes("house");
    })
    .slice(0, 3);

  return (
    // pb-20 on mobile / pb-16 on desktop to clear the floating bottom bar
    <div className="min-h-screen overflow-x-hidden bg-paper text-ink font-sans pb-20 sm:pb-16">

      {/* ================= HERO ================= */}
      {/*
        pt-[83px] on desktop / pt-[67px] on mobile offsets the fixed navbar
        so the hero background starts right below it, not behind it.
      */}
      <div
        className="relative overflow-hidden bg-navy bg-cover bg-center text-white pt-[67px] md:pt-[83px]"
        style={{
          backgroundImage:
            "linear-gradient(90deg,rgba(2,16,33,.94) 0%,rgba(3,23,45,.84) 49%,rgba(4,17,32,.45)), url('https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=2200&q=88')",
        }}
      >
        <Navbar variant="dark" />
        <Hero />
      </div>

      <main>
        {/* ================= GUIDANCE ================= */}
        <section className="py-16 sm:py-20 lg:py-[88px]" id="guidance">
          <div className="mx-auto w-[calc(100%-32px)] max-w-[1216px] sm:w-[calc(100%-48px)]">
            <div className="mb-7 flex flex-col items-start justify-between gap-5 md:mb-9 md:flex-row md:items-end">
              <div className="min-w-0">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[1.6px] text-[#b57b22]">
                  A clearer way to move
                </p>
                <h2 className="font-serif text-[clamp(32px,5vw,49px)] font-medium leading-[1.08] tracking-[-1.8px] text-ink">
                  Whatever brings you here,
                  <br className="hidden sm:block" />
                  we help you move forward.
                </h2>
              </div>

              <a
                href="https://wa.me/919136331992"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center border border-[#aeb7be] px-4 py-3 text-[12px] font-bold transition-colors hover:border-navy hover:bg-navy hover:text-white"
              >
                Speak to an advisor →
              </a>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  number: "01",
                  title: "Buy with confidence",
                  description:
                    "Shortlisted homes, transparent details and local specialists who make the process feel simple.",
                  href: "/properties?purpose=Buy",
                  linkText: "Explore homes for sale →",
                },
                {
                  number: "02",
                  title: "Rent with ease",
                  description:
                    "Find a place that works for your life today, with practical guidance from enquiry to move-in.",
                  href: "/properties?purpose=Rent",
                  linkText: "Find a rental →",
                },
                {
                  number: "03",
                  title: "Sell with clarity",
                  description:
                    "Present your property beautifully and connect with serious, relevant buyers across India.",
                  href: "/business-signup",
                  linkText: "List your property →",
                },
              ].map((item) => (
                <article
                  key={item.number}
                  className="flex min-h-[210px] flex-col justify-between border border-line bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_25px_rgba(22,34,48,0.09)] sm:min-h-[230px] sm:p-6 lg:min-h-[246px] lg:p-7"
                >
                  <div>
                    <span className="text-[12px] font-bold text-[#c78929]">
                      {item.number}
                    </span>
                    <h3 className="mt-6 mb-2 font-serif text-[25px] font-medium text-ink sm:mt-8 sm:text-[27px]">
                      {item.title}
                    </h3>
                    <p className="mb-5 text-[13px] leading-[1.65] text-muted">
                      {item.description}
                    </p>
                  </div>
                  <Link
                    href={item.href}
                    className="w-max border-b border-[#273643] pb-1 text-[12px] font-bold transition-colors hover:border-gold hover:text-gold"
                  >
                    {item.linkText}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================= LISTINGS ================= */}
        <section className="bg-[#f8fafc] py-16 sm:py-20 lg:py-[84px]" id="properties">
          <div className="mx-auto w-[calc(100%-32px)] max-w-[1216px] sm:w-[calc(100%-48px)]">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[1.6px] text-[#b57b22]">
              Properties selected for you
            </p>

            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <h2 className="font-serif text-[clamp(32px,5vw,49px)] font-medium leading-[1.1] tracking-[-1.8px] text-ink">
                Explore remarkable addresses
              </h2>
              <Link
                href="/properties"
                className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-navy px-5 py-2.5 text-[12px] font-bold !text-white shadow-sm transition-colors hover:bg-navy2 whitespace-nowrap"
              >
                View all ({properties.length}) →
              </Link>
            </div>

            {/* Filter tabs — scrollable on mobile */}
            <div className="mt-6 flex max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {["All homes", "Apartments", "Villas", "New launches"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 rounded-[20px] border px-4 py-2 text-[12px] font-semibold transition-colors ${activeTab === tab
                    ? "border-navy bg-navy text-white shadow-sm"
                    : "border-[#cbd3d7] bg-white text-ink hover:bg-slate-100"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Property grid */}
            {loading ? (
              <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-[380px] animate-pulse rounded-2xl border border-line bg-white p-4"
                  >
                    <div className="h-[200px] rounded-xl bg-gray-200" />
                    <div className="mt-4 space-y-2">
                      <div className="h-4 w-1/3 rounded bg-gray-200" />
                      <div className="h-6 w-3/4 rounded bg-gray-200" />
                      <div className="h-4 w-1/2 rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProperties.length > 0 ? (
              <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="mt-7 rounded-xl border border-line bg-white p-8 text-center sm:p-12">
                <p className="mb-4 text-[14px] text-muted sm:text-[15px]">
                  No properties under "{activeTab}" at the moment.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("All homes")}
                  className="rounded-lg bg-navy px-6 py-2.5 text-xs font-bold !text-white transition-colors hover:bg-navy2"
                >
                  View All Homes
                </button>
              </div>
            )}

            <div className="mt-8 text-center sm:mt-10">
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 border-b-2 border-[#1b2b38] pb-1 text-[13px] font-bold text-ink transition-colors hover:border-gold hover:text-gold sm:text-[14px]"
              >
                <span>Browse all properties & filters</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ================= FEATURED VILLAS ================= */}
        {featuredVillas.length > 0 && (
          <section
            className="border-t border-slate-100 bg-white py-16 sm:py-20 lg:py-[84px]"
            id="featured-villas"
          >
            <div className="mx-auto w-[calc(100%-32px)] max-w-[1216px] sm:w-[calc(100%-48px)]">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[1.6px] text-[#b57b22]">
                Premium Living
              </p>
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
                <h2 className="font-serif text-[clamp(32px,5vw,49px)] font-medium leading-[1.1] tracking-[-1.8px] text-ink">
                  Featured Villas & Estates
                </h2>
                <Link
                  href="/properties?type=Villa"
                  className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-navy px-5 py-2.5 text-[12px] font-bold !text-white shadow-sm transition-colors hover:bg-navy2 whitespace-nowrap"
                >
                  View all villas →
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 lg:mt-10">
                {featuredVillas.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ================= WHY US ================= */}
        <section
          className="border-y border-slate-100 bg-white py-16 sm:py-20 lg:py-[88px]"
          id="why-us"
        >
          <div className="mx-auto w-[calc(100%-32px)] max-w-[1216px] text-center sm:w-[calc(100%-48px)]">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[1.6px] text-[#b57b22] sm:text-[11px]">
              Built for modern real estate buyers & investors
            </p>
            <h2 className="mb-8 font-serif text-[clamp(30px,4vw,38px)] font-medium text-slate-900 sm:mb-12">
              Why PropertiesNexus
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {[
                {
                  icon: "🛡️",
                  color: "bg-blue-50 text-blue-600",
                  title: "Verified Realtors & Developers",
                  description:
                    "Every realtor and builder on PropertiesNexus holds a valid license, undergoes identity verification, and adheres to strict standard compliance.",
                },
                {
                  icon: "⚖️",
                  color: "bg-indigo-50 text-indigo-600",
                  title: "Transparent Pricing",
                  description:
                    "No hidden fees. All prices, maintenance charges, taxes, and deposit costs are fully disclosed upfront for complete peace of mind.",
                },
                {
                  icon: "🧭",
                  color: "bg-rose-50 text-rose-600",
                  title: "Guided Process",
                  description:
                    "From first viewing to key handover — our certified realtors and property advisors guide you through every step in your preferred language.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="flex flex-col items-center rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center sm:p-8"
                >
                  <div
                    className={`mb-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-sm ${feature.color}`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="mb-3 text-[17px] font-bold text-slate-900 sm:text-[18px]">
                    {feature.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed text-slate-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= NOTIFICATION ================= */}
        <section className="bg-[#f1f5f9] py-16 sm:py-20 lg:py-[88px]">
          <div className="mx-auto w-[calc(100%-32px)] max-w-[1000px] sm:w-[calc(100%-48px)]">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-sm sm:rounded-3xl sm:p-10 lg:p-12">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[1.6px] text-[#b57b22] sm:text-[11px]">
                Stay ahead of the market
              </p>
              <h2 className="mb-3 font-serif text-[clamp(27px,4vw,36px)] font-medium text-slate-900">
                Get notified when new listings go live
              </h2>
              <p className="mx-auto mb-7 max-w-[550px] text-[13px] text-slate-600 sm:mb-8 sm:text-[14px]">
                Enter your email and we'll alert you when properties matching
                your exact search criteria are added.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Subscribed! We will notify you of new listings.");
                }}
                className="mx-auto flex w-full max-w-[520px] flex-col gap-3 sm:flex-row"
              >
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="h-12 min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 text-[14px] outline-none focus:border-[#d49a38] focus:ring-2 focus:ring-[#d49a38]/20"
                />
                <button
                  type="submit"
                  className="h-12 shrink-0 rounded-xl bg-[#dc2626] px-7 text-[14px] font-bold text-white shadow-sm transition-colors hover:bg-[#b91c1c]"
                >
                  Notify Me
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* ================= AREAS ================= */}
        <section className="py-16 sm:py-20 lg:py-[89px]" id="areas">
          <div className="mx-auto grid w-[calc(100%-32px)] max-w-[1216px] grid-cols-1 items-center gap-10 sm:w-[calc(100%-48px)] lg:grid-cols-[1.2fr_1fr] lg:gap-[95px]">
            <div className="min-w-0">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[1.6px] text-[#b57b22]">
                Discover your next area
              </p>
              <h2 className="font-serif text-[clamp(32px,5vw,49px)] font-medium leading-[1.1] tracking-[-1.8px] text-ink">
                Local insight,
                <br />
                across{" "}
                <em className="not-italic text-[#bd8125]">India.</em>
              </h2>
              <p className="my-5 mb-7 max-w-[445px] text-[14px] leading-[1.75] text-muted sm:text-[15px]">
                From familiar city streets to high-potential new neighbourhoods,
                discover locations with a perspective beyond the pin on the map.
              </p>
              <Link
                href="/properties"
                className="inline-block border border-[#aeb7be] px-4 py-3 text-[12px] font-bold transition-colors hover:border-navy hover:bg-navy hover:text-white"
              >
                Explore all locations →
              </Link>
            </div>

            <div className="border-t border-line">
              {[
                { num: "01", name: "Mumbai" },
                { num: "02", name: "Bengaluru" },
                { num: "03", name: "Delhi NCR" },
                { num: "04", name: "Pune" },
                { num: "05", name: "Hyderabad" },
                { num: "06", name: "Goa" },
              ].map((area) => (
                <Link
                  key={area.num}
                  href={`/properties?query=${encodeURIComponent(area.name)}`}
                  className="group flex items-center border-b border-line px-1 py-4 font-serif text-[21px] text-ink transition-colors hover:text-gold sm:py-[18px] sm:text-[24px]"
                >
                  <span className="w-11 shrink-0 font-sans text-[11px] font-normal text-[#bd8125] sm:w-12">
                    {area.num}
                  </span>
                  <span className="min-w-0 truncate">{area.name}</span>
                  <b className="ml-auto shrink-0 pl-4 font-sans text-[17px] font-normal text-[#bd8125] transition-transform group-hover:translate-x-1">
                    →
                  </b>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ================= PARTNERS ================= */}
        <section className="bg-navy py-16 text-white sm:py-20 lg:py-[88px]" id="agents">
          <div className="mx-auto grid w-[calc(100%-32px)] max-w-[1216px] grid-cols-1 items-center gap-9 sm:w-[calc(100%-48px)] lg:grid-cols-2 lg:gap-[90px]">
            <div className="order-2 min-w-0 lg:order-1">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[1.6px] text-[#b57b22]">
                For owners, builders & agents
              </p>
              <h2 className="font-serif text-[clamp(32px,5vw,49px)] font-medium leading-[1.1] tracking-[-1.8px] text-white">
                Your next opportunity,
                <br className="hidden sm:block" />
                seen by the right people.
              </h2>
              <p className="my-4 max-w-[450px] text-[14px] leading-[1.7] text-[#c5d1dd] sm:text-[15px]">
                Bring your property to a discerning national audience with
                compelling presentation and a team that understands local demand.
              </p>
              <Link
                href="/business-signup"
                className="mt-3 inline-block rounded bg-white px-[17px] py-[14px] text-[12px] font-bold !text-slate-900 transition-colors hover:bg-gray-100"
              >
                Become a PropertiesNexus partner →
              </Link>
            </div>

            <div
              className="order-1 h-[260px] rounded-lg bg-cover bg-center sm:h-[350px] lg:order-2 lg:h-[390px]"
              style={{
                backgroundImage:
                  "linear-gradient(0deg,rgba(2,16,31,.15),rgba(2,16,31,.02)), url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=86')",
              }}
            />
          </div>
        </section>
      </main>

      {/* ================= FLOATING BAR ================= */}
      {/*
        hidden on very small screens (< 360px) to avoid overflow.
        On mobile it sits at bottom-3 with safe-area padding.
        gap reduced on mobile to fit all items without wrapping.
      */}
      <div className="fixed bottom-3 left-1/2 z-40 hidden min-[360px]:flex max-w-[calc(100vw-16px)] -translate-x-1/2 items-center gap-2 overflow-x-auto rounded-full border border-slate-700/60 bg-[#0f172a]/95 px-3 py-2 text-[10px] font-semibold text-white shadow-2xl backdrop-blur-md [scrollbar-width:none] sm:bottom-6 sm:gap-4 sm:px-5 sm:text-[13px] [&::-webkit-scrollbar]:hidden">
        <Link
          href="/properties"
          className="flex shrink-0 items-center gap-1 whitespace-nowrap text-amber-400 hover:text-amber-300 transition-colors"
        >
          <span className="h-2 w-2 shrink-0 animate-ping rounded-full bg-emerald-400" />
          <span>📌 {properties.length} Active Listings</span>
        </Link>

        <span className="h-4 w-px shrink-0 bg-slate-700" />

        <Link
          href="/properties?view=map"
          className="flex shrink-0 items-center gap-1 whitespace-nowrap transition-colors hover:text-amber-400"
        >
          🗺️ Map
        </Link>

        <span className="h-4 w-px shrink-0 bg-slate-700" />

        <Link
          href="/properties"
          className="flex shrink-0 items-center gap-1 whitespace-nowrap transition-colors hover:text-amber-400"
        >
          🔍 Properties
        </Link>

        <span className="h-4 w-px shrink-0 bg-slate-700" />

        <Link
          href="/properties"
          className="flex shrink-0 items-center gap-1 whitespace-nowrap transition-colors hover:text-amber-400"
        >
          ⚙️ Filters
        </Link>
      </div>

      <Footer />
    </div>
  );
}