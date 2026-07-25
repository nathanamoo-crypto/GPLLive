export type MatchStatus = 'scheduled' | 'live' | 'finished';
export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';
export type FormationKey = '4-3-3' | '4-4-2' | '3-4-3' | '4-5-1' | '3-5-2';
export type ChipType = 'TripleCaptain' | 'BenchBoost' | 'Wildcard' | 'Wildcard2' | 'FreeHit';

export interface FormationDefinition {
  label: FormationKey;
  def: number;
  mid: number;
  fwd: number;
}

export type NewsCategory = 'GPL' | 'Black Stars' | 'AFCON' | 'Transfers';
export type BadgeName = 'Prediction King' | 'Top Reactor' | 'Club Loyalist' | 'MOTM Master';

export interface Club {
  id: number;
  name: string;
  shortName: string;
  slug: string;
  badgeUrl: string;
  logoUrl?: string;
  city: string;
  stadium?: string;
  stadiumCapacity?: number;
}

export interface Match {
  id: number;
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

export interface Player {
  id: number;
  name: string;
  clubId: number;
  position: Position;
  price: number;
  photoUrl?: string;
}

export interface SquadPlayerDTO {
  fantasyTeamPlayerId: number;
  playerId: number;
  playerName: string;
  clubId: number;
  position: Position;
  price: number;
  isStarting: boolean;
  isCaptain: boolean;
  isViceCaptain: boolean;
  weekPoints: number;
}

export interface FantasyPlayer extends Player {
  fantasyTeamPlayerId: number;
  isStarting: boolean;
  isCaptain: boolean;
  isViceCaptain: boolean;
  weekPoints: number;
}

export interface ChipStatus {
  tripleCaptain: boolean;
  benchBoost: boolean;
  wildcard: boolean;
  wildcard2: boolean;
  freeHit: boolean;
}

export interface FantasyTeam {
  teamId: number;
  userId: number;
  teamName: string;
  players: FantasyPlayer[];
  captainId: number | null;
  viceCaptainId: number | null;
  startingPlayerIds: number[];
  formation: string;
  chips: ChipStatus;
  totalPoints: number;
  gameweekPoints: number;
  rank: number;
  budget: number;
  // The backend's free-transfer bank (its field is called transferPoints -
  // 1 per gameweek, banked up to 2). Named freeTransfers here since
  // "transferCount" read like a count of transfers already made, which is
  // the opposite of what this number means.
  freeTransfers: number;
  isLocked: boolean;
  createdAt: string;
}

export interface Prediction {
  fixtureId: number;
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

export interface ClubSubscription {
  clubId: number;
  club: Club;
  status: 'active' | 'cancelled' | 'expired';
  renewalDate: string;
}

// A league table row, computed live by the backend from real recorded
// fixture results (see standingsService.ts) - `club` is this app's local
// Club (resolved by name from the backend's real club, same as fixtures),
// not a raw backend id.
export interface StandingRow {
  position: number;
  club: Club;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
  favouriteClub?: Club;
  fantasyRank?: number;
  predictionPoints: number;
  reactionsPosted: number;
  badges: BadgeName[];
  subscription?: ClubSubscription;
  // Premium (Paystack) subscription status - drives the crown badge next to
  // the username. Named isPremium (not `subscription`, already taken above
  // by the unrelated favourite-club-follow concept).
  isPremium?: boolean;
}

// GET /players/{id}/analysis - `premium` tells you whether the fields below
// it are populated; a free user gets everything down to totalAssists and
// premium===false, with the rest left undefined.
export interface PlayerAnalysis {
  id: number;
  fullName: string;
  photoUrl?: string;
  clubName: string;
  position: Position;
  currentPrice: number | null;
  totalPoints: number;
  totalGoals: number;
  totalAssists: number;
  premium: boolean;
  averagePoints?: number;
  recentForm?: { gameweek: number | null; points: number }[];
  trend?: 'IMPROVING' | 'DECLINING' | 'STABLE';
  insights?: string[];
}

export interface PremiumStatus {
  premium: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  expiresAt: string | null;
}

// Matches the real backend NotificationResponse (id/message/isRead/
// createdAt/type) - there is no separate title field, just one message, and
// the type enum is the backend's actual NotificationType (DEADLINE/RANK/
// GOAL/CAPTAIN), not the fictional 'goal'|'fantasy'|'prediction'|... set
// this used to have when the whole feature was hardcoded mock data.
export interface Notification {
  id: number;
  type: 'DEADLINE' | 'RANK' | 'GOAL' | 'CAPTAIN';
  message: string;
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
  userId: number;
  username: string;
  club: Club;
  totalPoints: number;
  weekPoints: number;
  isCurrentUser: boolean;
}

export interface Gameweek {
  gameweekId: number;
  seasonId: number;
  gameweekNumber: number;
  deadline: string;
  isActive: boolean;
  isFinished: boolean;
}

export interface FixtureResult {
  fixtureId: number;
  homeScore: number;
  awayScore: number;
  homePossession?: number;
  awayPossession?: number;
}

export interface PlayerPrice {
  playerId: number;
  price: number;
  gameweek: number;
  changedAt: string;
}

export interface ScoringStats {
  playerId: number;
  gameweek: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  goalsConceded: number;
  saves?: number;
  bonusPoints?: number;
  totalPoints: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  onboardingComplete: boolean;
  isAuthenticated: boolean;
  splashKey: number;
  login: (email: string, password: string) => Promise<void>;
  // Creates the account but does not log in - see verifyEmail(). username
  // must be unique; the backend returns a 409 if it's already taken.
  register: (username: string, fullName: string, email: string, password: string, favouriteClubId: number) => Promise<void>;
  // Confirms the emailed 6-digit code and completes login.
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerificationCode: (email: string) => Promise<void>;
  // idToken is the Google-issued ID token from expo-auth-session's Google
  // provider - verified server-side, never trusted as-is.
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  resetOnboarding: () => void;
  // Takes the backend's real club id + name (e.g. from clubService.fetchClubs()),
  // not this app's local/hardcoded Club - those use different, mismatched ids.
  setFavouriteClub: (club: { id: number; fullName: string }) => Promise<void>;
  completeOnboarding: () => void;
  loginDemo: () => Promise<void>;
}

export interface FantasyState {
  team: FantasyTeam | null;
  hasSquad: boolean;
  draftPlayers: FantasyPlayer[];
  draftCaptainId: number | null;
  draftViceCaptainId: number | null;
  draftStartingPlayerIds: number[];
  draftFormation: FormationKey;
  budget: number;
  loading: boolean;
  // Populated only while submitSquad() is running - each sequential backend
  // call (create team, add each of the 15 players, set lineup, set
  // captain/vice-captain) updates this so the UI can show real progress
  // instead of a plain spinner for what can be a 20+ round-trip operation.
  submitProgress: { label: string; current: number; total: number } | null;
  error: string | null;
  addPlayer: (player: Player) => { success: boolean; message?: string };
  removePlayer: (playerId: number) => void;
  setCaptain: (playerId: number) => void;
  setViceCaptain: (playerId: number) => void;
  setStartingXI: (playerIds: number[]) => void;
  setFormation: (formation: FormationKey) => void;
  submitSquad: (teamName: string) => Promise<void>;
  lockTeamForGameweek: () => Promise<void>;
  unlockTeam: () => Promise<void>;
  resetDraft: () => void;
  clearError: () => void;
}

export interface PredictionState {
  predictions: Record<string, Prediction>;
  setPrediction: (fixtureId: number, outcome: Prediction['outcome']) => void;
  setExactScore: (fixtureId: number, home: number, away: number) => void;
  submitAll: () => Promise<void>;
  reset: () => void;
}
