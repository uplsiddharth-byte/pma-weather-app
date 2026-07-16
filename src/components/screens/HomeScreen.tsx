"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { MapPin, Search } from "lucide-react";
import { useSelectedLocation, useUnits } from "@/lib/app-context";
import { moonPhase } from "@/lib/weather";
import type { CurrentWeather, DailyForecastDay, HourlyForecastHour, AirQuality } from "@/lib/weather";
import WeatherBackground from "@/components/WeatherBackground";
import CurrentWeatherHero from "@/components/CurrentWeatherHero";
import QuickStatsGrid from "@/components/QuickStatsGrid";
import HourlyForecastScroller from "@/components/HourlyForecastScroller";
import SevenDayForecastList from "@/components/SevenDayForecastList";
import Skeleton from "@/components/ui/Skeleton";

const LocationMap = dynamic(() => import("@/components/LocationMap"), { ssr: false });

export default function HomeScreen() {
  const { location, setLocation } = useSelectedLocation();
  const { unit } = useUnits();

  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<DailyForecastDay[]>([]);
  const [hourly, setHourly] = useState<HourlyForecastHour[]>([]);
  const [airQuality, setAirQuality] = useState<AirQuality | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!location) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicking off a new fetch whenever the selected location changes
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/weather?lat=${location.lat}&lon=${location.lon}`).then((r) => r.json()),
      fetch(`/api/air-quality?lat=${location.lat}&lon=${location.lon}`).then((r) => r.json()),
    ])
      .then(([weatherData, aqData]) => {
        if (cancelled) return;
        if (weatherData.error) throw new Error(weatherData.error);
        setCurrent(weatherData.current);
        setForecast(weatherData.forecast);
        setHourly(weatherData.hourly);
        setAirQuality(aqData.error ? null : aqData);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load weather");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [location]);

  function useMyLocation() {
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
          setLocation({ name: data.name || "My location", lat: latitude, lon: longitude });
        } catch {
          setLocation({ name: "My location", lat: latitude, lon: longitude });
        }
      },
      () => setError("Could not get your location. Please allow location access or search manually.")
    );
  }

  if (!location) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <span className="animate-float-slow text-7xl">☁️</span>
        <div>
          <h1 className="text-2xl font-semibold">Discover the weather anywhere</h1>
          <p className="mt-2 text-zinc-400">Search for a city or use your current location to get started.</p>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-3">
          <Link
            href="/search"
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            <Search className="h-4 w-4" /> Search
          </Link>
          <button
            type="button"
            onClick={useMyLocation}
            className="flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-3 font-medium transition hover:bg-white/10"
          >
            <MapPin className="h-4 w-4" /> Use my location
          </button>
        </div>
      </div>
    );
  }

  const today = forecast[0];
  const moon = moonPhase(new Date());

  return (
    <div className="relative min-h-full">
      {current && <WeatherBackground code={current.weatherCode} isDay={current.isDay} />}

      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6">
        <div className="flex justify-end">
          <Link
            href="/search"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-zinc-300 backdrop-blur-xl transition hover:bg-white/10"
          >
            <Search className="h-4 w-4" /> Change city
          </Link>
        </div>

        {error && (
          <div className="animate-fade-in-up rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-red-300">
            {error}
          </div>
        )}

        {loading || !current ? (
          <div className="flex flex-col gap-8">
            <Skeleton className="mx-auto h-64 w-full max-w-sm" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <motion.div initial="hidden" animate="visible" className="flex flex-col gap-10">
            <CurrentWeatherHero name={location.name} current={current} unit={unit} />
            <QuickStatsGrid current={current} today={today} airQuality={airQuality} moon={moon} unit={unit} />
            <HourlyForecastScroller hours={hourly} unit={unit} />
            <SevenDayForecastList days={forecast} unit={unit} />
            <div className="overflow-hidden rounded-3xl shadow-lg">
              <LocationMap lat={location.lat} lon={location.lon} label={location.name} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
