import { matchApi } from '../api/api';

// GET /matches?status=live|scheduled|ft&gameweek=N
export const getMatches = async (status?: string, gameweek?: number) => {
  const response = await matchApi.get('/matches', {
    params: { status, gameweek },
  });
  return response.data;
};

// GET /matches/:id
export const getMatchById = async (matchId: string) => {
  const response = await matchApi.get(/matches/${matchId});
  return response.data;
};

// GET /matches/live
export const getLiveMatches = async () => {
  const response = await matchApi.get('/matches/live');
  return response.data;
};

// GET /standings?gameweek=N
export const getStandings = async (gameweek?: number) => {
  const response = await matchApi.get('/standings', {
    params: { gameweek },
  });
  return response.data;
};
