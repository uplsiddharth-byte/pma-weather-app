"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

type GlassCardProps = HTMLMotionProps<"div"> & { hover?: boolean };

export default function GlassCard({ className = "", hover = true, children, ...props }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -3 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-2xl dark:bg-white/[0.05] ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
