/**
 * Deterministic mock time-series for dashboard chart.
 * Uses Mulberry32 PRNG for realistic-looking random data (SSR-safe via seed).
 */

export interface TimeSeriesPoint {
  date: string; // YYYY-MM-DD
  edge: number; // model edge %
  hitRate: number; // 0-1
  count: number; // props count
}

// Mulberry32 - fast, high-quality seeded PRNG
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ANCHOR = "2025-02-18";

function generateSeries(days: number, seed: number): TimeSeriesPoint[] {
  const random = mulberry32(seed);
  const points: TimeSeriesPoint[] = [];
  const base = new Date(ANCHOR);

  let edge = 60;
  let hitRate = 0.65;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split("T")[0];

    // Random walk with mean reversion (realistic time-series)
    const edgeDelta = (random() - 0.5) * 3;
    const edgeReversion = (60 - edge) * 0.03;
    edge = Math.max(52, Math.min(78, edge + edgeDelta + edgeReversion));

    const hitDelta = (random() - 0.5) * 0.08;
    const hitReversion = (0.65 - hitRate) * 0.02;
    hitRate = Math.max(0.45, Math.min(0.88, hitRate + hitDelta + hitReversion));

    const count = Math.floor(12 + random() * 24);

    points.push({
      date,
      edge: Math.round(edge * 10) / 10,
      hitRate: Math.round(hitRate * 100) / 100,
      count,
    });
  }

  return points;
}

const FULL_SERIES = generateSeries(90, 42);

export function getTimeSeries(days: 7 | 30 | 90): TimeSeriesPoint[] {
  return FULL_SERIES.slice(-days);
}
