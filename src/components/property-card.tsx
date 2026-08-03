"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Property } from "@/lib/properties-data";
import { isPropertySaved, toggleSavedPropertyId, SAVED_CHANGE_EVENT } from "@/lib/auth-cache";

export default function PropertyCard({ property }: { property: Property }) {
  const [isSaved, setIsSaved] = useState(false);

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

  return (
    <article className="border border-line bg-white transition-all duration-180 hover:-translate-y-[3px] hover:shadow-[0_12px_25px_rgba(13,34,52,0.1)] flex flex-col group relative">
      <Link
        href={`/properties/${property.id}`}
        className="h-[200px] max-md:min-h-[175px] bg-center bg-cover relative block overflow-hidden"
        style={{
          backgroundImage: `url('${property.image}')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(2,18,35,0.4)] via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
        {property.tag && (
          <span className="absolute z-10 top-[12px] left-[12px] rounded-[14px] bg-[rgba(5,23,40,0.75)] text-white text-[9px] font-bold px-[8px] py-[5px] uppercase tracking-wider backdrop-blur-xs">
            {property.tag}
          </span>
        )}
      </Link>
      
      <button
        onClick={handleSaveToggle}
        aria-label={`Save ${property.title}`}
        title={isSaved ? "Remove from saved spaces" : "Save space"}
        className={`absolute z-20 right-[11px] top-[10px] border-0 rounded-full w-[32px] h-[32px] cursor-pointer flex items-center justify-center shadow-md transition-all duration-150 ${
          isSaved
            ? "bg-[#e86a58] text-white scale-105"
            : "bg-white/90 text-ink hover:bg-white hover:scale-110"
        }`}
      >
        <span className="text-[15px] leading-none mt-[-1px]">{isSaved ? "♥" : "♡"}</span>
      </button>

      <Link
        href={`/properties/${property.id}`}
        className="p-[15px] max-md:p-[14px] flex flex-col flex-1"
      >
        <span className="text-green text-[10px] font-bold uppercase tracking-wider">
          {property.purpose} · {property.type}
        </span>
        <div className="text-[18px] font-bold my-[5px] text-ink">
          {property.displayPrice}
        </div>
        <h2 className="font-serif font-medium text-[20px] max-md:text-[18px] leading-[1.2] m-0 mb-[7px] text-ink group-hover:text-gold transition-colors">
          {property.title}
        </h2>
        <span className="text-[11px] text-muted truncate">
          {property.area}, {property.city}
        </span>
        <div className="border-t border-[#edf0f1] mt-[13px] pt-[10px] flex justify-between text-[10px] text-[#61707d] mt-auto">
          <span>
            {property.beds ? `${property.beds} Bed · ` : ""}
            {property.baths ? `${property.baths} Bath` : ""}
          </span>
          <span className="font-medium">{property.areaSq}</span>
        </div>
      </Link>
    </article>
  );
}
