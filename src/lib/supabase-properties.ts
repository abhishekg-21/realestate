"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
// import { Property, PROPERTIES as STATIC_PROPERTIES } from "@/lib/properties-data";

/**
 * Formats a numeric price into Indian currency format (e.g., ₹ 8.75 Cr, ₹ 1.45 L)
 */
export function formatDisplayPrice(
  price: number,
  purpose: string,
  period?: string,
): string {
  if (!price || isNaN(price)) return "Price on request";

  let formatted = "";
  if (price >= 10000000) {
    const cr = price / 10000000;
    formatted = `₹ ${cr
      .toFixed(2)
      .replace(/\.00$/, "")
      .replace(/(\.\d)0$/, "$1")} Cr`;
  } else if (price >= 100000) {
    const lac = price / 100000;
    formatted = `₹ ${lac
      .toFixed(2)
      .replace(/\.00$/, "")
      .replace(/(\.\d)0$/, "$1")} L`;
  } else if (price >= 1000) {
    const k = price / 1000;
    formatted = `₹ ${k.toFixed(1).replace(/\.0$/, "")}k`;
  } else {
    formatted = `₹ ${price.toLocaleString("en-IN")}`;
  }

  const pLower = purpose?.toLowerCase() || "";
  if (
    pLower === "rent" ||
    pLower === "lease" ||
    period === "monthly" ||
    period === "per month"
  ) {
    return `${formatted} / mo`;
  }
  return formatted;
}

/**
 * Calculates a human-readable relative date string from an ISO timestamp
 */
export function formatRelativeDate(dateStr?: string): string {
  if (!dateStr) return "Today";
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "1d ago";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}m ago`;
  } catch {
    return "Recently";
  }
}

/**
 * Helper to normalize and capitalize property types and purposes
 */
function capitalize(str?: string): string {
  if (!str) return "";
  const s = str.trim().toLowerCase();
  if (s === "pg" || s === "p.g.") return "PG";
  if (s === "builder_floor" || s === "builder floor") return "Builder floor";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Converts a raw Supabase property row (with optional joined media) into the frontend Property interface
 */
export function transformSupabaseProperty(row: any): Property {
  const priceNum = Number(row.price) || 0;
  const purposeFormatted = capitalize(row.purpose || "buy");
  const typeFormatted = capitalize(
    row.property_type || row.type || "Apartment",
  );

  // Extract images and videos from joined property_media or property_submission_media
  const mediaList: string[] = [];
  if (Array.isArray(row.property_media)) {
    row.property_media.forEach((m: any) => {
      if (m.media_url) mediaList.push(m.media_url);
    });
  }
  if (Array.isArray(row.property_submission_media)) {
    row.property_submission_media.forEach((m: any) => {
      if (m.storage_path) {
        // If it's a storage path, we might need public url, or if it's full url use it
        mediaList.push(m.storage_path);
      }
    });
  }

  // Fallback default image if no media uploaded
  const defaultImg =
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=86";
  const image = mediaList.length > 0 ? mediaList[0] : row.image || defaultImg;
  const images = mediaList.length > 0 ? mediaList : [image, image, image];

  // Amenities list
  let amenities: string[] = [];
  if (Array.isArray(row.amenities)) {
    amenities = row.amenities;
  } else if (typeof row.amenities === "string") {
    try {
      amenities = JSON.parse(row.amenities);
    } catch {
      amenities = row.amenities
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
  }
  if (amenities.length === 0) {
    amenities = [
      "Verified listing",
      "Direct contact",
      "Clear documentation",
      "Prime location",
    ];
  }

  return {
    id: row.id || "unknown",
    title: row.title || "Untitled Property",
    city: row.city || "India",
    area: row.location || row.locality || row.city || "Prime Location",
    type: typeFormatted,
    purpose: purposeFormatted,
    price: priceNum,
    displayPrice: formatDisplayPrice(
      priceNum,
      purposeFormatted,
      row.price_period,
    ),
    beds: Number(row.bedrooms) || 0,
    baths: Number(row.bathrooms) || 0,
    areaSq: row.area_sqft
      ? `${Number(row.area_sqft).toLocaleString("en-IN")} sq ft`
      : "Area on request",
    tag: row.tag || (row.status === "published" ? "Verified" : "Just listed"),
    date: formatRelativeDate(row.created_at),
    image,
    images,
    description:
      row.description ||
      "A well-positioned property offering modern conveniences, clean design, and immediate connection to local infrastructure.",
    amenities,
    providerName: row.contact_name || undefined,
    providerPhone: row.contact_phone || undefined,
    providerRole: "Verified Owner",
  };
}

function isRealProperty(prop: Property): boolean {
  if (!prop.title || !prop.city) return false;
  const title = prop.title.toLowerCase().trim();
  const area = (prop.area || "").toLowerCase().trim();
  const city = (prop.city || "").toLowerCase().trim();

  // Test / fake / placeholder keywords
  const testKeywords = [
    "test",
    "testing",
    "testts",
    "asdf",
    "qwerty",
    "demo",
    "sample",
    "temp",
    "aaa",
    "bbb",
    "ccc",
    "1234",
    "fake",
    "junk",
    "foo",
    "bar",
    "xyz",
    "luxury 3 bhk home",
    "sample property",
    "test property",
    "my property",
    "dummy",
  ];

  for (const kw of testKeywords) {
    if (
      title === kw ||
      title.includes(kw) ||
      area.includes(kw) ||
      city.includes(kw)
    ) {
      return false;
    }
  }

  // Filter out unrealistic bed/bath ratios or dummy submissions (e.g. 10 beds 1 bath)
  if (prop.beds > 8 && prop.baths <= 2) return false;
  if (prop.beds > 12) return false;
  if (prop.price <= 0) return false;

  return true;
}

/**
 * Fetches all live published properties from Supabase and merges them with clean real estate listings.
 */
export async function fetchAllProperties(): Promise<Property[]> {
  try {
    const supabase = createClient();
    const liveProperties: Property[] = [];

    // 1. Fetch approved property submissions
    const { data: approvedSubmissions } = await supabase
      .from("property_submissions")
      .select("*, property_submission_media(*)")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (approvedSubmissions && approvedSubmissions.length > 0) {
      approvedSubmissions.forEach((sub) => {
        const transformed = transformSupabaseProperty(sub);
        if (isRealProperty(transformed)) {
          liveProperties.push(transformed);
        }
      });
    }

    // 2. Fetch published properties (if properties table exists)
    const { data: publishedProperties } = await supabase
      .from("properties")
      .select("*, property_media(*)")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (publishedProperties && publishedProperties.length > 0) {
      publishedProperties.forEach((prop) => {
        const transformed = transformSupabaseProperty(prop);
        if (isRealProperty(transformed)) {
          liveProperties.push(transformed);
        }
      });
    }

    const cleanStatic = STATIC_PROPERTIES.filter(isRealProperty);

    if (liveProperties.length === 0) {
      return cleanStatic;
    }

    // Combine live properties with clean static properties (deduplicating by id and title)
    const existingIds = new Set(liveProperties.map((p) => p.id));
    const existingTitles = new Set(
      liveProperties.map((p) => p.title.toLowerCase().trim()),
    );
    const uniqueStatic = cleanStatic.filter(
      (p) =>
        !existingIds.has(p.id) &&
        !existingTitles.has(p.title.toLowerCase().trim()),
    );

    return [...liveProperties, ...uniqueStatic];
  } catch (e) {
    console.error("Error in fetchAllProperties:", e);
    return STATIC_PROPERTIES.filter(isRealProperty);
  }
}

/**
 * Custom React Hook to load and synchronize properties across the frontend
 */
export function useProperties() {
  const [properties, setProperties] = useState<Property[]>(STATIC_PROPERTIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllProperties();
      setProperties(data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load properties:", err);
      setError(err.message || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  return { properties, loading, error, refetch: loadProperties };
}
