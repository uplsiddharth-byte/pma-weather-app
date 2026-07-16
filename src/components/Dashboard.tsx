"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { describeWeatherCode } from "@/lib/weather";
import type { CurrentWeather, DailyForecastDay } from "@/lib/weather";

const LocationMap = dynamic(() => import("./LocationMap"), { ssr: false });

type Resolved = { name: string; lat: number; lon: number };

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolved, setResolved] = useState<Resolved | null>(null);
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<DailyForecastDay[]>([]);

  async function loadWeatherFor(name: string, lat: number, lon: number) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch weather");
      setResolved({ name, lat, lon });
      setCurrent(data.current);
      setForecast(data.forecast);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setCurrent(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Location not found");
      const [match] = data.results;
      const name = [match.name, match.admin1, match.country].filter(Boolean).join(", ");
      await loadWeatherFor(name, match.latitude, match.longitude);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setError(null);
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`/api/reverse-geocode?lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          await loadWeatherFor(data.name || "My location", latitude, longitude);
        } catch {
          await loadWeatherFor("My location", latitude, longitude);
        }
      },
      () => {
        setError("Could not get your location. Please allow location access or search manually.");
        setLoading(false);
      }
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="City, zip code, landmark, coordinates..."
          className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={loading}
            className="rounded-lg border border-zinc-300 px-4 py-2 font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            📍 My location
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {loading && <p className="text-zinc-500">Loading weather…</p>}

      {current && resolved && !loading && (
        <>
          <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
            <h2 className="text-lg font-semibold">{resolved.name}</h2>
            <div className="mt-2 flex items-center gap-4">
              <span className="text-5xl">{describeWeatherCode(current.weatherCode).icon}</span>
              <div>
                <p className="text-4xl font-bold">{Math.round(current.temperature)}°C</p>
                <p className="text-zinc-500">{describeWeatherCode(current.weatherCode).label}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-zinc-600 dark:text-zinc-400">
              <div>Feels like {Math.round(current.apparentTemperature)}°C</div>
              <div>Humidity {current.humidity}%</div>
              <div>Wind {Math.round(current.windSpeed)} km/h</div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">5-Day Forecast</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {forecast.map((day) => (
                <div key={day.date} className="rounded-lg border border-zinc-200 p-3 text-center dark:border-zinc-800">
                  <p className="text-sm text-zinc-500">
                    {new Date(day.date).toLocaleDateString(undefined, { weekday: "short" })}
                  </p>
                  <p className="text-2xl">{describeWeatherCode(day.weatherCode).icon}</p>
                  <p className="text-sm font-medium">
                    {Math.round(day.tempMax)}° / {Math.round(day.tempMin)}°
                  </p>
                </div>
              ))}
            </div>
          </div>

          <LocationMap lat={resolved.lat} lon={resolved.lon} label={resolved.name} />
        </>
      )}
    </div>
  );
}
