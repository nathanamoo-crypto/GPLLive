import { predictionApi } from '../api/api';

// GET /predictions/fixtures?gameweek=N
export const getPredictionFixtures = async (gameweek?: number) => {
  const response = await predictionApi.get('/predictions/fixtures', {
    params: { gameweek },
  });
  return response.data;
};

// POST /predictions
export const submitPredictions = async (data: {
  gameweek: number;
  predictions: {
    fixtureId: string;
    outcome: string;
    exactHomeGoals?: number;
    exactAwayGoals?: number;
  }[];
}) => {
  const response = await predictionApi.post('/predictions', data);
  return response.data;
};

// GET /predictions/leaderboard?page=1&limit=50
export const getPredictionLeaderboard = async (page = 1, limit = 50) => {
  const response = await predictionApi.get('/predictions/leaderboard', {
    params: { page, limit },
  });
  return response.data;
};
