"use client";

import { Thermometer, Droplets, Wind, Gauge, Sun, Eye, Sunrise, Sunset, Droplet, Activity, Moon } from "lucide-react";
import GlassCard from "./ui/GlassCard";
import { celsiusToFahrenheit } from "@/lib/weather";
import type { CurrentWeather, DailyForecastDay, AirQuality, TemperatureUnit } from "@/lib/weather";

function Stat({
  icon: Icon,
  label,
  value,
  index,
}: {
  icon: typeof Thermometer;
  label: string;
  value: string;
  index: number;
}) {
  return (
    <GlassCard
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="flex flex-col gap-3"
    >
      <Icon className="h-5 w-5 text-zinc-400" aria-hidden />
      <div>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-xs text-zinc-400">{label}</p>
      </div>
    </GlassCard>
  );
}

function formatTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function QuickStatsGrid({
  current,
  today,
  airQuality,
  moon,
  unit,
}: {
  current: CurrentWeather;
  today?: DailyForecastDay;
  airQuality?: AirQuality | null;
  moon?: { name: string; icon: string } | null;
  unit: TemperatureUnit;
}) {
  const feelsLike = unit === "F" ? celsiusToFahrenheit(current.apparentTemperature) : current.apparentTemperature;
  const dewPoint = unit === "F" ? celsiusToFahrenheit(current.dewPoint) : current.dewPoint;

  const stats = [
    { icon: Thermometer, label: "Feels like", value: `${Math.round(feelsLike)}°${unit}` },
    { icon: Droplets, label: "Humidity", value: `${current.humidity}%` },
    { icon: Wind, label: "Wind", value: `${Math.round(current.windSpeed)} km/h` },
    { icon: Gauge, label: "Pressure", value: `${Math.round(current.pressure)} hPa` },
    { icon: Sun, label: "UV Index", value: today?.uvIndexMax != null ? Math.round(today.uvIndexMax).toString() : "—" },
    { icon: Eye, label: "Visibility", value: current.visibility != null ? `${Math.round(current.visibility / 1000)} km` : "—" },
    { icon: Sunrise, label: "Sunrise", value: formatTime(today?.sunrise) },
    { icon: Sunset, label: "Sunset", value: formatTime(today?.sunset) },
    { icon: Droplet, label: "Dew point", value: `${Math.round(dewPoint)}°${unit}` },
    { icon: Activity, label: "Air Quality", value: airQuality ? `${airQuality.usAqi} ${airQuality.category}` : "—" },
    { icon: Moon, label: "Moon Phase", value: moon ? `${moon.icon} ${moon.name}` : "—" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((s, i) => (
        <Stat key={s.label} icon={s.icon} label={s.label} value={s.value} index={i} />
      ))}
    </div>
  );
}
