export type MatchStatus = 'scheduled' | 'live' | 'finished';
export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';
export type FormationKey = '4-3-3' | '4-4-2' | '3-4-3' | '4-5-1' | '3-5-2';

export interface FormationDefinition {
  label: FormationKey;
  def: number;
  mid: number;
  fwd: number;
}
export type NewsCategory = 'GPL' | 'Black Stars' | 'AFCON' | 'Transfers';
export type EventType = 'goal' | 'yellow_card' | 'red_card' | 'substitution';
export type BadgeName = 'Prediction King' | 'Top Reactor' | 'Club Loyalist' | 'MOTM Master';

export interface Club {
  id: string;
  name: string;
  shortName: string;
  badgeUrl: string;
  city: string;
  stadium?: string;
  stadiumCapacity?: number;
}

export interface Match {
  id: string;
  homeClub: Club;
  awayClub: Club;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  kickoffTime: string;
  liveMinute?: number;
  venue: string;
  round: number;
  gameweek: number;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  type: EventType;
  minute: number;
  playerName: string;
  side: 'home' | 'away';
  assistPlayerName?: string;
  subOffPlayerName?: string;
}

export interface Player {
  id: string;
  name: string;
  clubId: string;
  club: Club;
  position: Position;
  price: number;
  photoUrl?: string;
}

export interface FantasyPlayer extends Player {
  isStarting: boolean;
  weekPoints: number;
}

export interface FantasyTeam {
  id: string;
  userId: string;
  teamName: string;
  players: FantasyPlayer[];
  captainId: string;
  totalPoints: number;
  weekPoints: number;
  overallRank: number;
  viceCaptainId?: string;
  startingPlayerIds?: string[];
  formation?: FormationKey;
  isLocked?: boolean;
  deadline?: string;
}

export interface Prediction {
  fixtureId: string;
  outcome: 'home' | 'draw' | 'away' | null;
  exactHomeGoals?: number;
  exactAwayGoals?: number;
  locked: boolean;
  submitted: boolean;
}

export interface Article {
  id: string;
  headline: string;
  body: string;
  thumbnailUrl: string;
  category: NewsCategory;
  source: string;
  publishedAt: string;
  author?: string;
  url: string;
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  category: NewsCategory;
  time: string;
}

export interface Reaction {
  id: string;
  matchId: string;
  userId: string;
  username: string;
  userClub: Club;
  text: string;
  likeCount: number;
  isLikedByMe: boolean;
  createdAt: string;
}

export interface ClubSubscription {
  clubId: string;
  club: Club;
  status: 'active' | 'cancelled' | 'expired';
  renewalDate: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  favouriteClub?: Club;
  fantasyRank?: number;
  predictionPoints: number;
  reactionsPosted: number;
  badges: BadgeName[];
  subscription?: ClubSubscription;
}

export interface Notification {
  id: string;
  type: 'goal' | 'fantasy' | 'prediction' | 'subscription' | 'general';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface Standing {
  position: number;
  club: Club;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

export interface LeaderboardEntry {
  rank: number;
  rankChange: number;
  userId: string;
  username: string;
  club: Club;
  totalPoints: number;
  weekPoints: number;
  isCurrentUser: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  onboardingComplete: boolean;
  isAuthenticated: boolean;
  splashKey: number;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetOnboarding: () => void;
  setFavouriteClub: (club: Club) => Promise<void>;
  completeOnboarding: () => void;
  loginDemo: () => Promise<void>;
}

export interface FantasyState {
  team: FantasyTeam | null;
  hasSquad: boolean;
  draftPlayers: FantasyPlayer[];
  draftCaptainId: string | null;
  draftViceCaptainId: string | null;
  draftStartingPlayerIds: string[];
  draftFormation: FormationKey;
  budget: number;
  loading: boolean;
  error: string | null;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  setCaptain: (playerId: string) => void;
  setViceCaptain: (playerId: string) => void;
  setStartingXI: (playerIds: string[]) => void;
  setFormation: (formation: FormationKey) => void;
  submitSquad: (teamName: string) => Promise<void>;
  lockTeamForGameweek: () => Promise<void>;
  unlockTeam: () => Promise<void>;
  resetDraft: () => void;
  clearError: () => void;
}

export interface PredictionState {
  predictions: Record<string, Prediction>;
  setPrediction: (fixtureId: string, outcome: Prediction['outcome']) => void;
  setExactScore: (fixtureId: string, home: number, away: number) => void;
  submitAll: (gameweek: number) => Promise<void>;
  reset: () => void;
}
