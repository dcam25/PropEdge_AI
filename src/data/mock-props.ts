import type { Prop } from "@/types";

const SPORTS: Array<{ id: Prop["sport"]; teams: string[] }> = [
  { id: "nba", teams: ["LAL", "BOS", "GSW", "MIA", "DEN", "PHX", "MIL", "DAL"] },
  { id: "nfl", teams: ["KC", "BUF", "SF", "PHI", "DAL", "MIA", "BAL", "DET"] },
  { id: "mlb", teams: ["NYY", "LAD", "ATL", "HOU", "PHI", "SD", "TB", "TOR"] },
  { id: "nhl", teams: ["VGK", "BOS", "TOR", "EDM", "COL", "CAR", "DAL", "FLA"] },
  { id: "wnba", teams: ["LV", "NY", "CON", "PHX", "SEA", "CHI", "MIN", "ATL"] },
  { id: "lol", teams: ["T1", "Gen.G", "JDG", "BLG", "G2", "C9", "TL", "DK"] },
  { id: "cs2", teams: ["FaZe", "Vitality", "G2", "NAVI", "Spirit", "MOUZ", "Liquid", "Complexity"] },
  { id: "valorant", teams: ["Sentinels", "LOUD", "DRX", "Paper Rex", "Fnatic", "100T", "NRG", "Leviatan"] },
];

const NBA_PLAYERS = ["LeBron James", "Stephen Curry", "Kevin Durant", "Giannis Antetokounmpo", "Luka Doncic", "Jayson Tatum", "Anthony Edwards", "Shai Gilgeous-Alexander"];
const NFL_PLAYERS = ["Patrick Mahomes", "Josh Allen", "Tyreek Hill", "Travis Kelce", "Christian McCaffrey", "CeeDee Lamb", "Justin Jefferson", "Ja'Marr Chase"];
const MLB_PLAYERS = ["Shohei Ohtani", "Aaron Judge", "Mookie Betts", "Ronald Acuña Jr", "Juan Soto", "Bryce Harper", "Corey Seager", "Yordan Alvarez"];
const NHL_PLAYERS = ["Connor McDavid", "Auston Matthews", "Nathan MacKinnon", "David Pastrnak", "Nikita Kucherov", "Leon Draisaitl", "Artemi Panarin", "Jack Hughes"];
const WNBA_PLAYERS = ["A'ja Wilson", "Breanna Stewart", "Caitlin Clark", "Alyssa Thomas", "Jewell Loyd", "Sabrina Ionescu", "Kelsey Plum", "Chelsea Gray"];
const LOL_PLAYERS = ["Faker", "Chovy", "Knight", "Ruler", "Caps", "Blaber", "CoreJJ", "ShowMaker"];
const CS2_PLAYERS = ["s1mple", "ZywOo", "m0NESY", "NiKo", "donk", "ropz", "EliGE", "Twistzz"];
const VALORANT_PLAYERS = ["TenZ", "aspas", "Zombs", "yay", "Sacy", "cNed", "Scream", "Chronicle"];

const PLAYER_MAP: Record<string, string[]> = {
  nba: NBA_PLAYERS,
  nfl: NFL_PLAYERS,
  mlb: MLB_PLAYERS,
  nhl: NHL_PLAYERS,
  wnba: WNBA_PLAYERS,
  lol: LOL_PLAYERS,
  cs2: CS2_PLAYERS,
  valorant: VALORANT_PLAYERS,
};

const PROP_TYPES: Record<string, string[]> = {
  nba: ["Points", "Rebounds", "Assists", "3-Pointers", "Steals", "Blocks"],
  nfl: ["Passing Yards", "Rushing Yards", "Receptions", "Receiving Yards", "Touchdowns"],
  mlb: ["Hits", "Total Bases", "Strikeouts", "RBIs", "Runs"],
  nhl: ["Points", "Goals", "Assists", "Shots", "Saves"],
  wnba: ["Points", "Rebounds", "Assists", "Steals", "Blocks"],
  lol: ["Kills", "Assists", "Deaths", "CS", "Vision Score"],
  cs2: ["Kills", "Assists", "Deaths", "Headshots", "ADR"],
  valorant: ["Kills", "Assists", "Deaths", "First Bloods", "ACS"],
};

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePropsForSport(sport: Prop["sport"], count: number): Prop[] {
  const teams = SPORTS.find((s) => s.id === sport)?.teams ?? [];
  const players = PLAYER_MAP[sport] ?? [];
  const propTypes = PROP_TYPES[sport] ?? ["Points"];

  const props: Prop[] = [];
  const usedIds = new Set<string>();

  for (let i = 0; i < count; i++) {
    const player = players[randomBetween(0, players.length - 1)];
    const team = teams[randomBetween(0, teams.length - 1)];
    let opponent = teams[randomBetween(0, teams.length - 1)];
    while (opponent === team) opponent = teams[randomBetween(0, teams.length - 1)];

    const propType = propTypes[randomBetween(0, propTypes.length - 1)];
    const line = sport === "lol" || sport === "cs2" || sport === "valorant"
      ? randomBetween(5, 25)
      : randomBetween(10, 35);
    const hitRate = Math.round((Math.random() * 0.6 + 0.2) * 100) / 100;
    const streak = randomBetween(0, 5);
    const modelEdge = Math.round((Math.random() * 40 + 50) * 10) / 10;

    const lastGames = Array.from({ length: 10 }, () => randomBetween(5, 30));
    const id = `${sport}-${player.replace(/\s/g, "-")}-${propType}-${i}-${Date.now()}`;

    if (!usedIds.has(id)) {
      usedIds.add(id);
      props.push({
        id,
        sport,
        player,
        team,
        opponent,
        propType,
        line,
        hitRate,
        streak,
        modelEdge,
        lastGames,
        supportingStats: { avg: randomBetween(15, 28), trend: randomBetween(-2, 2) },
        date: new Date().toISOString().split("T")[0],
      });
    }
  }

  return props;
}

export const MOCK_PROPS: Prop[] = [
  ...generatePropsForSport("nba", 12),
  ...generatePropsForSport("nfl", 10),
  ...generatePropsForSport("mlb", 8),
  ...generatePropsForSport("nhl", 8),
  ...generatePropsForSport("wnba", 6),
  ...generatePropsForSport("lol", 8),
  ...generatePropsForSport("cs2", 6),
  ...generatePropsForSport("valorant", 6),
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
