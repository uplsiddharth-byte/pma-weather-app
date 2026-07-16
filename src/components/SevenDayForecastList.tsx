"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { describeWeatherCode, celsiusToFahrenheit } from "@/lib/weather";
import type { DailyForecastDay, TemperatureUnit } from "@/lib/weather";

export default function SevenDayForecastList({
  days,
  unit,
}: {
  days: DailyForecastDay[];
  unit: TemperatureUnit;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">7-Day Forecast</h2>
      <div className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-white/[0.04] p-2 backdrop-blur-xl">
        {days.map((d, i) => {
          const { label, icon } = describeWeatherCode(d.weatherCode);
          const max = unit === "F" ? celsiusToFahrenheit(d.tempMax) : d.tempMax;
          const min = unit === "F" ? celsiusToFahrenheit(d.tempMin) : d.tempMin;
          const isOpen = expanded === d.date;
          return (
            <motion.div
              key={d.date}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="overflow-hidden rounded-2xl transition-colors hover:bg-white/[0.05]"
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : d.date)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <span className="w-20 text-sm font-medium text-zinc-300">
                  {i === 0 ? "Today" : new Date(d.date).toLocaleDateString(undefined, { weekday: "short" })}
                </span>
                <span className="text-2xl">{icon}</span>
                {d.precipitationProbability != null && d.precipitationProbability > 0 && (
                  <span className="text-xs text-blue-300">{d.precipitationProbability}%</span>
                )}
                <span className="ml-auto flex items-center gap-2 text-sm">
                  <span className="font-semibold">{Math.round(max)}°</span>
                  <span className="text-zinc-500">{Math.round(min)}°</span>
                </span>
                <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="flex flex-wrap gap-4 px-4 pb-4 text-sm text-zinc-400">
                      <span>{label}</span>
                      <span>Precipitation: {d.precipitation} mm</span>
                      {d.uvIndexMax != null && <span>UV Index: {Math.round(d.uvIndexMax)}</span>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
