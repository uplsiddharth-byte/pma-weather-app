"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

export default function RadarMap({
  lat,
  lon,
  label,
  radarTileUrl,
}: {
  lat: number;
  lon: number;
  label: string;
  radarTileUrl: string | null;
}) {
  return (
    <MapContainer key={`${lat}-${lon}`} center={[lat, lon]} zoom={7} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {radarTileUrl && <TileLayer url={radarTileUrl} opacity={0.6} attribution="Radar &copy; RainViewer" />}
      <CircleMarker center={[lat, lon]} radius={8} pathOptions={{ color: "#2563eb", fillColor: "#3b82f6", fillOpacity: 0.8 }}>
        <Popup>{label}</Popup>
      </CircleMarker>
    </MapContainer>
  );
}
