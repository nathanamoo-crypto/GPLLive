export const AUTH_URL = 'http://localhost:8081';
export const MATCH_URL = 'http://localhost:8082';
export const FANTASY_URL = 'http://localhost:8083';
export const VOTE_URL = 'http://localhost:8084';
export const PREDICT_URL = 'http://localhost:8085';
export const NOTIFICATION_URL = 'http://localhost:8086';
export const DISCUSSION_URL = 'http://localhost:8087';

export const AuthEndpoints = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  GET_ME: '/auth/users/me',
  UPDATE_ME: '/auth/users/me',
};

export const FantasyEndpoints = {
  PLAYERS: '/players',
  MY_TEAM: '/fantasy-teams/my-team',
  CREATE_TEAM: '/fantasy-teams',
  SQUAD_ADD: '/squad',
  SQUAD_REMOVE: '/squad/remove',
  SQUAD_LINEUP: '/squad/lineup',
  SQUAD_CAPTAIN: '/squad/captain',
  SQUAD_VICE_CAPTAIN: '/squad/vice-captain',
  SQUAD_BENCH_TOGGLE: '/squad/bench/toggle',
  TRANSFERS: '/transfers',
  CHIPS_ACTIVATE: '/chips',
  CHIPS_DEACTIVATE: '/chips',
  SCORING_PLAYER_STATS: '/scoring/stats',
  SCORING_CALCULATE: '/scoring/calculate-all',
  SCORING_HISTORY_PLAYER: '/scoring/history',
  SCORING_HISTORY_TEAM: '/scoring/history',
  PLAYER_PRICE: '/player-price',
};

export const MatchEndpoints = {
  FIXTURES: '/fixtures',
  FIXTURE_RESULTS: '/fixture-results',
  FIXTURE_LINEUPS: '/fixtures/{id}/lineups',
};

export const PredictionEndpoints = {
  SUBMIT: '/predictions',
};

export const DiscussionEndpoints = {
  MESSAGES: '/discussion',
};

export const MOTMEndpoints = {
  VOTE: '/motmVotes',
};

export const NotificationEndpoints = {
  REGISTER: '/notifications/register',
  SEND: '/notifications/send',
};
