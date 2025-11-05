export type ShotDirection = 'Fine Leg' | 'Square Leg' | 'Mid-Wicket' | 'Long On' | 'Straight' | 'Long Off' | 'Cover' | 'Point';

export interface Player {
  id: number;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  isBatting: boolean;
  // Bowling stats
  wicketsTaken: number;
  runsConceded: number;
  ballsBowled: number;
}

export interface Team {
  name: string;
  players: Player[];
}

export interface Ball {
  runs: number;
  isWicket: boolean;
  isWide: boolean;
  isNoBall: boolean;
  extraRuns: number; // For runs off wides/no-balls
  ballNumber: number;
  overNumber: number;
  shotDirection?: ShotDirection;
  batsmanId: number;
  bowlerId: number;
}

export interface Innings {
  score: number;
  wickets: number;
  overs: number;
  ballsInOver: number;
  timeline: Ball[];
  battingTeam: string;
  bowlingTeam: string;
}

export interface MatchSettings {
  overs: number; // 0 for unlimited (Test Match)
  playersPerTeam: number;
  teamOneName: string;
  teamTwoName: string;
  teamOnePlayers: string[];
  teamTwoPlayers: string[];
}

export enum GameStatus {
  SETUP,
  TOSS,
  IN_PROGRESS,
  INNINGS_BREAK,
  FINISHED,
}

export interface GameState {
  status: GameStatus;
  settings: MatchSettings | null;
  teams: Team[];
  currentInnings: 1 | 2;
  innings: [Innings, Innings | null];
  battingTeamIndex: 0 | 1;
  bowlingTeamIndex: 0 | 1;
  strikerId: number;
  nonStrikerId: number;
  currentBowlerId: number | null;
  isFreeHit: boolean;
  target: number | null;
  winner: string | null;
  winMargin: string | null;
  tossWinner: string | null;
  choseTo: 'Bat' | 'Bowl' | null;
  lastEvent?: 'none' | 'four' | 'six' | 'wicket' | 'wide' | 'noball';
  commentary: string | null;
}