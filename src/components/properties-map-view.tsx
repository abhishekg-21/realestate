"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Property } from "@/lib/properties-data";
import Link from "next/link";
import PropertyCard from "./property-card";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

// Calculate hash to slightly offset pins in same city
function getOffset(index: number) {
  const seed = index * 10;
  return (Math.sin(seed) * 0.05);
}

const CITY_COORDS: Record<string, [number, number]> = {
  "Mumbai": [19.0760, 72.8777],
  "Pune": [18.5204, 73.8567],
  "Delhi NCR": [28.7041, 77.1025],
  "Bengaluru": [12.9716, 77.5946],
  "Hyderabad": [17.3850, 78.4867],
  "Goa": [15.2993, 74.1240],
  "Nashik": [19.9975, 73.7898],
  "Chennai": [13.0827, 80.2707],
};

function MapBounds({ properties }: { properties: Property[] }) {
  const map = useMap();
  useEffect(() => {
    if (properties.length > 0) {
      const getCoords = (city: string) => {
        const found = Object.entries(CITY_COORDS).find(([k]) => k.toLowerCase() === (city || "").toLowerCase());
        return found ? found[1] : [19.076, 72.8777];
      };
      
      const lats = properties.map((p, i) => getCoords(p.city)[0] + getOffset(i));
      const lngs = properties.map((p, i) => getCoords(p.city)[1] + getOffset(i + 1));
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      if (minLat === maxLat && minLng === maxLng) {
        map.setView([minLat, minLng], 12);
      } else {
        map.fitBounds([
          [minLat, minLng],
          [maxLat, maxLng]
        ], { padding: [50, 50] });
      }
    }
  }, [properties, map]);
  
  return null;
}

export default function PropertiesMapView({ properties }: { properties: Property[] }) {
  const defaultCenter: [number, number] = [19.076, 72.8777]; // Mumbai
  
  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden shadow-sm relative z-0 border border-slate-200">
      <MapContainer
        center={defaultCenter}
        zoom={10}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapBounds properties={properties} />
        {properties.map((p, i) => {
          const found = Object.entries(CITY_COORDS).find(([k]) => k.toLowerCase() === (p.city || "").toLowerCase());
          const coords = found ? found[1] : defaultCenter;
          const lat = coords[0] + getOffset(i);
          const lng = coords[1] + getOffset(i + 1);
          
          return (
            <Marker key={p.id} position={[lat, lng]} icon={icon}>
              <Popup className="w-[280px]">
                <div className="font-sans">
                  <div className="h-[120px] mb-2 rounded overflow-hidden">
                    <img src={p.image} className="w-full h-full object-cover" alt={p.title} />
                  </div>
                  <strong className="block text-[13px] leading-tight mb-1">{p.title}</strong>
                  <div className="text-gold font-bold mb-1">{p.displayPrice}</div>
                  <div className="text-[11px] text-slate-500 mb-2">{p.beds ? `${p.beds} Beds • ` : ""}{p.area}, {p.city}</div>
                  <a href={`/properties/${p.id}`} className="block w-full text-center bg-navy !text-white text-[12px] py-1.5 rounded-lg hover:bg-navy2">
                    View Details
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
