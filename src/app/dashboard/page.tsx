"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { MOCK_PROPS, SPORT_LABELS } from "@/data/mock-props";
import type { Prop, SportId } from "@/types";
import { PropTable } from "@/components/prop-table";
import { PropDetailModal } from "@/components/prop-detail-modal";
import { PickBuilder } from "@/components/pick-builder";
import { DashboardChart } from "@/components/dashboard-chart";
import { Pagination } from "@/components/ui/pagination";
import { SpinInput } from "@/components/ui/spin-input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";
import { SignOutButton } from "@/components/sign-out-button";

const SPORT_TABS: { value: SportId | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "nba", label: "NBA" },
  { value: "nfl", label: "NFL" },
  { value: "mlb", label: "MLB" },
  { value: "nhl", label: "NHL" },
  { value: "wnba", label: "WNBA" },
  { value: "lol", label: "LoL" },
  { value: "cs2", label: "CS2" },
  { value: "valorant", label: "Valorant" },
];

export default function DashboardPage() {
  const [sportFilter, setSportFilter] = useState<SportId | "all">("all");
  const [minHitRate, setMinHitRate] = useState<string>("");
  const [minEdge, setMinEdge] = useState<string>("");
  const [detailProp, setDetailProp] = useState<Prop | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [picks, setPicks] = useState<Prop[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { user } = useAuth();

  const filteredProps = useMemo(() => {
    let list = sportFilter === "all"
      ? MOCK_PROPS
      : MOCK_PROPS.filter((p) => p.sport === sportFilter);

    const minHr = parseFloat(minHitRate);
    if (!Number.isNaN(minHr)) list = list.filter((p) => p.hitRate >= minHr / 100);

    const minE = parseFloat(minEdge);
    if (!Number.isNaN(minE)) list = list.filter((p) => p.modelEdge >= minE);

    return list;
  }, [sportFilter, minHitRate, minEdge]);

  const paginatedProps = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProps.slice(start, start + pageSize);
  }, [filteredProps, page, pageSize]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredProps.length / pageSize));
    if (page > maxPage) setPage(1);
  }, [filteredProps.length, pageSize, page]);

  const handleAddToSlip = (prop: Prop) => {
    if (picks.some((p) => p.id === prop.id)) return;
    setPicks((prev) => [...prev, prop]);
  };

  const handleRemoveFromSlip = (prop: Prop) => {
    setPicks((prev) => prev.filter((p) => p.id !== prop.id));
  };

  const handleGetAIInsight = async (prop: Prop): Promise<string> => {
    const res = await fetch("/api/ai-insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prop }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed");
    return data.insight;
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="font-bold text-emerald-400">
            PropEdge AI
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/models" className="text-sm text-zinc-400 hover:text-zinc-100">
              My Models
            </Link>
            <Link href="/pricing" className="text-sm text-zinc-400 hover:text-zinc-100">
              Pricing
            </Link>
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

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-zinc-100">Props Dashboard</h1>
          <div className="flex flex-wrap items-center gap-2">
            <SpinInput
              placeholder="Hit %"
              value={minHitRate}
              onChange={setMinHitRate}
              min={0}
              max={100}
            />
            <SpinInput
              placeholder="Edge %"
              value={minEdge}
              onChange={setMinEdge}
              min={0}
              max={100}
            />
          </div>
        </div>

        <div className="mb-6">
          <DashboardChart props={filteredProps} />
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1">
            <Tabs value={sportFilter} onValueChange={(v) => setSportFilter(v as SportId | "all")}>
              <TabsList className="mb-4 flex-wrap">
                {SPORT_TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {SPORT_TABS.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-0">
                  <div className="overflow-hidden rounded-lg border border-zinc-800">
                    <PropTable
                      props={paginatedProps}
                      onAddToSlip={handleAddToSlip}
                      onViewDetail={(p) => {
                        setDetailProp(p);
                        setDetailOpen(true);
                      }}
                    />
                    <Pagination
                      page={page}
                      pageSize={pageSize}
                      totalItems={filteredProps.length}
                      onPageChange={setPage}
                      onPageSizeChange={setPageSize}
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
          <aside className="w-full lg:w-80 shrink-0">
            <aside className="sticky top-20">
              <PickBuilder picks={picks} onRemove={handleRemoveFromSlip} />
            </aside>
          </aside>
        </div>
      </main>

      <PropDetailModal
        prop={detailProp}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onGetAIInsight={handleGetAIInsight}
      />

      <footer className="mt-12 border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
        <p>
          Disclaimer: PropEdge AI is for entertainment and research only. No guarantees. Gambling involves risk.{" "}
          <Link href="/terms" className="underline">Terms</Link> · <Link href="/privacy" className="underline">Privacy</Link>
        </p>
      </footer>
    </div>
  );
}
