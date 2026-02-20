import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomeHeaderNav } from "@/components/home-header-nav";

const GITHUB_URL = "https://github.com/dcam25/PropEdge_AI";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <span className="font-bold text-emerald-400">PropEdge AI</span>
          <div className="flex items-center gap-4">
            <HomeHeaderNav />
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-100"
              aria-label="GitHub source"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pt-14 text-center">
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
          <div className="flex gap-6 text-lg text-emerald-400">
            <Link href="/about" className="hover:text-emerald-300 hover:underline">
              About
            </Link>
            <Link href="/readme" className="hover:text-emerald-300 hover:underline">
              Readme
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
