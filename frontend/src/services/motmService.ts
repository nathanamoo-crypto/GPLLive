import api from './api';
import { VOTE_URL, MOTMEndpoints } from '../constants/apiUrls';

export interface MotmVoteResponse {
  success: boolean;
}

export interface MotmResult {
  playerId: number;
  playerName: string;
  clubId: number;
  votes: number;
  percentage: number;
}

export interface MotmVotesResponse {
  results: MotmResult[];
  totalVotes: number;
}

export async function getMotmVotes(fixtureId: number, signal?: AbortSignal): Promise<MotmVotesResponse> {
  const { data } = await api.get<MotmVotesResponse>(
    `${MOTMEndpoints.VOTE}/${fixtureId}`,
    { baseURL: VOTE_URL, signal },
  );
  return data;
}

export async function submitMotmVote(fixtureId: number, playerId: number): Promise<MotmVoteResponse> {
  const { data } = await api.post<MotmVoteResponse>(
    MOTMEndpoints.VOTE,
    { fixtureId, playerId },
    { baseURL: VOTE_URL },
  );
  return data;
}
