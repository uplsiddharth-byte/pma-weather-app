"use client";

import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

export default function LocationMap({ lat, lon, label }: { lat: number; lon: number; label: string }) {
  return (
    <MapContainer
      key={`${lat}-${lon}`}
      center={[lat, lon]}
      zoom={10}
      scrollWheelZoom={false}
      className="h-64 w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker center={[lat, lon]} radius={10} pathOptions={{ color: "#2563eb", fillColor: "#3b82f6", fillOpacity: 0.8 }}>
        <Popup>{label}</Popup>
      </CircleMarker>
    </MapContainer>
  );
}
