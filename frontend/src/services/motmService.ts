import api from './api';
import { VOTE_URL } from '../constants/apiUrls';

export const MOTMEndpoints = {
  GET_CANDIDATES: '/votes/motm/:matchId/candidates',
  SUBMIT_VOTE: '/votes/motm/:matchId',
  GET_RESULTS: '/votes/motm/:matchId/results',
};

// ─────────────────────────────────────────────────────────────────────────────
// ASSUMED RESPONSE SHAPES — flag if backend contract differs.
// The backend vote-service has not been confirmed end-to-end; these types
// are inferred from the apiUrls.ts comments and typical REST conventions.
// ─────────────────────────────────────────────────────────────────────────────

export interface MotmCandidate {
  playerId: string;
  playerName: string;
  clubId: string;
  position: string;
}

export interface MotmCandidatesResponse {
  candidates: MotmCandidate[];
  /** ASSUMED: backend returns hasVoted flag. If absent, client infers
   *  from whether results are non-empty — flag if this is the case. */
  hasVoted: boolean;
  votedPlayerId?: string;
}

export interface MotmVoteResponse {
  success: boolean;
}

export interface MotmResult {
  playerId: string;
  playerName: string;
  clubId: string;
  votes: number;
  percentage: number;
}

export interface MotmResultsResponse {
  results: MotmResult[];
  totalVotes: number;
}

function resolvePath(template: string, matchId: string): string {
  return template.replace(':matchId', matchId);
}

export async function getMotmCandidates(matchId: string, signal?: AbortSignal): Promise<MotmCandidatesResponse> {
  const { data } = await api.get<MotmCandidatesResponse>(
    resolvePath(MOTMEndpoints.GET_CANDIDATES, matchId),
    { baseURL: VOTE_URL, signal },
  );
  return data;
}

export async function submitMotmVote(matchId: string, playerId: string): Promise<MotmVoteResponse> {
  const { data } = await api.post<MotmVoteResponse>(
    resolvePath(MOTMEndpoints.SUBMIT_VOTE, matchId),
    { playerId },
    { baseURL: VOTE_URL },
  );
  return data;
}

export async function getMotmResults(matchId: string, signal?: AbortSignal): Promise<MotmResultsResponse> {
  const { data } = await api.get<MotmResultsResponse>(
    resolvePath(MOTMEndpoints.GET_RESULTS, matchId),
    { baseURL: VOTE_URL, signal },
  );
  return data;
}
