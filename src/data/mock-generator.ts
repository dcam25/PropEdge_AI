/**
 * Mock data generator using mocker-data-generator.
 * Use generateMockProps(count, seed) for large deterministic datasets.
 */

import mocker from "mocker-data-generator";
import { faker } from "@faker-js/faker";
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
  mlb: ["NYY", "LAD", "HOU", "ATL", "PHI", "SD", "NYY", "BOS"],
  nhl: ["EDM", "COL", "TB", "FLA", "TOR", "VGK", "CAR", "BOS"],
  wnba: ["LV", "NY", "CHI", "SEA", "CON", "PHX", "MIN", "ATL"],
  lol: ["T1", "Gen.G", "JDG", "BLG", "C9", "G2", "FNC", "DK"],
  cs2: ["NAVI", "FaZe", "G2", "Vitality", "Liquid", "Spirit", "MOUZ", "ENCE"],
  valorant: ["Sentinels", "LOUD", "DRX", "PRX", "FUT", "FNATIC", "Leviatan", "KRU"],
};

let _propCounter = 0;

const propSchema = {
  sport: {
    values: SPORTS,
  },
  player: {
    faker: "person.fullName",
  },
  team: {
    function: function (this: { object: { sport: SportId } }) {
      const teams = TEAMS[this.object.sport];
      return faker.helpers.arrayElement(teams);
    },
  },
  opponent: {
    function: function (this: { object: { sport: SportId; team: string } }) {
      const teams = TEAMS[this.object.sport].filter((t) => t !== this.object.team);
      return faker.helpers.arrayElement(teams.length ? teams : TEAMS[this.object.sport]);
    },
  },
  propType: {
    function: function (this: { object: { sport: SportId } }) {
      return faker.helpers.arrayElement(PROP_TYPES[this.object.sport]);
    },
  },
  line: {
    function: function (this: { object: { sport: SportId; propType: string } }) {
      const sport = this.object.sport;
      if (sport === "nba" || sport === "wnba") return faker.number.int({ min: 5, max: 35 });
      if (sport === "nfl") return faker.number.int({ min: 50, max: 400 });
      if (sport === "mlb") return faker.number.int({ min: 0, max: 5 });
      if (sport === "nhl") return faker.number.int({ min: 0, max: 4 });
      if (sport === "lol" || sport === "cs2" || sport === "valorant")
        return faker.number.int({ min: 5, max: 30 });
      return faker.number.int({ min: 1, max: 20 });
    },
  },
  hitRate: {
    function: function () {
      return Math.round(faker.number.float({ min: 0.4, max: 0.9 }) * 100) / 100;
    },
  },
  streak: {
    function: function () {
      return faker.number.int({ min: 0, max: 6 });
    },
  },
  modelEdge: {
    function: function () {
      return Math.round(faker.number.float({ min: 50, max: 78 }) * 10) / 10;
    },
  },
  lastGames: {
    function: function (this: { object: { line: number; sport: SportId } }) {
      const line = Number(this.object.line) || 15;
      const base = typeof line === "number" ? line : 15;
      return Array.from({ length: 10 }, () =>
        faker.number.int({ min: Math.max(0, base - 8), max: base + 8 })
      );
    },
  },
  supportingStats: {
    function: function (this: { object: { lastGames: number[]; hitRate: number } }) {
      const games = this.object.lastGames;
      const avg = games.length ? games.reduce((a, b) => a + b, 0) / games.length : 0;
      return {
        avg: Math.round(avg * 10) / 10,
        trend: faker.number.int({ min: -2, max: 2 }),
      };
    },
  },
  date: {
    static: "2025-02-18",
  },
};

/**
 * Generate mock props. Uses faker.seed for deterministic output (SSR-safe).
 * @param count Number of props to generate
 * @param seed Optional seed for reproducibility (default: 42)
 */
export function generateMockProps(count: number, seed = 42): Prop[] {
  faker.seed(seed);
  _propCounter = 0;

  const data = mocker()
    .addGenerator("faker", faker)
    .schema(
      "prop",
      {
        ...propSchema,
        id: {
          function: function (this: { object: { sport: string } }) {
            _propCounter += 1;
            return `${this.object.sport}-${_propCounter}`;
          },
        },
      },
      count
    )
    .buildSync();

  return data.prop as Prop[];
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
