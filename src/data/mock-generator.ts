/**
 * Deterministic mock data generator (SSR-safe, no faker/mocker).
 * Uses Mulberry32 PRNG for identical server/client output.
 */

import type { Prop, SportId } from "@/types";

const SPORTS: SportId[] = ["nba", "nfl", "mlb", "nhl", "wnba", "lol", "cs2", "valorant"];
const PROP_TYPES: Record<SportId, string[]> = {
  nba: ["Points", "Rebounds", "Assists", "3-Pointers", "Steals", "Blocks"],
  nfl: ["Passing Yards", "Rushing Yards", "Receiving Yards", "Touchdowns", "Completions"],
  mlb: ["Total Bases", "Hits", "RBIs", "Strikeouts", "Home Runs"],
  nhl: ["Points", "Goals", "Assists", "Shots", "Saves"],
  wnba: ["Points", "Rebounds", "Assists", "Steals"],
  lol: ["Kills", "Assists", "Deaths", "CS", "Damage"],
  cs2: ["Kills", "Assists", "Deaths", "Headshots", "ADR"],
  valorant: ["Kills", "Assists", "Deaths", "First Bloods", "ACS"],
};

const TEAMS: Record<SportId, string[]> = {
  nba: ["LAL", "BOS", "GSW", "MIA", "MIL", "DEN", "PHX", "DAL"],
  nfl: ["KC", "BUF", "PHI", "DAL", "SF", "MIA", "BAL", "CIN"],
  mlb: ["NYY", "LAD", "HOU", "ATL", "PHI", "SD", "BOS"],
  nhl: ["EDM", "COL", "TB", "FLA", "TOR", "VGK", "CAR", "BOS"],
  wnba: ["LV", "NY", "CHI", "SEA", "CON", "PHX", "MIN", "ATL"],
  lol: ["T1", "Gen.G", "JDG", "BLG", "C9", "G2", "FNC", "DK"],
  cs2: ["NAVI", "FaZe", "G2", "Vitality", "Liquid", "Spirit", "MOUZ", "ENCE"],
  valorant: ["Sentinels", "LOUD", "DRX", "PRX", "FUT", "FNATIC", "Leviatan", "KRU"],
};

const FIRST_NAMES = [
  "LeBron", "Stephen", "Giannis", "Luka", "Kevin", "Jayson", "Patrick", "Josh",
  "Shohei", "Connor", "Aja", "Faker", "s1mple", "TenZ", "Anthony", "Devin",
  "Trae", "Donovan", "Zion", "Ja", "Damian", "Jimmy", "Kawhi", "Joel",
];

const LAST_NAMES = [
  "James", "Curry", "Antetokounmpo", "Doncic", "Durant", "Tatum", "Mahomes", "Allen",
  "Ohtani", "McDavid", "Wilson", "Lee", "Kostyliev", "Tyson", "Davis", "Booker",
  "Young", "Mitchell", "Williamson", "Morant", "Lillard", "Butler", "Leonard", "Embiid",
];

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)];
}

/**
 * Generate mock props. Fully deterministic (SSR-safe).
 */
export function generateMockProps(count: number, seed = 42): Prop[] {
  const r = mulberry32(seed);
  const props: Prop[] = [];

  for (let i = 0; i < count; i++) {
    const sport = pick(SPORTS, r);
    const teams = TEAMS[sport];
    const team = pick(teams, r);
    const others = teams.filter((t) => t !== team);
    const opponent = others.length > 0 ? pick(others, r) : team;
    const propType = pick(PROP_TYPES[sport], r);
    const firstName = pick(FIRST_NAMES, r);
    const lastName = pick(LAST_NAMES, r);

    let line: number;
    if (sport === "nba" || sport === "wnba") line = 5 + Math.floor(r() * 31);
    else if (sport === "nfl") line = 50 + Math.floor(r() * 351);
    else if (sport === "mlb") line = Math.floor(r() * 6);
    else if (sport === "nhl") line = Math.floor(r() * 5);
    else line = 5 + Math.floor(r() * 26);

    const hitRate = Math.round((0.4 + r() * 0.5) * 100) / 100;
    const streak = Math.floor(r() * 7);
    const modelEdge = Math.round((50 + r() * 28) * 10) / 10;
    const lastGames = Array.from({ length: 10 }, () =>
      Math.max(0, line - 8 + Math.floor(r() * 17))
    );
    const avg = lastGames.reduce((a, b) => a + b, 0) / 10;

    props.push({
      id: `${sport}-${i + 1}`,
      sport,
      player: `${firstName} ${lastName}`,
      team,
      opponent,
      propType,
      line,
      hitRate,
      streak,
      modelEdge,
      lastGames,
      supportingStats: {
        avg: Math.round(avg * 10) / 10,
        trend: Math.floor(r() * 5) - 2,
      },
      date: "2025-02-18",
    });
  }

  return props;
}

export const SPORT_LABELS: Record<SportId, string> = {
  nba: "NBA",
  nfl: "NFL",
  mlb: "MLB",
  nhl: "NHL",
  wnba: "WNBA",
  lol: "LoL",
  cs2: "CS2",
  valorant: "Valorant",
};
