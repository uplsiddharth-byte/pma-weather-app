"use client";

import { weatherGradient, weatherMood } from "@/lib/weather";

// Deterministic pseudo-random spread so server and client render the same
// markup (Math.random() would cause a hydration mismatch).
function spread(i: number, mod: number) {
  return ((i * 47) % mod) + (i % 7);
}

function Stars({ count = 40 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="animate-twinkle absolute h-[2px] w-[2px] rounded-full bg-white"
          style={{
            left: `${spread(i, 100)}%`,
            top: `${spread(i * 3, 70)}%`,
            animationDelay: `${(i % 10) * 0.3}s`,
          }}
        />
      ))}
    </>
  );
}

function Clouds({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`absolute rounded-full bg-white/10 blur-3xl ${i % 2 === 0 ? "animate-float-slow" : "animate-float-medium"}`}
          style={{
            width: `${180 + (i % 3) * 60}px`,
            height: `${100 + (i % 3) * 40}px`,
            left: `${spread(i, 90)}%`,
            top: `${spread(i * 5, 60)}%`,
          }}
        />
      ))}
    </>
  );
}

function Rain({ count = 28 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="animate-rain-fall absolute top-0 w-px bg-gradient-to-b from-transparent via-sky-200/60 to-transparent"
          style={{
            left: `${spread(i, 100)}%`,
            height: `${40 + (i % 5) * 10}px`,
            animationDuration: `${0.6 + (i % 5) * 0.15}s`,
            animationDelay: `${(i % 10) * 0.2}s`,
          }}
        />
      ))}
    </>
  );
}

function Snow({ count = 24 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="animate-snow-fall absolute top-0 h-1.5 w-1.5 rounded-full bg-white/80"
          style={{
            left: `${spread(i, 100)}%`,
            animationDuration: `${4 + (i % 6)}s`,
            animationDelay: `${(i % 10) * 0.4}s`,
          }}
        />
      ))}
    </>
  );
}

export default function WeatherBackground({ code, isDay }: { code: number; isDay: boolean }) {
  const mood = weatherMood(code);
  const gradient = weatherGradient(code, isDay);

  return (
    <div
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br ${gradient} animate-gradient-move opacity-90 dark:opacity-70`}
    >
      {mood === "clear" && isDay && (
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-yellow-200/40 blur-[100px]" />
      )}
      {mood === "clear" && !isDay && <Stars />}
      {mood === "cloudy" && <Clouds />}
      {mood === "fog" && <Clouds count={6} />}
      {(mood === "rain" || mood === "storm") && (
        <>
          <Clouds count={3} />
          <Rain />
        </>
      )}
      {mood === "storm" && <div className="animate-lightning absolute inset-0 bg-white" />}
      {mood === "snow" && (
        <>
          <Clouds count={2} />
          <Snow />
        </>
      )}
    </div>
  );
}
