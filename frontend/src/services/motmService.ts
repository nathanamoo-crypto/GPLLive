import api from './api';
import { VOTE_URL, MOTMEndpoints } from '../constants/apiUrls';

export interface MotmCandidate {
  playerId: number;
  playerName: string;
  clubId: number;
  position: string;
}

export interface MotmCandidatesResponse {
  candidates: MotmCandidate[];
  hasVoted: boolean;
  votedPlayerId?: number;
}

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

export interface MotmResultsResponse {
  results: MotmResult[];
  totalVotes: number;
}

export async function getMotmCandidates(matchId: number, signal?: AbortSignal): Promise<MotmCandidatesResponse> {
  const { data } = await api.get<MotmCandidatesResponse>(
    `${MOTMEndpoints.VOTE}/${matchId}/candidates`,
    { baseURL: VOTE_URL, signal },
  );
  return data;
}

export async function submitMotmVote(matchId: number, playerId: number): Promise<MotmVoteResponse> {
  const { data } = await api.post<MotmVoteResponse>(
    `${MOTMEndpoints.VOTE}/${matchId}`,
    { playerId },
    { baseURL: VOTE_URL },
  );
  return data;
}

export async function getMotmResults(matchId: number, signal?: AbortSignal): Promise<MotmResultsResponse> {
  const { data } = await api.get<MotmResultsResponse>(
    `${MOTMEndpoints.VOTE}/${matchId}/results`,
    { baseURL: VOTE_URL, signal },
  );
  return data;
}
