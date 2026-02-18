"use client";

export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-500 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
