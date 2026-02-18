import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <span className="font-bold text-emerald-400">PropEdge AI</span>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-zinc-100">
              Sign in
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl font-bold text-zinc-100 sm:text-5xl">
          Sports Props Analytics
        </h1>
        <p className="mt-4 max-w-xl text-lg text-zinc-500">
          Research multi-sport player props with custom models and AI-powered insights.
          NBA, NFL, MLB, NHL, WNBA, LoL, CS2, Valorant.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/dashboard">
            <Button size="lg">View Props</Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline">
              Pricing
            </Button>
          </Link>
        </div>
      </main>

      <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
        <p>
          <Link href="/terms" className="underline">Terms</Link> ·{" "}
          <Link href="/privacy" className="underline">Privacy</Link>
        </p>
      </footer>
    </div>
  );
}
