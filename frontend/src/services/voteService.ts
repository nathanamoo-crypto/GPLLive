import { voteApi } from '../api/api';

// POST /votes/motm/:matchId
export const castMotmVote = async (matchId: string) => {
  const response = await voteApi.post(/votes/motm/${matchId});
  return response.data;
};

// GET /votes/motm/:matchId
export const getMotmVotes = async (matchId: string) => {
  const response = await voteApi.get(/votes/motm/${matchId});
  return response.data;
};
