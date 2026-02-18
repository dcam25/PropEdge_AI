/**
 * Deterministic mock time-series for dashboard chart (IBKR-style).
 * Avoids Math.random/Date.now for hydration safety.
 */

export interface TimeSeriesPoint {
  date: string; // YYYY-MM-DD
  edge: number; // model edge %
  hitRate: number; // 0-1
  count: number; // props count
}

// Precomputed 90-day series (deterministic)
const SEED = 42;
function seeded(i: number): number {
  return ((i * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
}

// Fixed anchor for deterministic SSR (no Date.now)
const ANCHOR = "2025-02-18";

function generateSeries(days: number): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  const base = new Date(ANCHOR);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split("T")[0];
    const j = days - 1 - i;
    const edge = 52 + seeded(SEED + j) * 18 + (j / days) * 8;
    const hitRate = 0.5 + seeded(SEED + j + 100) * 0.25 + (j / days) * 0.1;
    const count = Math.floor(8 + seeded(SEED + j + 200) * 12);
    points.push({
      date,
      edge: Math.round(edge * 10) / 10,
      hitRate: Math.round(hitRate * 100) / 100,
      count,
    });
  }
  return points;
}

const FULL_SERIES = generateSeries(90);

export function getTimeSeries(days: 7 | 30 | 90): TimeSeriesPoint[] {
  return FULL_SERIES.slice(-days);
}
