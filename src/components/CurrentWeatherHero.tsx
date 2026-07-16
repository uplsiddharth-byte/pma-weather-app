"use client";

import { motion } from "framer-motion";
import { describeWeatherCode, celsiusToFahrenheit } from "@/lib/weather";
import type { CurrentWeather, TemperatureUnit } from "@/lib/weather";
import AnimatedNumber from "./AnimatedNumber";

export default function CurrentWeatherHero({
  name,
  current,
  unit,
}: {
  name: string;
  current: CurrentWeather;
  unit: TemperatureUnit;
}) {
  const { label, icon } = describeWeatherCode(current.weatherCode, current.isDay);
  const displayTemp = unit === "F" ? celsiusToFahrenheit(current.temperature) : current.temperature;
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-2 py-10 text-center"
    >
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{name}</h1>
      <p className="text-sm text-zinc-400">{today}</p>

      <span className="animate-float-slow my-4 text-8xl drop-shadow-2xl sm:text-9xl">{icon}</span>

      <div className="flex items-start text-7xl font-bold tracking-tight sm:text-8xl">
        <AnimatedNumber value={displayTemp} />
        <span className="mt-2 text-3xl font-medium text-zinc-400">°{unit}</span>
      </div>
      <p className="text-lg text-zinc-300">{label}</p>
    </motion.div>
  );
}
