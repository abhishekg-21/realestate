"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import PropertyDetailView from "@/components/property-detail-view";

function PropertyQueryContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || undefined;

  return <PropertyDetailView id={id} />;
}

export default function PropertyQueryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper flex items-center justify-center font-serif text-xl">Loading property details...</div>}>
      <PropertyQueryContent />
    </Suspense>
  );
}
