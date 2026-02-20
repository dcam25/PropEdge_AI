"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useModal } from "react-modal-hook";
import { MOCK_PROPS } from "@/data/mock-props";
import type { Prop, SportId } from "@/types";
import { PropTable } from "@/components/prop-table";
import { PropDetailModal } from "@/components/prop-detail-modal";
import { PickBuilder } from "@/components/pick-builder";
import { DashboardChart } from "@/components/dashboard-chart";
import { Pagination } from "@/components/ui/pagination";
import { SpinInput } from "@/components/ui/spin-input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { FREE_AI_LIMIT } from "@/stores/auth-store";
import { useActiveModel } from "@/hooks/use-active-model";
import { computeModelEdge } from "@/lib/model-scoring";

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
  const detailPropRef = useRef<Prop | null>(null);
  const [picks, setPicks] = useState<Prop[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { user, profile } = useAuth();
  const { activeModel } = useActiveModel(user?.id);

  const filteredProps = useMemo(() => {
    let list = sportFilter === "all"
      ? MOCK_PROPS
      : MOCK_PROPS.filter((p) => p.sport === sportFilter);

    if (activeModel) {
      list = list.map((p) => ({
        ...p,
        modelEdge: computeModelEdge(p, activeModel),
      }));
    }

    const minHr = parseFloat(minHitRate);
    if (!Number.isNaN(minHr)) list = list.filter((p) => p.hitRate >= minHr / 100);

    const minE = parseFloat(minEdge);
    if (!Number.isNaN(minE)) list = list.filter((p) => p.modelEdge >= minE);

    return list;
  }, [sportFilter, minHitRate, minEdge, activeModel]);

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

  const handleReorderPicks = (newPicks: Prop[]) => {
    setPicks(newPicks);
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

  const [showPropDetailModal, hidePropDetailModal] = useModal(() => {
    const prop = detailPropRef.current;
    if (!prop) return null;
    return (
      <PropDetailModal
        prop={prop}
        hideModal={hidePropDetailModal}
        onGetAIInsight={handleGetAIInsight}
      />
    );
  }, []);

  const handleViewDetail = (p: Prop) => {
    detailPropRef.current = p;
    showPropDetailModal();
  };

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Props Dashboard</h1>
            {user && (
              <p className="mt-1 text-sm text-zinc-500">
                {profile?.is_premium ? (
                  <span className="text-emerald-400">Premium</span>
                ) : (
                  <>
                    <span className="text-zinc-400">
                      {Math.max(0, FREE_AI_LIMIT - (profile?.ai_insights_used_today ?? 0))} AI insights left today
                    </span>
                  </>
                )}
              </p>
            )}
          </div>
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
                      addedIds={new Set(picks.map((p) => p.id))}
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
              <PickBuilder picks={picks} onRemove={handleRemoveFromSlip} onReorder={handleReorderPicks} />
            </aside>
          </aside>
        </div>
      </main>
    </>
  );
}
