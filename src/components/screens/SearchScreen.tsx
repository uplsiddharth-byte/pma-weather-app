"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Clock, TrendingUp } from "lucide-react";
import { useSelectedLocation } from "@/lib/app-context";
import type { GeoResult } from "@/lib/weather";

const RECENT_KEY = "weather:recent";
const POPULAR_CITIES = ["New York", "London", "Tokyo", "Paris", "Dubai", "Singapore", "Sydney", "Mumbai"];

type Recent = { name: string; lat: number; lon: number };

function loadRecent(): Recent[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export default function SearchScreen() {
  const router = useRouter();
  const { setLocation } = useSelectedLocation();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [recent, setRecent] = useState<Recent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable client-side, after mount
    setRecent(loadRecent());
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing stale results when the query is cleared
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    const handle = setTimeout(() => {
      fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setResults(data.results);
        })
        .catch((err) => {
          setResults([]);
          setError(err instanceof Error ? err.message : "Search failed");
        })
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(handle);
  }, [query]);

  function choose(name: string, lat: number, lon: number) {
    setLocation({ name, lat, lon });
    const next = [{ name, lat, lon }, ...loadRecent().filter((r) => r.name !== name)].slice(0, 6);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    router.push("/");
  }

  function chooseByName(name: string) {
    fetch(`/api/geocode?q=${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        const [match] = data.results as GeoResult[];
        choose([match.name, match.admin1, match.country].filter(Boolean).join(", "), match.latitude, match.longitude);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Search failed"));
  }

  function useGps() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`/api/reverse-geocode?lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          choose(data.name || "My location", latitude, longitude);
        } catch {
          choose("My location", latitude, longitude);
        }
      },
      () => setError("Could not get your location. Please allow location access.")
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold">Search</h1>

      <div className="relative">
        <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a city, zip code, or landmark..."
          className="w-full rounded-2xl border border-white/10 bg-white/[0.06] py-4 pl-12 pr-4 text-lg outline-none backdrop-blur-xl transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
        />
      </div>

      <button
        type="button"
        onClick={useGps}
        className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 font-medium backdrop-blur-xl transition hover:bg-white/10"
      >
        <MapPin className="h-4 w-4" /> Use current location
      </button>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <AnimatePresence mode="wait">
        {query.trim() ? (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-2">
            {loading && <p className="text-sm text-zinc-500">Searching…</p>}
            {!loading &&
              results.map((r, i) => (
                <motion.button
                  key={`${r.name}-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => choose([r.name, r.admin1, r.country].filter(Boolean).join(", "), r.latitude, r.longitude)}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-left transition hover:bg-white/10"
                >
                  <MapPin className="h-4 w-4 text-zinc-400" />
                  <span>
                    {r.name}
                    {r.admin1 ? `, ${r.admin1}` : ""}, {r.country}
                  </span>
                </motion.button>
              ))}
          </motion.div>
        ) : (
          <motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-8">
            {recent.length > 0 && (
              <div>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-400">
                  <Clock className="h-4 w-4" /> Recent
                </h2>
                <div className="flex flex-wrap gap-2">
                  {recent.map((r) => (
                    <button
                      key={r.name}
                      onClick={() => choose(r.name, r.lat, r.lon)}
                      className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm transition hover:bg-white/10"
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-400">
                <TrendingUp className="h-4 w-4" /> Popular cities
              </h2>
              <div className="flex flex-wrap gap-2">
                {POPULAR_CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => chooseByName(city)}
                    className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm transition hover:bg-white/10"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
