import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import AppShell from "@/components/AppShell";
import { AppProviders } from "@/lib/app-context";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Weather App — Siddharth Uppala",
  description: "PM Accelerator technical assessment weather app",
};

// Runs before paint to apply the stored theme (or system preference, default
// dark) and avoid a flash of the wrong theme on load.
const themeInitScript = `
(function () {
  try {
    var theme = localStorage.getItem("theme") || "dark";
    var isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased dark ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-white text-zinc-900 dark:bg-[#111111] dark:text-white" suppressHydrationWarning>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
