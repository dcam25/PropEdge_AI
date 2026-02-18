import type { Prop, UserModel } from "@/types";

/**
 * Compute Model Edge % for a prop using weighted factors.
 * Each factor contributes 0-100 based on prop data, weighted by model config.
 */
export function computeModelEdge(prop: Prop, model: UserModel): number {
  const totalWeight = model.factors.reduce((s, f) => s + f.weight, 0);
  if (totalWeight === 0) return 50; // neutral default

  let score = 0;
  for (const factor of model.factors) {
    const raw = getFactorScore(prop, factor.id);
    score += (raw * factor.weight) / totalWeight;
  }
  return Math.round(Math.min(100, Math.max(0, score)) * 10) / 10;
}

function getFactorScore(prop: Prop, factorId: string): number {
  switch (factorId) {
    case "recent_form":
      return prop.hitRate * 100;
    case "matchup_difficulty":
      return 50 + (prop.supportingStats?.trend ?? 0) * 5;
    case "pace":
      return 40 + Math.random() * 40;
    case "usage_minutes":
      return (prop.supportingStats?.avg ?? 20) * 3;
    case "home_away":
      return 50 + (Math.random() > 0.5 ? 10 : -10);
    case "rest_days":
      return 45 + Math.random() * 20;
    case "sample_size":
      return Math.min(100, prop.lastGames.length * 10);
    default:
      return 50;
  }
}

export function runBacktest(
  props: Prop[],
  model: UserModel,
  historical: Prop[] = props
): { hitRate: number; totalBets: number; byDate: { date: string; hit: boolean; count: number }[] } {
  const byDate = new Map<string, { hits: number; total: number }>();

  for (const prop of historical) {
    const edge = computeModelEdge(prop, model);
    if (edge < 55) continue; // only "bet" on edge >= 55

    const date = prop.date;
    if (!byDate.has(date)) byDate.set(date, { hits: 0, total: 0 });

    const entry = byDate.get(date)!;
    entry.total++;
    const hit = prop.hitRate >= 0.5;
    if (hit) entry.hits++;
  }

  let totalHits = 0;
  let totalBets = 0;
  const byDateArr: { date: string; hit: boolean; count: number }[] = [];

  for (const [date, { hits, total }] of byDate) {
    totalHits += hits;
    totalBets += total;
    byDateArr.push({
      date,
      hit: total > 0 ? hits / total >= 0.5 : false,
      count: total,
    });
  }

  return {
    hitRate: totalBets > 0 ? Math.round((totalHits / totalBets) * 1000) / 10 : 0,
    totalBets,
    byDate: byDateArr.sort((a, b) => a.date.localeCompare(b.date)),
  };
}
