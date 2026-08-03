"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { PROPERTIES as STATIC_PROPERTIES, Property } from "@/lib/properties-data";
import { isPropertySaved, toggleSavedPropertyId, SAVED_CHANGE_EVENT } from "@/lib/auth-cache";
import { useProperties } from "@/lib/supabase-properties";

function isVideoUrl(url?: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".mov") ||
    lower.includes("video") ||
    lower.includes("/property-videos/")
  );
}

export default function PropertyDetailView({ id }: { id?: string }) {
  const { properties, loading } = useProperties();

  // Fallback to first property if id is not found or not provided
  const property: Property =
    properties.find((p) => p.id === id) ||
    STATIC_PROPERTIES.find((p) => p.id === id) ||
    properties[0] ||
    STATIC_PROPERTIES[0];

  const [isSaved, setIsSaved] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (property) {
      setIsSaved(isPropertySaved(property.id));
      setMsg(`I would like more information about ${property.title}.`);
    }
    const handleSavedChange = () => {
      if (property) setIsSaved(isPropertySaved(property.id));
    };
    window.addEventListener(SAVED_CHANGE_EVENT, handleSavedChange);
    return () => {
      window.removeEventListener(SAVED_CHANGE_EVENT, handleSavedChange);
    };
  }, [property]);

  if (loading && !property) {
    return (
      <div className="min-h-screen bg-paper text-ink font-sans">
        <Navbar variant="light" />
        <div className="max-w-[1216px] mx-auto py-20 px-6 animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-[460px] bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/2" />
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-32 bg-gray-200 rounded w-full" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images =
    property.images && property.images.length > 0
      ? property.images
      : [property.image, property.image, property.image];

  const openLightbox = (idx: number) => {
    setCurrentImgIdx(idx);
    setModalOpen(true);
  };

  const nextImg = () => {
    setCurrentImgIdx((prev) => (prev + 1) % images.length);
  };

  const prevImg = () => {
    setCurrentImgIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setFeedback("Thank you. An advisor will contact you shortly.");
      setName("");
      setPhone("");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      <Navbar variant="light" />

      {/* Head Bar */}
      <section className="max-w-[1216px] w-[calc(100%-48px)] max-md:w-[calc(100%-32px)] mx-auto py-[25px] pb-[15px] flex justify-between items-center">
        <Link
          href="/properties"
          className="text-[13px] font-bold text-muted hover:text-ink transition-colors flex items-center gap-1"
        >
          ← Back to all properties
        </Link>
        <div className="flex gap-[10px]">
          <button
            onClick={() => openLightbox(0)}
            className="border border-line bg-white rounded-[18px] px-[14px] py-[8px] text-[12px] font-bold cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
          >
            ▤ Media Gallery ({images.length})
          </button>
          <button
            onClick={() => setIsSaved(toggleSavedPropertyId(property.id))}
            className="border border-line bg-white rounded-[18px] px-[14px] py-[8px] text-[12px] font-bold cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
          >
            {isSaved ? "♥ Saved" : "♡ Save"}
          </button>
        </div>
      </section>

      {/* Photo & Video Gallery Grid */}
      <section className="max-w-[1216px] w-[calc(100%-48px)] max-md:w-[calc(100%-32px)] mx-auto grid grid-cols-[1.7fr_1fr] max-md:grid-cols-1 gap-[15px] mb-[40px]">
        <div
          onClick={() => openLightbox(0)}
          className="h-[460px] max-md:h-[280px] rounded-[14px] cursor-pointer hover:opacity-95 transition-opacity overflow-hidden relative bg-[#0e1f33] shadow-md"
        >
          {isVideoUrl(images[0]) ? (
            <>
              <video
                src={images[0]}
                className="w-full h-full object-cover"
                muted
                autoPlay
                loop
                playsInline
              />
              <span className="absolute bottom-4 left-4 bg-black/80 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-1.5 shadow">
                <span className="text-gold">▶</span> WALKTHROUGH VIDEO
              </span>
            </>
          ) : (
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url('${images[0]}')` }}
            />
          )}
        </div>

        <div className="grid grid-rows-2 max-md:grid-rows-1 max-md:grid-cols-2 gap-[15px]">
          <div
            onClick={() => openLightbox(1 % images.length)}
            className="h-full max-md:h-[160px] rounded-[14px] cursor-pointer hover:opacity-95 transition-opacity overflow-hidden relative bg-[#0e1f33] shadow-sm"
          >
            {isVideoUrl(images[1 % images.length]) ? (
              <>
                <video
                  src={images[1 % images.length]}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
                <span className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded">
                  ▶ VIDEO
                </span>
              </>
            ) : (
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url('${images[1 % images.length]}')` }}
              />
            )}
          </div>

          <div
            onClick={() => openLightbox(2 % images.length)}
            className="h-full max-md:h-[160px] rounded-[14px] cursor-pointer hover:opacity-95 transition-opacity overflow-hidden relative bg-[#0e1f33] shadow-sm"
          >
            {isVideoUrl(images[2 % images.length]) ? (
              <video
                src={images[2 % images.length]}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
            ) : (
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url('${images[2 % images.length]}')` }}
              />
            )}
            {images.length > 3 && (
              <div className="absolute inset-0 bg-black/50 rounded-[14px] flex items-center justify-center text-white font-bold text-lg backdrop-blur-[2px]">
                +{images.length - 3} more
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="max-w-[1216px] w-[calc(100%-48px)] max-md:w-[calc(100%-32px)] mx-auto mb-6 border-b border-slate-200">
        <div className="flex gap-8 text-[15px] font-bold">
          <a href="#overview" className="pb-3 border-b-2 border-[#dc2626] text-[#dc2626]">Overview</a>
          <a href="#key-facts" className="pb-3 text-slate-600 hover:text-slate-900 transition-colors">Key Facts</a>
          <a href="#amenities" className="pb-3 text-slate-600 hover:text-slate-900 transition-colors">Amenities</a>
          <a href="#location" className="pb-3 text-slate-600 hover:text-slate-900 transition-colors">Location</a>
          <a href="#costs" className="pb-3 text-slate-600 hover:text-slate-900 transition-colors">Costs</a>
        </div>
      </section>

      {/* Layout Grid */}
      <main className="max-w-[1216px] w-[calc(100%-48px)] max-md:w-[calc(100%-32px)] mx-auto grid grid-cols-[1fr_380px] max-md:grid-cols-1 gap-[50px] pb-[80px]">
        {/* Main Content */}
        <article id="overview">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
              {property.purpose === "Rent" ? "For Rent" : "For Sale"} · {property.type}
            </span>
            {property.tag && (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                {property.tag}
              </span>
            )}
          </div>

          <h1 className="font-serif font-medium text-[clamp(30px,3.5vw,40px)] my-[8px] leading-[1.15] text-slate-900">
            {property.title}
          </h1>
          <p className="text-[15px] text-slate-500 m-0 mb-[18px] flex items-center gap-1">
            📍 {property.area}, {property.city}
          </p>

          <div className="text-[32px] font-bold text-slate-900 mb-[25px]">
            {property.displayPrice}
          </div>

          {/* Key Facts Table (Matching Image 5) */}
          <div className="mb-[40px] bg-slate-50 border border-slate-200/90 rounded-2xl overflow-hidden p-6" id="key-facts">
            <h2 className="font-serif text-[22px] font-medium m-0 mb-[16px] text-slate-900">
              Key Facts
            </h2>
            <div className="grid grid-cols-2 max-md:grid-cols-1 gap-y-3 text-[14px]">
              <div className="flex justify-between py-2 border-b border-slate-200/80 pr-4">
                <span className="text-slate-500 font-medium">Area</span>
                <span className="font-bold text-slate-900">{property.areaSq}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200/80 pl-4 max-md:pl-0">
                <span className="text-slate-500 font-medium">Rooms</span>
                <span className="font-bold text-slate-900">{property.beds ? `${property.beds} BHK` : "Studio"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200/80 pr-4">
                <span className="text-slate-500 font-medium">Bathrooms</span>
                <span className="font-bold text-slate-900">{property.baths || 1}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200/80 pl-4 max-md:pl-0">
                <span className="text-slate-500 font-medium">Loft</span>
                <span className="font-bold text-slate-900">Single floor</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200/80 pr-4">
                <span className="text-slate-500 font-medium">Duplex</span>
                <span className="font-bold text-slate-900">Single floor</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200/80 pl-4 max-md:pl-0">
                <span className="text-slate-500 font-medium">Full Options</span>
                <span className="font-bold text-emerald-600">Yes</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200/80 pr-4">
                <span className="text-slate-500 font-medium">Floor</span>
                <span className="font-bold text-slate-900">Floor 2 of 15</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200/80 pl-4 max-md:pl-0">
                <span className="text-slate-500 font-medium">Move-in Status</span>
                <span className="font-bold text-slate-900">Vacant / Ready</span>
              </div>
            </div>
          </div>

          <div className="mb-[40px]">
            <h2 className="font-serif text-[24px] font-medium m-0 mb-[14px] text-slate-900">
              About this property
            </h2>
            <p className="text-[15px] leading-[1.8] text-slate-600 m-0 whitespace-pre-line">
              {property.description}
            </p>
          </div>

          <div className="mb-[40px]" id="amenities">
            <h2 className="font-serif text-[24px] font-medium m-0 mb-[16px] text-slate-900">
              Amenities & Highlights
            </h2>
            <ul className="m-0 p-0 list-none grid grid-cols-2 max-md:grid-cols-1 gap-[12px]">
              {property.amenities.map((amenity, idx) => (
                <li key={idx} className="text-[14px] text-slate-800 font-medium flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-emerald-600 font-bold">✓</span> {amenity}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-[40px]" id="location">
            <h2 className="font-serif text-[24px] font-medium m-0 mb-[14px] text-slate-900">
              Location & Neighborhood
            </h2>
            <p className="text-[15px] leading-[1.8] text-slate-600 m-0">
              Located at {property.area}, {property.city}. This address is situated close to major business centers, transport links, top educational institutes, and premium lifestyle hubs.
            </p>
          </div>
        </article>

        {/* Agency / Provider Sidebar Card (Matching Image 5) */}
        <aside id="costs">
          <div className="bg-white border border-slate-200 p-[24px] rounded-2xl sticky top-[95px] shadow-sm">
            {/* Provider Info Header */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
              <img
                src={(property as any).providerAvatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80"}
                alt="Mindset Real Estate"
                className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-[16px] text-slate-900 m-0">
                    {(property as any).providerName || "Mindset Real Estate"}
                  </h3>
                  <span className="text-blue-500 font-bold text-sm" title="Verified Agency">✔</span>
                </div>
                <p className="text-[12px] text-slate-500 m-0 mt-0.5">
                  {(property as any).providerRole || "Verified Realtor & Agency"}
                </p>
              </div>
            </div>

            {/* Provider Stats */}
            <div className="grid grid-cols-2 gap-2 text-[12px] text-slate-600 mb-4 pb-4 border-b border-slate-100">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="block font-bold text-slate-900 text-[14px]">40+ listings</span>
                <span className="text-[11px] text-slate-500">Active Properties</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="block font-bold text-slate-900 text-[14px]">7+ yrs</span>
                <span className="text-[11px] text-slate-500">Market Experience</span>
              </div>
            </div>

            <p className="text-[12px] text-slate-600 leading-relaxed mb-4">
              Hello, we are representatives of verified real estate agency services in {property.city}. We specialize in luxury residential and commercial properties.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Send a message
              </span>

              <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] font-semibold text-slate-700 border border-slate-200/80">
                INQUIRING ABOUT:<br />
                <span className="text-slate-900 font-bold truncate block">{property.title}</span>
              </div>

              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="border border-slate-200 p-3 rounded-xl text-[13px] outline-none bg-slate-50 focus:bg-white focus:border-[#d49a38] transition-all"
              />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="border border-slate-200 p-3 rounded-xl text-[13px] outline-none bg-slate-50 focus:bg-white focus:border-[#d49a38] transition-all"
              />
              <textarea
                rows={3}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                className="border border-slate-200 p-3 rounded-xl text-[13px] outline-none bg-slate-50 focus:bg-white focus:border-[#d49a38] resize-none transition-all"
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white p-3.5 rounded-xl font-bold text-[13px] cursor-pointer transition-colors shadow-sm disabled:opacity-60"
              >
                {submitting ? "Sending message..." : "Send Message"}
              </button>

              {feedback && (
                <p className="text-[12px] text-emerald-600 font-semibold text-center mt-1" aria-live="polite">
                  {feedback}
                </p>
              )}
            </form>

            <a
              className="block text-center mt-4 text-[12px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
              href="https://wa.me/919136331992"
              target="_blank"
              rel="noopener noreferrer"
            >
              💬 Chat directly on WhatsApp →
            </a>
          </div>
        </aside>
      </main>

      {/* Lightbox Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-[rgba(2,15,30,0.92)] z-50 flex items-center justify-center p-[20px] backdrop-blur-sm">
          <div className="relative max-w-[1000px] w-full text-center">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute -top-[45px] right-0 bg-transparent border-0 text-white text-[28px] cursor-pointer font-bold hover:opacity-75 transition-opacity"
            >
              ✕
            </button>
            {isVideoUrl(images[currentImgIdx]) ? (
              <video
                src={images[currentImgIdx]}
                controls
                autoPlay
                className="max-h-[80vh] max-w-full rounded-[12px] shadow-[0_25px_50px_rgba(0,0,0,0.5)] inline-block bg-black"
              />
            ) : (
              <img
                src={images[currentImgIdx]}
                alt={property.title}
                className="max-h-[80vh] max-w-full rounded-[12px] shadow-[0_25px_50px_rgba(0,0,0,0.5)] inline-block"
              />
            )}
            <div className="flex justify-center items-center gap-[20px] mt-[18px] text-white font-bold text-[14px]">
              <button
                onClick={prevImg}
                className="bg-white/20 hover:bg-white/30 border-0 text-white px-[18px] py-[8px] rounded-[20px] cursor-pointer transition-colors shadow"
              >
                ← Prev
              </button>
              <span className="tracking-widest text-xs uppercase bg-black/40 px-3 py-1 rounded-full">
                {currentImgIdx + 1} / {images.length}
              </span>
              <button
                onClick={nextImg}
                className="bg-white/20 hover:bg-white/30 border-0 text-white px-[18px] py-[8px] rounded-[20px] cursor-pointer transition-colors shadow"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
