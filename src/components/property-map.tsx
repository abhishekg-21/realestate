"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon issue with Next.js/Webpack
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

// A component to automatically zoom and center the map on new coordinates
function MapEffect({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 14);
  }, [coords, map]);
  return null;
}

export default function PropertyMap({
  address,
  city,
  title,
}: {
  address: string;
  city: string;
  title: string;
}) {
  const [coords, setCoords] = useState<[number, number]>([19.076, 72.8777]);

  useEffect(() => {
    const fetchCoords = async () => {
      try {
        const query = encodeURIComponent(`${address}, ${city}`);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
          setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          // fallback to city level
          const resCity = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`);
          const dataCity = await resCity.json();
          if (dataCity && dataCity.length > 0) {
            setCoords([parseFloat(dataCity[0].lat), parseFloat(dataCity[0].lon)]);
          }
        }
      } catch (err) {
        console.error("Geocoding failed", err);
      }
    };
    if (address && city) {
      fetchCoords();
    }
  }, [address, city]);

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-sm relative z-0 border border-slate-200">
      <MapContainer
        center={coords}
        zoom={14}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapEffect coords={coords} />
        <Marker position={coords} icon={icon}>
          <Popup>
            <strong>{title}</strong>
            <br />
            {address}, {city}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
