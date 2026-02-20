"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/sign-out-button";
import { PlanToolbar } from "@/components/plan-toolbar";
import { useAuthStore, FREE_AI_LIMIT } from "@/stores/auth-store";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/models", label: "My Models" },
  { href: "/plan", label: "Plan" },
  { href: "/profile", label: "Profile" },
];

export function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);

  const aiRemaining =
    user && profile
      ? Math.max(0, FREE_AI_LIMIT - (profile.ai_insights_used_today ?? 0))
      : null;

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="font-bold text-emerald-400">
          PropEdge AI
        </Link>
        <nav className="flex items-center gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm ${
                pathname === link.href ? "text-emerald-400" : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center gap-3">
              {aiRemaining !== null && (
                <PlanToolbar
                  isPremium={!!profile?.is_premium}
                  aiRemaining={aiRemaining}
                />
              )}
              <SignOutButton />
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
