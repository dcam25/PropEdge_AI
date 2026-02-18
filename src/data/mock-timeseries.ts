/**
 * Deterministic mock time-series for dashboard chart.
 * 1 year of daily data, aggregated by month. SSR-safe via seed.
 */

export interface TimeSeriesPoint {
  date: string; // YYYY-MM-DD or YYYY-MM for monthly
  monthKey: string; // YYYY-MM for grouping
  edge: number;
  hitRate: number;
  count: number;
}

export interface MonthlyPoint {
  monthKey: string; // YYYY-MM
  label: string; // "Jan 2025"
  edge: number;
  hitRate: number;
  count: number;
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
const DAYS = 365;

function generateDailySeries(seed: number): TimeSeriesPoint[] {
  const random = mulberry32(seed);
  const points: TimeSeriesPoint[] = [];
  const base = new Date(ANCHOR);

  let edge = 60;
  let hitRate = 0.65;

  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split("T")[0];
    const monthKey = date.slice(0, 7); // YYYY-MM

    const edgeDelta = (random() - 0.5) * 3;
    const edgeReversion = (60 - edge) * 0.03;
    edge = Math.max(52, Math.min(78, edge + edgeDelta + edgeReversion));

    const hitDelta = (random() - 0.5) * 0.08;
    const hitReversion = (0.65 - hitRate) * 0.02;
    hitRate = Math.max(0.45, Math.min(0.88, hitRate + hitDelta + hitReversion));

    const count = Math.floor(12 + random() * 24);

    points.push({
      date,
      monthKey,
      edge: Math.round(edge * 10) / 10,
      hitRate: Math.round(hitRate * 100) / 100,
      count,
    });
  }

  return points;
}

const DAILY_SERIES = generateDailySeries(42);

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthKeyToLabel(key: string): string {
  const [y, m] = key.split("-");
  return `${MONTH_NAMES[Number(m) - 1]} ${y}`;
}

/** Get available month keys (YYYY-MM) in the dataset, oldest first */
export function getAvailableMonths(): string[] {
  const seen = new Set<string>();
  for (const p of DAILY_SERIES) {
    seen.add(p.monthKey);
  }
  return Array.from(seen).sort();
}

/**
 * Get daily series for the given month range (inclusive).
 * @param startMonth YYYY-MM
 * @param endMonth YYYY-MM
 */
export function getDailySeries(startMonth: string, endMonth: string): TimeSeriesPoint[] {
  return DAILY_SERIES.filter(
    (p) => p.monthKey >= startMonth && p.monthKey <= endMonth
  );
}

/**
 * Get monthly aggregated series for the given month range (inclusive).
 * @param startMonth YYYY-MM
 * @param endMonth YYYY-MM
 */
export function getMonthlySeries(startMonth: string, endMonth: string): MonthlyPoint[] {
  const byMonth = new Map<
    string,
    { edgeSum: number; hitSum: number; countSum: number; n: number }
  >();

  for (const p of DAILY_SERIES) {
    if (p.monthKey < startMonth || p.monthKey > endMonth) continue;

    const cur = byMonth.get(p.monthKey) ?? { edgeSum: 0, hitSum: 0, countSum: 0, n: 0 };
    cur.edgeSum += p.edge;
    cur.hitSum += p.hitRate;
    cur.countSum += p.count;
    cur.n += 1;
    byMonth.set(p.monthKey, cur);
  }

  const available = getAvailableMonths().filter((m) => m >= startMonth && m <= endMonth);

  return available.map((monthKey) => {
    const data = byMonth.get(monthKey);
    if (!data || data.n === 0) {
      return {
        monthKey,
        label: monthKeyToLabel(monthKey),
        edge: 0,
        hitRate: 0,
        count: 0,
      };
    }
    return {
      monthKey,
      label: monthKeyToLabel(monthKey),
      edge: Math.round((data.edgeSum / data.n) * 10) / 10,
      hitRate: Math.round((data.hitSum / data.n) * 100) / 100,
      count: data.countSum,
    };
  });
}
