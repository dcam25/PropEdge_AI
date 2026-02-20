"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

function getFullName(profile: { first_name?: string | null; last_name?: string | null } | null, email?: string | null): string {
  const first = (profile?.first_name ?? "").trim();
  const last = (profile?.last_name ?? "").trim();
  const full = [first, last].filter(Boolean).join(" ");
  if (full) return full;
  if (email) return email.split("@")[0] ?? "User";
  return "User";
}

export function HomeHeaderNav() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <nav className="flex items-center gap-4">
        <span className="h-4 w-16 animate-pulse rounded bg-zinc-800" />
      </nav>
    );
  }

  if (user) {
    const fullName = getFullName(profile, user.email);
    return (
      <nav className="flex flex-col items-end gap-0.5">
        <span className="text-xs text-zinc-500">Welcome!</span>
        <Link href="/profile" className="text-sm font-medium text-zinc-100 hover:text-emerald-400">
          {fullName}
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-4">
      <Link href="/login" className="text-sm text-zinc-400 hover:text-zinc-100">
        Sign in
      </Link>
      <Link href="/signup">
        <Button size="sm">Get Started</Button>
      </Link>
    </nav>
  );
}
