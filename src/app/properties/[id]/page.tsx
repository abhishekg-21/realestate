"use client";

import { useParams } from "next/navigation";
import PropertyDetailView from "@/components/property-detail-view";

export default function PropertyIdPage() {
  const params = useParams();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : undefined;

  return <PropertyDetailView id={id} />;
}
