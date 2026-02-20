"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/sign-out-button";
import { PlanToolbar } from "@/components/plan-toolbar";
import { useAuthStore, FREE_AI_LIMIT } from "@/stores/auth-store";

const GITHUB_URL = "https://github.com/dcam25/PropEdge_AI";

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
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-zinc-800/50 bg-gradient-to-b from-zinc-950/90 to-transparent backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-emerald-400">
          <img src="/icon.png" alt="" className="h-7 w-7 rounded" aria-hidden />
          PropEdge AI
        </Link>
        <nav className="flex items-center gap-4">
          {(user ? navLinks : navLinks.filter((l) => l.href === "/dashboard")).map((link) => (
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
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-zinc-100"
            aria-label="GitHub source"
          >
            <Github className="h-5 w-5" />
          </a>
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
