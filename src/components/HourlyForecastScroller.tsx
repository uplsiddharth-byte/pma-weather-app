"use client";

import { motion } from "framer-motion";
import { describeWeatherCode, celsiusToFahrenheit } from "@/lib/weather";
import type { HourlyForecastHour, TemperatureUnit } from "@/lib/weather";

export default function HourlyForecastScroller({
  hours,
  unit,
}: {
  hours: HourlyForecastHour[];
  unit: TemperatureUnit;
}) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Hourly Forecast</h2>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
        {hours.map((h, i) => {
          const temp = unit === "F" ? celsiusToFahrenheit(h.temperature) : h.temperature;
          return (
            <motion.div
              key={h.time}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              whileHover={{ y: -3 }}
              className="flex min-w-[76px] flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-4 backdrop-blur-xl"
            >
              <p className="text-xs text-zinc-400">
                {i === 0 ? "Now" : new Date(h.time).toLocaleTimeString(undefined, { hour: "numeric" })}
              </p>
              <span className="text-2xl">{describeWeatherCode(h.weatherCode, h.isDay).icon}</span>
              <p className="text-sm font-semibold">{Math.round(temp)}°</p>
              {h.precipitationProbability > 0 && (
                <p className="text-[10px] text-blue-300">{h.precipitationProbability}%</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
