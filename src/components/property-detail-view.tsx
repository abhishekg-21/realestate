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

      {/* Layout Grid */}
      <main className="max-w-[1216px] w-[calc(100%-48px)] max-md:w-[calc(100%-32px)] mx-auto grid grid-cols-[1fr_360px] max-md:grid-cols-1 gap-[65px] max-md:gap-[38px] pb-[80px]">
        {/* Main Content */}
        <article>
          <span className="text-[12px] font-bold text-green uppercase tracking-[1px]">
            {property.purpose} · {property.type}
          </span>
          <h1 className="font-serif font-medium text-[clamp(32px,4vw,42px)] my-[10px] mb-[6px] leading-[1.1] text-ink">
            {property.title}
          </h1>
          <p className="text-[16px] text-muted m-0 mb-[20px]">
            {property.area}, {property.city}
          </p>
          <div className="text-[28px] font-bold text-ink mb-[25px]">
            {property.displayPrice}
          </div>

          <div className="flex flex-wrap gap-[20px] border-t border-b border-line py-[18px] mb-[35px] text-[13px] font-bold text-[#4c5b6a]">
            {property.beds ? <span>{property.beds} Bedrooms</span> : null}
            {property.baths ? <span>{property.baths} Bathrooms</span> : null}
            <span>{property.areaSq}</span>
          </div>

          <div className="mb-[40px]">
            <h2 className="font-serif text-[24px] font-medium m-0 mb-[16px] text-ink">
              About this home
            </h2>
            <p className="text-[15px] leading-[1.75] text-muted m-0 whitespace-pre-line">
              {property.description}
            </p>
          </div>

          <div className="mb-[40px]">
            <h2 className="font-serif text-[24px] font-medium m-0 mb-[16px] text-ink">
              Highlights & Amenities
            </h2>
            <ul className="m-0 p-0 list-none grid grid-cols-2 max-md:grid-cols-1 gap-[12px]">
              {property.amenities.map((amenity, idx) => (
                <li key={idx} className="text-[14px] text-ink font-semibold flex items-center gap-2">
                  <span className="text-green font-bold">✓</span> {amenity}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-[40px]">
            <h2 className="font-serif text-[24px] font-medium m-0 mb-[16px] text-ink">
              Location & setting
            </h2>
            <p className="text-[15px] leading-[1.75] text-muted m-0">
              Situated in {property.area} within {property.city}, this address offers immediate access to primary transport corridors, business hubs, and established local amenities while maintaining a quiet, private residential environment.
            </p>
          </div>
        </article>

        {/* Advisor Sidebar */}
        <aside>
          <div className="bg-white border border-line p-[28px] rounded-[14px] sticky top-[95px] shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[1px] text-gold m-0 mb-[10px]">
              Speak with an advisor
            </p>
            <h3 className="font-serif text-[20px] font-medium m-0 mb-[22px] leading-[1.35] text-ink">
              We can arrange a private viewing or share floor plans & videos.
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
              <label className="flex flex-col gap-[6px] text-[12px] font-bold text-ink">
                Your full name
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="border border-line p-[10px_12px] rounded-[8px] text-[13px] outline-0 font-normal bg-white text-ink focus:border-gold"
                />
              </label>
              <label className="flex flex-col gap-[6px] text-[12px] font-bold text-ink">
                Phone number
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="border border-line p-[10px_12px] rounded-[8px] text-[13px] outline-0 font-normal bg-white text-ink focus:border-gold"
                />
              </label>
              <label className="flex flex-col gap-[6px] text-[12px] font-bold text-ink">
                Message
                <textarea
                  rows={3}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  className="border border-line p-[10px_12px] rounded-[8px] text-[13px] outline-0 font-normal bg-white text-ink resize-none focus:border-gold"
                />
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-navy hover:bg-navy2 text-white border-0 p-[13px] rounded-[8px] font-bold cursor-pointer transition-colors mt-[5px] shadow-sm"
              >
                {submitting ? "Sending..." : "Request call back"}
              </button>
              {feedback && (
                <p className="text-[12px] text-green mt-[12px] font-semibold" aria-live="polite">
                  {feedback}
                </p>
              )}
            </form>
            <a
              className="block text-center mt-[15px] text-[12px] font-bold text-green hover:opacity-80 transition-opacity"
              href="https://wa.me/919136331992"
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat on WhatsApp →
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
