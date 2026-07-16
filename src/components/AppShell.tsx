"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Radar, Bookmark, Settings } from "lucide-react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/radar", label: "Radar", icon: Radar },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-1 flex-col lg:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col gap-8 border-r border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl lg:flex">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <span aria-hidden>☁️</span> Weather App
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                  active ? "text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-2xl bg-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon className="relative z-10 h-5 w-5" />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto text-xs text-zinc-500">
          <p className="font-medium text-zinc-400">Weather App</p>
          <p>Siddharth Uppala — PM Accelerator</p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="flex items-center gap-2 px-4 pt-6 text-lg font-semibold tracking-tight lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span aria-hidden>☁️</span> Weather App
          </Link>
        </div>
        <div className="flex-1 pb-24 lg:pb-0">{children}</div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-4 lg:hidden">
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2 py-2 shadow-2xl backdrop-blur-2xl">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                  active ? "text-white" : "text-zinc-400"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="bottomnav-active"
                    className="absolute inset-0 rounded-full bg-blue-600"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon className="relative z-10 h-5 w-5" />
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
