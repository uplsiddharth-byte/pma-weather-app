"use client";

import { useUnits } from "@/lib/app-context";
import ThemeToggle from "@/components/ThemeToggle";
import GlassCard from "@/components/ui/GlassCard";

export default function SettingsScreen() {
  const { unit, setUnit } = useUnits();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <GlassCard hover={false} className="flex items-center justify-between">
        <div>
          <p className="font-medium">Temperature Units</p>
          <p className="text-sm text-zinc-400">Choose Celsius or Fahrenheit</p>
        </div>
        <div className="inline-flex gap-1 rounded-2xl border border-white/10 bg-white/[0.06] p-1">
          {(["C", "F"] as const).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                unit === u ? "bg-blue-600 text-white shadow-md" : "text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              °{u}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard hover={false} className="flex items-center justify-between">
        <div>
          <p className="font-medium">Theme</p>
          <p className="text-sm text-zinc-400">Light, dark, or match your device</p>
        </div>
        <ThemeToggle />
      </GlassCard>

      <GlassCard hover={false}>
        <p className="font-medium">About</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Weather App — built by <span className="text-zinc-200">Siddharth Uppala</span> for the PM Accelerator AI
          Engineer Intern technical assessment.
        </p>
        <p className="mt-4 text-sm font-medium text-zinc-300">About PM Accelerator</p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-400">
          The Product Manager Accelerator Program supports PM professionals through every stage of their career —
          from students seeking entry-level roles to Directors becoming VPs — with 1:1 coaching, mock interviews, and
          real-world project experience.{" "}
          <a
            href="https://www.linkedin.com/school/pmaccelerator/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Learn more on LinkedIn
          </a>
          .
        </p>
      </GlassCard>
    </div>
  );
}
