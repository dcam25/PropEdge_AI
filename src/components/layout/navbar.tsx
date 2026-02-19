"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/sign-out-button";
import { useAuthStore } from "@/stores/auth-store";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/models", label: "My Models" },
  { href: "/pricing", label: "Pricing" },
  { href: "/profile", label: "Profile" },
];

export function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

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
            <SignOutButton />
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
