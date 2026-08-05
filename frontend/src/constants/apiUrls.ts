// The backend (gplFantasyLeaague) is currently ONE Spring Boot app (not
// separate microservices) - all service URLs below point at that one app.
//
// Default: the shared backend deployed on Render, so every teammate's app
// talks to the same server + database with zero per-machine setup. Once
// you've deployed (see DEPLOYMENT.md in the backend repo), replace the
// placeholder below with the real https://your-app-name.onrender.com URL
// Render gives you - commit that change, and the whole team picks it up on
// their next pull.
//
// Local override: if you're running the backend on your own machine (e.g.
// testing an in-progress backend change before it's deployed), create a
// git-ignored `.env.local` file in this project's root with:
//   EXPO_PUBLIC_API_HOST=http://<your-computer's-LAN-IP>:8080
// (use your LAN IP, not "localhost" - a physical phone can't resolve that
// as your dev machine). Expo picks this up automatically, no code change.
const API_HOST = process.env.EXPO_PUBLIC_API_HOST ?? 'https://gpllivebackend.onrender.com';

export const AUTH_URL = API_HOST;
export const MATCH_URL = API_HOST;
export const FANTASY_URL = API_HOST;
export const VOTE_URL = API_HOST;
export const PREDICT_URL = API_HOST;
export const NOTIFICATION_URL = API_HOST;
export const DISCUSSION_URL = API_HOST;
export const NEWS_URL = API_HOST;
export const STANDINGS_URL = API_HOST;
export const SUBSCRIPTION_URL = API_HOST;
export const PAYMENT_URL = API_HOST;
export const LEAGUE_URL = API_HOST;

export const AuthEndpoints = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY_EMAIL: '/auth/verify-email',
  RESEND_VERIFICATION: '/auth/resend-verification',
  GET_ME: '/auth/users/me',
  UPDATE_ME: '/auth/users/me',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
};

export const FantasyEndpoints = {
  PLAYERS: '/players',
  MY_TEAM: '/fantasy-teams/my-team',
  CREATE_TEAM: '/fantasy-teams',
  DELETE_TEAM: '/fantasy-teams/me',
  SQUAD_ADD: '/squad',
  SQUAD_REMOVE: '/squad/remove',
  SQUAD_LINEUP: '/squad/lineup',
  // Backend shape is PATCH /squad/{fantasyTeamPlayerId}/captain (id in the
  // path, no body) - these are just the base for building that path.
  SQUAD_BASE: '/squad',
  TRANSFERS: '/transfers',
  SCORING_CALCULATE: '/scoring/calculate-all',
  SCORING_HISTORY_TEAM: '/scoring/history',
  SCORING_FIXTURE: '/scoring/fixture',
  PLAYER_PRICE: '/player-price',
  GAMEWEEK_CURRENT: '/gameweeks/current',
  // season is a query param on this one (?season=2026%2F2027), not a path
  // segment - see GameweekController's comment on why.
  GAMEWEEK_BY_SEASON: '/gameweeks/season',
  // Every season that has any gameweek data, oldest first.
  GAMEWEEK_SEASONS: '/gameweeks/seasons',
};

// Backend has no generic "/chips/{type}/activate" route - each chip is its
// own named endpoint (see ChipController). Cancelling is the one shared
// route, DELETE /chips/{fantasyTeamId}/{gameweekId} - only works for
// Bench Boost/Triple Captain and only before the Gameweek deadline, same
// rule the real FPL uses (see ChipService.cancelChip).
export const ChipEndpoints: Record<
  'TripleCaptain' | 'BenchBoost' | 'Wildcard' | 'Wildcard2' | 'FreeHit',
  string
> = {
  TripleCaptain: '/chips/triple-captain',
  BenchBoost: '/chips/bench-boost',
  Wildcard: '/chips/wildcard',
  Wildcard2: '/chips/wildcard2',
  FreeHit: '/chips/free-hit',
};

export const CHIP_CANCEL_URL = '/chips';

export const MatchEndpoints = {
  FIXTURES: '/fixtures',
  FIXTURE_RESULTS: '/fixture-results',
  FIXTURE_LINEUPS: '/fixtures/{id}/lineups',
};

export const PredictionEndpoints = {
  SUBMIT: '/predictions',
  ME: '/predictions/me',
  LEADERBOARD: '/predictions/leaderboard',
};

export const DiscussionEndpoints = {
  MESSAGES: '/discussion',
};

export const MOTMEndpoints = {
  VOTE: '/motmVotes',
};

export const NotificationEndpoints = {
  LIST: '/notifications',
  UNREAD: '/notifications/unread',
  // Append /{id} when calling this.
  MARK_READ: '/notifications/marked-as-read-notification',
  MARK_ALL_READ: '/notifications/mark-all-as-read',
};

export const NewsEndpoints = {
  LATEST: '/news',
};

export const StandingsEndpoints = {
  TABLE: '/standings',
};

export const SubscriptionEndpoints = {
  ME: '/subscriptions/me',
};

export const PaymentEndpoints = {
  INITIALIZE: '/payments/initialize',
  // Append /{reference} when calling this.
  VERIFY: '/payments/verify',
};

export const LeagueEndpoints = {
  CREATE: '/leagues',
  SEARCH: '/leagues/search',
  MINE: '/leagues/mine',
  // Append /{id} when calling this.
  DETAIL: '/leagues',
  // Append /{id}/join.
  JOIN_BY_ID: '/leagues',
  // Append /{code}.
  JOIN_BY_CODE: '/leagues/join',
  // Append /{id}/members.
  MEMBERS: '/leagues',
  // Append /{id}/requests.
  REQUESTS: '/leagues',
  // Append /{id}/leaderboard/predictions or /{id}/leaderboard/fantasy.
  LEADERBOARD: '/leagues',
};
