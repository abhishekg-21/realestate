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

  const filteredProperties = properties.filter((p) => {
    if (activeTab === "Apartments") return p.type.toLowerCase() === "apartment" || p.type.toLowerCase().includes("flat");
    if (activeTab === "Villas") return p.type.toLowerCase() === "villa" || p.type.toLowerCase().includes("house") || p.type.toLowerCase().includes("bungalow");
    if (activeTab === "New launches") return p.tag.toLowerCase().includes("new") || p.tag.toLowerCase().includes("launch") || p.tag.toLowerCase().includes("verified") || p.id === "aurelia-gurugram";
    return true;
  }).slice(0, 3);

  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      <div className="relative bg-navy text-white overflow-hidden bg-cover bg-center" style={{ backgroundImage: "linear-gradient(90deg,rgba(2,16,33,.94) 0%,rgba(3,23,45,.84) 49%,rgba(4,17,32,.45)), url('https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=2200&q=88')" }}>
        <Navbar variant="dark" />
        <Hero />
      </div>

      <main>
        {/* Guidance Section */}
        <section className="py-[88px] max-md:py-[66px]" id="guidance">
          <div className="max-w-[1216px] w-[calc(100%-48px)] max-md:w-[calc(100%-32px)] mx-auto">
            <div className="flex max-md:flex-col justify-between items-end max-md:items-start mb-[35px] gap-4">
              <div>
                <p className="text-[#b57b22] font-bold uppercase tracking-[1.6px] text-[10px] m-0 mb-[13px]">
                  A clearer way to move
                </p>
                <h2 className="font-serif font-medium text-[clamp(34px,4vw,49px)] tracking-[-1.8px] leading-[1.1] m-0 text-ink">
                  Whatever brings you here,<br />we help you move forward.
                </h2>
              </div>
              <a
                href="https://wa.me/919136331992"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#aeb7be] px-[16px] py-[12px] font-bold text-[12px] hover:bg-navy hover:text-white hover:border-navy transition-colors max-md:hidden"
              >
                Speak to an advisor →
              </a>
            </div>

            <div className="grid grid-cols-3 max-md:grid-cols-1 gap-[16px] max-md:gap-[10px]">
              <article className="border border-line p-[27px] max-md:p-[22px] min-h-[246px] max-md:min-h-[190px] bg-white transition-all duration-200 hover:-translate-y-[4px] hover:shadow-[0_12px_25px_rgba(22,34,48,0.09)] flex flex-col justify-between">
                <div>
                  <span className="text-[#c78929] text-[12px] font-bold">01</span>
                  <h3 className="font-serif text-[27px] font-medium mt-[37px] max-md:mt-[24px] mb-[11px] text-ink">
                    Buy with confidence
                  </h3>
                  <p className="text-[13px] leading-[1.65] text-muted m-0 mb-[21px]">
                    Shortlisted homes, transparent details and local specialists who make the process feel simple.
                  </p>
                </div>
                <Link
                  href="/properties?purpose=Buy"
                  className="text-[12px] font-bold border-b border-[#273643] pb-[4px] w-max hover:text-gold hover:border-gold transition-colors"
                >
                  Explore homes for sale →
                </Link>
              </article>

              <article className="border border-line p-[27px] max-md:p-[22px] min-h-[246px] max-md:min-h-[190px] bg-white transition-all duration-200 hover:-translate-y-[4px] hover:shadow-[0_12px_25px_rgba(22,34,48,0.09)] flex flex-col justify-between">
                <div>
                  <span className="text-[#c78929] text-[12px] font-bold">02</span>
                  <h3 className="font-serif text-[27px] font-medium mt-[37px] max-md:mt-[24px] mb-[11px] text-ink">
                    Rent with ease
                  </h3>
                  <p className="text-[13px] leading-[1.65] text-muted m-0 mb-[21px]">
                    Find a place that works for your life today, with practical guidance from enquiry to move-in.
                  </p>
                </div>
                <Link
                  href="/properties?purpose=Rent"
                  className="text-[12px] font-bold border-b border-[#273643] pb-[4px] w-max hover:text-gold hover:border-gold transition-colors"
                >
                  Find a rental →
                </Link>
              </article>

              <article className="border border-line p-[27px] max-md:p-[22px] min-h-[246px] max-md:min-h-[190px] bg-white transition-all duration-200 hover:-translate-y-[4px] hover:shadow-[0_12px_25px_rgba(22,34,48,0.09)] flex flex-col justify-between">
                <div>
                  <span className="text-[#c78929] text-[12px] font-bold">03</span>
                  <h3 className="font-serif text-[27px] font-medium mt-[37px] max-md:mt-[24px] mb-[11px] text-ink">
                    Sell with clarity
                  </h3>
                  <p className="text-[13px] leading-[1.65] text-muted m-0 mb-[21px]">
                    Present your property beautifully and connect with serious, relevant buyers across India.
                  </p>
                </div>
                <Link
                  href="/business-signup"
                  className="text-[12px] font-bold border-b border-[#273643] pb-[4px] w-max hover:text-gold hover:border-gold transition-colors"
                >
                  List your property →
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* Listings Section */}
        <section className="bg-[#f8fafc] py-[84px] max-md:py-[66px]" id="properties">
          <div className="max-w-[1216px] w-[calc(100%-48px)] max-md:w-[calc(100%-32px)] mx-auto">
            <p className="text-[#b57b22] font-bold uppercase tracking-[1.6px] text-[10px] m-0 mb-[13px]">
              Properties selected for you
            </p>
            <div className="flex justify-between items-end max-md:flex-col max-md:items-start gap-4">
              <div>
                <h2 className="font-serif font-medium text-[clamp(34px,4vw,49px)] tracking-[-1.8px] leading-[1.1] m-0 text-ink">
                  Explore remarkable addresses
                </h2>
              </div>
              <Link
                href="/properties"
                className="bg-navy !text-white text-[12px] font-bold px-5 py-2.5 rounded-xl hover:bg-navy2 transition-colors shadow-sm inline-flex items-center gap-1"
              >
                View all properties ({properties.length}) →
              </Link>
            </div>
            
            <div className="flex flex-wrap gap-[8px] mt-[25px]">
              {[
                { name: "All homes", link: "/properties" },
                { name: "Apartments", link: "/properties?type=Apartment" },
                { name: "Villas", link: "/properties?type=Villa" },
                { name: "New launches", link: "/properties?tag=New+launch" },
              ].map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => {
                    if (tab.name === "All homes") {
                      setActiveTab("All homes");
                    } else {
                      setActiveTab(tab.name);
                    }
                  }}
                  className={`border border-[#cbd3d7] rounded-[20px] px-[16px] py-[8px] text-[12px] font-semibold cursor-pointer transition-colors ${
                    activeTab === tab.name
                      ? "text-white bg-navy border-navy shadow-sm"
                      : "bg-white text-ink hover:bg-slate-100"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-3 max-md:grid-cols-1 gap-[19px] mt-[27px]">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-[380px] bg-white border border-line rounded-2xl animate-pulse p-4 flex flex-col justify-between">
                    <div className="h-[200px] bg-gray-200 rounded-xl" />
                    <div className="space-y-2 mt-4">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-6 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProperties.length > 0 ? (
              <div className="grid grid-cols-3 max-md:grid-cols-1 gap-[24px] mt-[27px]">
                {(activeTab === "ALL_EXPANDED" ? properties : filteredProperties).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-line p-12 text-center rounded-[12px] mt-[27px]">
                <p className="text-muted text-[15px] mb-4">No properties available under "{activeTab}" at the moment.</p>
                <button
                  onClick={() => setActiveTab("All homes")}
                  className="bg-navy !text-white px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-navy2 transition-colors"
                >
                  View All Homes
                </button>
              </div>
            )}

            <div className="text-center mt-[40px]">
              <Link
                href="/properties"
                className="font-bold text-[14px] inline-flex items-center gap-2 border-b-2 border-[#1b2b38] pb-[4px] text-ink hover:text-gold hover:border-gold transition-colors"
              >
                <span>Browse all properties & filters</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Why PropertiesNexus Section (Matching Image 3) */}
        <section className="py-[88px] max-md:py-[60px] bg-white border-y border-slate-100" id="why-us">
          <div className="max-w-[1216px] w-[calc(100%-48px)] max-md:w-[calc(100%-32px)] mx-auto text-center">
            <p className="text-[#b57b22] font-bold uppercase tracking-[1.6px] text-[11px] mb-2">
              Built for modern real estate buyers & investors
            </p>
            <h2 className="font-serif text-[38px] max-md:text-[30px] font-medium text-slate-900 mb-12">
              Why PropertiesNexus
            </h2>

            <div className="grid grid-cols-3 max-md:grid-cols-1 gap-8 text-left">
              {/* Feature 1 */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mb-5 shadow-sm">
                  🛡️
                </div>
                <h3 className="font-bold text-slate-900 text-[18px] mb-3">
                  Verified Realtors & Developers
                </h3>
                <p className="text-slate-600 text-[13px] leading-relaxed">
                  Every realtor and builder on PropertiesNexus holds a valid license, undergoes identity verification, and adheres to strict standard compliance.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl mb-5 shadow-sm">
                  ⚖️
                </div>
                <h3 className="font-bold text-slate-900 text-[18px] mb-3">
                  Transparent Pricing
                </h3>
                <p className="text-slate-600 text-[13px] leading-relaxed">
                  No hidden fees. All prices, maintenance charges, taxes, and deposit costs are fully disclosed upfront for complete peace of mind.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl mb-5 shadow-sm">
                  🧭
                </div>
                <h3 className="font-bold text-slate-900 text-[18px] mb-3">
                  Guided Process
                </h3>
                <p className="text-slate-600 text-[13px] leading-relaxed">
                  From first viewing to key handover — our certified realtors and property advisors guide you through every step in your preferred language.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Get Notified / Alert Section (Matching Image 4) */}
        <section className="py-[88px] max-md:py-[60px] bg-[#f1f5f9]">
          <div className="max-w-[1000px] w-[calc(100%-48px)] max-md:w-[calc(100%-32px)] mx-auto text-center bg-white p-12 max-md:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
            <p className="text-[#b57b22] font-bold uppercase tracking-[1.6px] text-[11px] mb-2">
              Stay ahead of the market
            </p>
            <h2 className="font-serif text-[36px] max-md:text-[28px] font-medium text-slate-900 mb-3">
              Get notified when new listings go live
            </h2>
            <p className="text-slate-600 text-[14px] max-w-[550px] mx-auto mb-8">
              Enter your email and we’ll alert you when properties matching your exact search criteria are added.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert("Subscribed! We will notify you of new listings."); }} className="flex max-md:flex-col gap-3 max-w-[520px] mx-auto">
              <input
                type="email"
                required
                placeholder="your@email.com"
                className="flex-1 h-12 border border-slate-300 rounded-xl px-4 text-[14px] outline-none focus:border-[#d49a38] focus:ring-2 focus:ring-[#d49a38]/20 bg-slate-50"
              />
              <button
                type="submit"
                className="h-12 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold text-[14px] px-7 rounded-xl transition-colors shrink-0 shadow-sm"
              >
                Notify Me
              </button>
            </form>
          </div>
        </section>

        {/* Discover Areas Section */}
        <section className="py-[89px] max-md:py-[66px]" id="areas">
          <div className="max-w-[1216px] w-[calc(100%-48px)] max-md:w-[calc(100%-32px)] mx-auto grid grid-cols-[1.2fr_1fr] max-md:grid-cols-1 gap-[95px] max-md:gap-[38px] items-center">
            <div>
              <p className="text-[#b57b22] font-bold uppercase tracking-[1.6px] text-[10px] m-0 mb-[13px]">
                Discover your next area
              </p>
              <h2 className="font-serif font-medium text-[clamp(34px,4vw,49px)] tracking-[-1.8px] leading-[1.1] m-0 text-ink">
                Local insight,<br />across <em className="not-italic text-[#bd8125]">India.</em>
              </h2>
              <p className="text-muted text-[15px] leading-[1.75] max-w-[445px] my-[20px] mb-[28px]">
                From familiar city streets to high-potential new neighbourhoods, discover locations with a perspective beyond the pin on the map.
              </p>
              <Link
                href="/properties"
                className="border border-[#aeb7be] px-[16px] py-[12px] font-bold text-[12px] inline-block hover:bg-navy hover:text-white hover:border-navy transition-colors"
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
                { num: "06", name: "Goa" }
              ].map((area) => (
                <Link
                  key={area.num}
                  href={`/properties?query=${encodeURIComponent(area.name)}`}
                  className="flex items-center py-[18px] px-[3px] border-b border-line font-serif text-[24px] text-ink hover:text-gold transition-colors group"
                >
                  <span className="font-sans text-[11px] text-[#bd8125] w-[48px] font-normal">
                    {area.num}
                  </span>
                  {area.name}
                  <b className="ml-auto font-sans text-[17px] text-[#bd8125] font-normal group-hover:translate-x-1 transition-transform">
                    →
                  </b>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* For Partners / Agents Section */}
        <section className="bg-navy text-white py-[88px] max-md:py-[66px]" id="agents">
          <div className="max-w-[1216px] w-[calc(100%-48px)] max-md:w-[calc(100%-32px)] mx-auto grid grid-cols-2 max-md:grid-cols-1 gap-[90px] max-md:gap-[38px] items-center">
            <div className="max-md:order-2">
              <p className="text-[#b57b22] font-bold uppercase tracking-[1.6px] text-[10px] m-0 mb-[13px]">
                For owners, builders & agents
              </p>
              <h2 className="font-serif font-medium text-[clamp(34px,4vw,49px)] tracking-[-1.8px] leading-[1.1] m-0 text-white">
                Your next opportunity,<br />seen by the right people.
              </h2>
              <p className="text-[#c5d1dd] leading-[1.7] max-w-[450px] my-[16px]">
                Bring your property to a discerning national audience with compelling presentation and a team that understands local demand.
              </p>
              <Link
                href="/business-signup"
                className="inline-block mt-[13px] bg-white !text-slate-900 px-[17px] py-[14px] text-[12px] font-bold rounded hover:bg-gray-100 transition-colors"
              >
                Become a PropertiesNexus partner →
              </Link>
            </div>

            <div
              className="h-[390px] max-md:h-[305px] max-md:order-1 bg-cover bg-center rounded-lg"
              style={{
                backgroundImage: `linear-gradient(0deg,rgba(2,16,31,.15),rgba(2,16,31,.02)), url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=86')`
              }}
            />
          </div>
        </section>
      </main>

      {/* Floating Bottom Bar (Matching Image 4) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0f172a]/95 text-white backdrop-blur-md px-5 py-2.5 rounded-full shadow-2xl border border-slate-700/60 flex items-center gap-4 text-[13px] font-semibold">
        <span className="flex items-center gap-1.5 text-amber-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>📌 {properties.length} Active Listings</span>
        </span>
        <span className="w-[1px] h-4 bg-slate-700" />
        <Link href="/properties?view=map" className="hover:text-amber-400 transition-colors flex items-center gap-1">
          🗺️ Map View
        </Link>
        <span className="w-[1px] h-4 bg-slate-700" />
        <Link href="/properties" className="hover:text-amber-400 transition-colors flex items-center gap-1">
          🔍 All Properties
        </Link>
        <span className="w-[1px] h-4 bg-slate-700" />
        <Link href="/properties" className="hover:text-amber-400 transition-colors flex items-center gap-1">
          ⚙️ Filters
        </Link>
      </div>

      <Footer />
    </div>
  );
}
