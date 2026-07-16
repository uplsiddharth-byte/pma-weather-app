"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSelectedLocation } from "@/lib/app-context";

const RadarMap = dynamic(() => import("@/components/RadarMap"), { ssr: false });

export default function RadarScreen() {
  const { location } = useSelectedLocation();
  const [radarTileUrl, setRadarTileUrl] = useState<string | null>(null);

  useEffect(() => {
    // RainViewer: free, keyless precipitation radar tiles. https://www.rainviewer.com/api.html
    fetch("https://api.rainviewer.com/public/weather-maps.json")
      .then((r) => r.json())
      .then((data) => {
        const frames = data?.radar?.past;
        const latest = frames?.[frames.length - 1];
        if (latest?.path) {
          setRadarTileUrl(`https://tilecache.rainviewer.com${latest.path}/256/{z}/{x}/{y}/2/1_1.png`);
        }
      })
      .catch(() => setRadarTileUrl(null));
  }, []);

  if (!location) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-zinc-400">Select a location first to view its radar.</p>
        <Link href="/search" className="rounded-2xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700">
          Search for a city
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-4 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold">Radar</h1>
        <p className="text-sm text-zinc-400">
          Live precipitation over {location.name}. Radar tiles by RainViewer, base map by OpenStreetMap.
        </p>
      </div>
      <div className="h-[60vh] min-h-[360px] overflow-hidden rounded-3xl border border-white/10 shadow-lg">
        <RadarMap lat={location.lat} lon={location.lon} label={location.name} radarTileUrl={radarTileUrl} />
      </div>
    </div>
  );
}
