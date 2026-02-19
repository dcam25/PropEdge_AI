"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
      <p>
        Disclaimer: PropEdge AI is for entertainment and research only. No guarantees. Gambling involves risk.{" "}
        <Link href="/terms" className="underline">Terms</Link> · <Link href="/privacy" className="underline">Privacy</Link>
      </p>
    </footer>
  );
}
