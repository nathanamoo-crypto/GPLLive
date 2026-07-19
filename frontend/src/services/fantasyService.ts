import { fantasyApi } from '../api/api';

// GET /fantasy/players?position=GK|DEF|MID|FWD
export const getPlayers = async (position?: string) => {
  const response = await fantasyApi.get('/fantasy/players', {
    params: { position },
  });
  return response.data;
};

// POST /fantasy/team
export const createTeam = async (teamData: {
  teamName: string;
  badgeId?: string;
  captainId: string;
  viceCaptainId?: string;
  startingPlayerIds: string[];
  formation: string;
  playerIds: string[];
}) => {
  const response = await fantasyApi.post('/fantasy/team', teamData);
  return response.data;
};

// GET /fantasy/team
export const getMyTeam = async () => {
  const response = await fantasyApi.get('/fantasy/team');
  return response.data;
};

// PUT /fantasy/team/lineup
export const updateLineup = async (lineupData: {
  startingPlayerIds: string[];
  captainId: string;
  viceCaptainId?: string;
  formation: string;
}) => {
  const response = await fantasyApi.put('/fantasy/team/lineup', lineupData);
  return response.data;
};

// POST /fantasy/team/lock
export const lockTeam = async () => {
  const response = await fantasyApi.post('/fantasy/team/lock');
  return response.data;
};

// GET /fantasy/leaderboard?page=1&limit=50
export const getFantasyLeaderboard = async (page = 1, limit = 50) => {
  const response = await fantasyApi.get('/fantasy/leaderboard', {
    params: { page, limit },
  });
  return response.data;
};

// GET /fantasy/leagues
export const getLeagues = async () => {
  const response = await fantasyApi.get('/fantasy/leagues');
  return response.data;
};

// POST /fantasy/leagues
export const createLeague = async (name: string, code: string) => {
  const response = await fantasyApi.post('/fantasy/leagues', { name, code });
  return response.data;
};

// POST /fantasy/leagues/join
export const joinLeague = async (code: string) => {
  const response = await fantasyApi.post('/fantasy/leagues/join', { code });
  return response.data;
};
