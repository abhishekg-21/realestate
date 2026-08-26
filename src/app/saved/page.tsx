"use client";

import { useEffect, useState } from "react";
import {
    getSavedPropertiesWithDetails,
    SavedPropertyWithDetails,
    SAVED_CHANGE_EVENT,
} from "@/lib/auth-cache";
import PropertyCard from "@/components/property-card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function SavedPropertiesPage() {
    const [properties, setProperties] = useState<SavedPropertyWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        getSavedPropertiesWithDetails()
            .then(setProperties)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
        window.addEventListener(SAVED_CHANGE_EVENT, load);
        return () => window.removeEventListener(SAVED_CHANGE_EVENT, load);
    }, []);

    return (
        <div className="min-h-screen bg-paper text-ink font-sans">
            <Navbar variant="light" />

            <main className="max-w-[1216px] w-[calc(100%-48px)] mx-auto py-[42px] pb-[80px]">
                <h1 className="font-serif font-medium text-[clamp(34px,4vw,49px)] tracking-[-1.8px] leading-[1.1] mb-8">
                    Saved properties
                </h1>

                {loading ? (
                    <div className="grid grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1 gap-[19px]">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="h-[380px] bg-white border border-line rounded-[12px] animate-pulse" />
                        ))}
                    </div>
                ) : properties.length === 0 ? (
                    <div className="bg-white border border-dashed border-line p-[60px_20px] text-center rounded-[12px]">
                        <p className="text-[16px] font-serif font-medium text-ink mb-2">
                            No saved properties yet
                        </p>
                        <p className="text-[14px] text-muted">
                            Click the ♡ on any property to save it here.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1 gap-[19px]">
                        {properties.map((prop) => (
                            <PropertyCard
                                key={prop.property_id}
                                property={{
                                    id: prop.property_id,
                                    title: prop.title,
                                    displayPrice: prop.display_price,
                                    city: prop.city,
                                    area: prop.area,
                                    beds: prop.beds ?? 0,
                                    baths: prop.baths ?? 0,
                                    areaSq: prop.area_sq ?? "",
                                    purpose: prop.purpose ?? "",
                                    image: prop.image ?? "/placeholder.jpg",
                                    images: prop.images,
                                    // ✅ Missing required fields with safe fallbacks:
                                    type: "",
                                    price: 0,
                                    tag: "",
                                    date: "",
                                    description: "",
                                    amenities: [],
                                }}
                            />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}