"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Property } from "@/lib/properties-data";
import { isPropertySaved, toggleSavedPropertyId, SAVED_CHANGE_EVENT, toggleSavedPropertyIdDB } from "@/lib/auth-cache";
import { Heart } from "lucide-react";

export default function PropertyCard({ property }: { property: Property }) {
  const [isSaved, setIsSaved] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const images = property.images && property.images.length > 0
    ? property.images
    : [property.image];

  useEffect(() => {
    setIsSaved(isPropertySaved(property.id));
    const handleSavedChange = () => {
      setIsSaved(isPropertySaved(property.id));
    };
    window.addEventListener(SAVED_CHANGE_EVENT, handleSavedChange);
    return () => {
      window.removeEventListener(SAVED_CHANGE_EVENT, handleSavedChange);
    };
  }, [property.id]);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = toggleSavedPropertyId(property.id);
    setIsSaved(nextState);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const providerName = (property as any).providerName || "PropertiesNexus User";
  const providerRole = (property as any).providerRole || "Property Owner";
  const providerAvatar = (property as any).providerAvatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&q=80";

  return (
    <article className="border border-[#e2e8f0] bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl flex flex-col group relative">
      {/* Image Carousel Container */}
      <div className="h-[210px] max-md:h-[180px] relative block overflow-hidden bg-slate-900">
        <Link href={`/properties/${property.id}`} className="block w-full h-full">
          <img
            src={images[activeImgIndex]}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
        </Link>

        {/* Top Badges */}
        <div className="absolute z-10 top-3 left-3 flex gap-1.5 flex-wrap">
          {property.purpose && (
            <span className="rounded-md bg-[#2563eb] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow-sm">
              {property.purpose === "Rent" ? "For Rent" : "For Sale"}
            </span>
          )}
          {property.tag && (
            <span className="rounded-md bg-amber-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow-sm">
              {property.tag}
            </span>
          )}
        </div>

        {/* Carousel Arrow Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all z-20"
            >
              ‹
            </button>
            <button
              onClick={nextImage}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all z-20"
            >
              ›
            </button>
            <div className="absolute bottom-2.5 right-3 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full z-10">
              {activeImgIndex + 1}/{images.length}
            </div>
          </>
        )}

        {/* Save/Favorite Heart Button */}
        <button
          onClick={async () => {
            await toggleSavedPropertyIdDB(property.id);
          }}
          aria-label={isSaved ? "Remove from saved properties" : "Save property"}
          className={`flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md transition-all duration-200 cursor-pointer hover:scale-110 ${isSaved ? "text-red-500" : "text-gray-700"
            }`}
        >
          <Heart
            size={20}
            strokeWidth={2}
            className={isSaved ? "fill-red-500" : ""}
          />
        </button>
      </div>

      {/* Property Details Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="text-[20px] font-bold text-slate-900 tracking-tight">
          {property.displayPrice}
        </div>

        <Link href={`/properties/${property.id}`} className="group-hover:text-[#d49a38] transition-colors">
          <h2 className="font-semibold text-[16px] leading-snug my-1 text-slate-900 line-clamp-1">
            {property.title}
          </h2>
        </Link>

        <p className="text-[12px] text-slate-500 truncate mb-3">
          📍 {property.area}, {property.city}
        </p>

        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600 mb-4 pb-3 border-b border-slate-100">
          <span>{property.beds ? `${property.beds} Beds` : "Studio"}</span>
          <span>•</span>
          <span>{property.baths ? `${property.baths} Baths` : "1 Bath"}</span>
          <span>•</span>
          <span className="truncate">{property.areaSq}</span>
        </div>

        {/* Provider / Agency Chip Bar (Matching Image 2) */}
        <Link
          href={`/properties/${property.id}`}
          className="mt-auto pt-1 flex items-center justify-between group/provider hover:bg-slate-50 p-1.5 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 bg-slate-200 border border-slate-300">
              <img src={providerAvatar} alt={providerName} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[12px] font-semibold text-slate-800 truncate group-hover/provider:text-[#d49a38]">
                  {providerName}
                </span>
                <span className="text-blue-500 text-[11px]" title="Verified Realtor">✔</span>
              </div>
              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.2 rounded inline-block">
                {providerRole}
              </span>
            </div>
          </div>
          <span className="text-slate-400 text-sm font-bold group-hover/provider:translate-x-0.5 transition-transform">
            ›
          </span>
        </Link>
      </div>
    </article>
  );
}

