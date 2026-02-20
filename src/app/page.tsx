import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeHeaderNav } from "@/components/home-header-nav";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <span className="font-bold text-emerald-400">PropEdge AI</span>
          <HomeHeaderNav />
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
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button size="lg">View Props</Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline">
                Get Started
              </Button>
            </Link>
          </div>
          <div className="flex gap-4">
            <Link href="/about">
              <Button size="sm" variant="outline">
                About
              </Button>
            </Link>
            <Link href="/readme">
              <Button size="sm" variant="outline">
                Readme
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
        <p>
          <Link href="/about" className="underline hover:text-zinc-300">About</Link>
          {" · "}
          <Link href="/readme" className="underline hover:text-zinc-300">Readme</Link>
          {" · "}
          <Link href="/terms" className="underline hover:text-zinc-300">Terms</Link>
          {" · "}
          <Link href="/privacy" className="underline hover:text-zinc-300">Privacy</Link>
        </p>
      </footer>
    </div>
  );
}
