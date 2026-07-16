export default function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-shimmer rounded-2xl bg-white/5 ${className}`} />;
}
