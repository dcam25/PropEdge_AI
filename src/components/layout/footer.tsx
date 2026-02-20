"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
      <p>
        Disclaimer: PropEdge AI is for entertainment and research only. No guarantees. Gambling involves risk.
      </p>
      <p className="mt-2">
        <Link href="/about" className="underline hover:text-zinc-300">About</Link>
        {" · "}
        <Link href="/readme" className="underline hover:text-zinc-300">README</Link>
        {" · "}
        <Link href="/terms" className="underline hover:text-zinc-300">Terms</Link>
        {" · "}
        <Link href="/privacy" className="underline hover:text-zinc-300">Privacy</Link>
      </p>
    </footer>
  );
}
