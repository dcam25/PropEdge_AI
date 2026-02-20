// Sport types
export type SportId =
  | "nba"
  | "nfl"
  | "mlb"
  | "nhl"
  | "wnba"
  | "lol"
  | "cs2"
  | "valorant";

export interface Prop {
  id: string;
  sport: SportId;
  player: string;
  team: string;
  opponent: string;
  propType: string;
  line: number | string;
  hitRate: number; // last 10 games, e.g. 7/10 = 0.7
  streak: number; // current hit streak
  modelEdge: number; // 0-100
  lastGames: number[];
  supportingStats?: Record<string, number>;
  date: string;
}

export type ModelFactorId =
  | "recent_form"
  | "matchup_difficulty"
  | "pace"
  | "usage_minutes"
  | "home_away"
  | "rest_days"
  | "sample_size";

export interface ModelFactor {
  id: ModelFactorId;
  name: string;
  weight: number; // 0-100
}

export interface UserModel {
  id: string;
  userId: string;
  name: string;
  description: string;
  factors: ModelFactor[];
  performanceScore?: number;
  isActive: boolean;
  createdAt: string;
}

export interface BacktestResult {
  hitRate: number;
  totalBets: number;
  byDate: { date: string; hit: boolean; count: number }[];
}

export interface InvoiceItem {
  id: string;
  date: string;
  dateTime?: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
}

export interface UserProfile {
  first_name?: string | null;
  last_name?: string | null;
  birthday?: string | null; // ISO date YYYY-MM-DD
  is_premium: boolean;
  ai_insights_used_today: number;
  ai_insights_date: string | null;
}
