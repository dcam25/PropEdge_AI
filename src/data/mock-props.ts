import type { Prop } from "@/types";

// Deterministic static data to avoid hydration mismatch (no Math.random/Date.now)
export const MOCK_PROPS: Prop[] = [
  { id: "nba-1", sport: "nba", player: "LeBron James", team: "LAL", opponent: "BOS", propType: "Points", line: 25, hitRate: 0.7, streak: 3, modelEdge: 68.5, lastGames: [28, 22, 31, 19, 27, 24, 26, 23, 29, 21], supportingStats: { avg: 25, trend: 1 }, date: "2025-02-18" },
  { id: "nba-2", sport: "nba", player: "Stephen Curry", team: "GSW", opponent: "MIA", propType: "3-Pointers", line: 4, hitRate: 0.6, streak: 2, modelEdge: 62.3, lastGames: [5, 3, 4, 6, 2, 4, 3, 5, 4, 3], supportingStats: { avg: 4, trend: 0 }, date: "2025-02-18" },
  { id: "nba-3", sport: "nba", player: "Giannis Antetokounmpo", team: "MIL", opponent: "DEN", propType: "Rebounds", line: 12, hitRate: 0.8, streak: 4, modelEdge: 72.1, lastGames: [14, 11, 13, 15, 10, 12, 14, 11, 13, 12], supportingStats: { avg: 12, trend: 2 }, date: "2025-02-18" },
  { id: "nba-4", sport: "nba", player: "Luka Doncic", team: "DAL", opponent: "PHX", propType: "Assists", line: 8, hitRate: 0.65, streak: 1, modelEdge: 58.9, lastGames: [9, 7, 8, 6, 10, 7, 8, 9, 6, 8], supportingStats: { avg: 8, trend: -1 }, date: "2025-02-18" },
  { id: "nba-5", sport: "nba", player: "Kevin Durant", team: "PHX", opponent: "DAL", propType: "Points", line: 27, hitRate: 0.55, streak: 0, modelEdge: 55.2, lastGames: [30, 24, 28, 22, 26, 25, 29, 23, 27, 24], supportingStats: { avg: 26, trend: -1 }, date: "2025-02-18" },
  { id: "nba-6", sport: "nba", player: "Jayson Tatum", team: "BOS", opponent: "LAL", propType: "Points", line: 26, hitRate: 0.75, streak: 5, modelEdge: 70.4, lastGames: [28, 24, 30, 22, 27, 25, 29, 26, 28, 24], supportingStats: { avg: 26, trend: 2 }, date: "2025-02-18" },
  { id: "nfl-1", sport: "nfl", player: "Patrick Mahomes", team: "KC", opponent: "BUF", propType: "Passing Yards", line: 275, hitRate: 0.7, streak: 2, modelEdge: 65.8, lastGames: [290, 260, 310, 245, 280, 265, 295, 250, 285, 270], supportingStats: { avg: 275, trend: 1 }, date: "2025-02-18" },
  { id: "nfl-2", sport: "nfl", player: "Josh Allen", team: "BUF", opponent: "KC", propType: "Rushing Yards", line: 45, hitRate: 0.6, streak: 1, modelEdge: 59.2, lastGames: [52, 38, 48, 42, 55, 35, 50, 40, 45, 48], supportingStats: { avg: 45, trend: 0 }, date: "2025-02-18" },
  { id: "mlb-1", sport: "mlb", player: "Shohei Ohtani", team: "LAD", opponent: "NYY", propType: "Total Bases", line: 2, hitRate: 0.65, streak: 2, modelEdge: 63.5, lastGames: [3, 1, 2, 4, 2, 1, 3, 2, 2, 1], supportingStats: { avg: 2, trend: 1 }, date: "2025-02-18" },
  { id: "nhl-1", sport: "nhl", player: "Connor McDavid", team: "EDM", opponent: "COL", propType: "Points", line: 1, hitRate: 0.8, streak: 4, modelEdge: 71.2, lastGames: [2, 1, 1, 2, 1, 1, 2, 1, 1, 2], supportingStats: { avg: 1, trend: 1 }, date: "2025-02-18" },
  { id: "wnba-1", sport: "wnba", player: "A'ja Wilson", team: "LV", opponent: "NY", propType: "Points", line: 22, hitRate: 0.75, streak: 3, modelEdge: 69.8, lastGames: [24, 20, 23, 21, 25, 19, 22, 24, 20, 23], supportingStats: { avg: 22, trend: 2 }, date: "2025-02-18" },
  { id: "lol-1", sport: "lol", player: "Faker", team: "T1", opponent: "Gen.G", propType: "Kills", line: 4, hitRate: 0.6, streak: 2, modelEdge: 61.4, lastGames: [5, 3, 4, 6, 2, 4, 3, 5, 4, 3], supportingStats: { avg: 4, trend: 0 }, date: "2025-02-18" },
  { id: "cs2-1", sport: "cs2", player: "s1mple", team: "NAVI", opponent: "FaZe", propType: "Kills", line: 22, hitRate: 0.7, streak: 3, modelEdge: 67.3, lastGames: [24, 20, 23, 21, 25, 19, 22, 24, 20, 23], supportingStats: { avg: 22, trend: 1 }, date: "2025-02-18" },
  { id: "valorant-1", sport: "valorant", player: "TenZ", team: "Sentinels", opponent: "LOUD", propType: "Kills", line: 18, hitRate: 0.65, streak: 2, modelEdge: 62.7, lastGames: [20, 16, 19, 17, 21, 15, 18, 20, 16, 19], supportingStats: { avg: 18, trend: 1 }, date: "2025-02-18" },
];

export const SPORT_LABELS: Record<Prop["sport"], string> = {
  nba: "NBA",
  nfl: "NFL",
  mlb: "MLB",
  nhl: "NHL",
  wnba: "WNBA",
  lol: "LoL",
  cs2: "CS2",
  valorant: "Valorant",
};
