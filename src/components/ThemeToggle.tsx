"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";

function applyTheme(theme: Theme) {
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Device", icon: Monitor },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = (localStorage.getItem("theme") as Theme | null) ?? "dark";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable client-side, after mount
    setTheme(stored);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  function choose(next: Theme) {
    localStorage.setItem("theme", next);
    setTheme(next);
  }

  return (
    <div className="inline-flex gap-1 rounded-2xl border border-white/10 bg-white/[0.06] p-1 backdrop-blur-xl">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => choose(opt.value)}
            aria-pressed={theme === opt.value}
            title={opt.label}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              theme === opt.value ? "bg-blue-600 text-white shadow-md" : "text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
