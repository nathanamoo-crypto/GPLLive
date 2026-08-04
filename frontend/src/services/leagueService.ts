import api from './api';
import { LEAGUE_URL, LeagueEndpoints } from '../constants/apiUrls';
import { League, LeagueLeaderboardEntry, LeagueMember } from '../types';

// Backend's LeagueResponse (domain/league/dtos/LeagueResponse.java).
function mapLeague(data: any): League {
  return {
    id: data.id,
    name: data.name,
    isPublic: !!data.isPublic,
    inviteCode: data.inviteCode ?? null,
    memberLimit: data.memberLimit,
    activeMemberCount: data.activeMemberCount ?? 0,
    creatorUsername: data.creatorUsername,
    createdAt: data.createdAt,
    callerStatus: data.callerStatus ?? 'NONE',
  };
}

function mapMember(data: any): LeagueMember {
  return {
    userId: data.userId,
    username: data.username,
    status: data.status,
    requestedAt: data.requestedAt,
  };
}

function mapLeaderboardEntry(data: any): LeagueLeaderboardEntry {
  return {
    rank: data.rank,
    userId: data.userId,
    username: data.username,
    points: data.points ?? 0,
    streak: data.streak ?? null,
  };
}

export interface CreateLeagueInput {
  name: string;
  isPublic: boolean;
  memberLimit?: number;
}

export async function createLeague(input: CreateLeagueInput): Promise<League> {
  const { data } = await api.post(LeagueEndpoints.CREATE, input, { baseURL: LEAGUE_URL });
  return mapLeague(data);
}

// Blank/omitted query returns every league (public AND private) - the
// Search screen's "browse" state before the user types anything. Private
// leagues are discoverable by name here too - joining one still requires
// the creator's approval, see joinLeagueById below.
export async function searchLeagues(query?: string, signal?: AbortSignal): Promise<League[]> {
  const { data } = await api.get<any[]>(LeagueEndpoints.SEARCH, {
    baseURL: LEAGUE_URL,
    params: query ? { query } : undefined,
    signal,
  });
  return (data ?? []).map(mapLeague);
}

export async function getMyLeagues(signal?: AbortSignal): Promise<League[]> {
  const { data } = await api.get<any[]>(LeagueEndpoints.MINE, { baseURL: LEAGUE_URL, signal });
  return (data ?? []).map(mapLeague);
}

export async function getLeague(id: number, signal?: AbortSignal): Promise<League> {
  const { data } = await api.get(`${LeagueEndpoints.DETAIL}/${id}`, { baseURL: LEAGUE_URL, signal });
  return mapLeague(data);
}

// Works for either kind of league - ACTIVE immediately if public, PENDING
// (awaiting the creator) if private. Used from a search result or the
// league detail screen's Join button.
export async function joinLeagueById(id: number): Promise<League> {
  const { data } = await api.post(`${LeagueEndpoints.JOIN_BY_ID}/${id}/join`, null, { baseURL: LEAGUE_URL });
  return mapLeague(data);
}

// Works for either kind of league - ACTIVE immediately if public, PENDING
// (awaiting the creator) if private.
export async function joinLeagueByCode(code: string): Promise<League> {
  const { data } = await api.post(
    `${LeagueEndpoints.JOIN_BY_CODE}/${encodeURIComponent(code.trim().toUpperCase())}`,
    null,
    { baseURL: LEAGUE_URL },
  );
  return mapLeague(data);
}

export async function getLeagueMembers(id: number, signal?: AbortSignal): Promise<LeagueMember[]> {
  const { data } = await api.get<any[]>(`${LeagueEndpoints.MEMBERS}/${id}/members`, { baseURL: LEAGUE_URL, signal });
  return (data ?? []).map(mapMember);
}

// Owner-only - who's waiting to be let into a private league.
export async function getPendingRequests(id: number, signal?: AbortSignal): Promise<LeagueMember[]> {
  const { data } = await api.get<any[]>(`${LeagueEndpoints.REQUESTS}/${id}/requests`, { baseURL: LEAGUE_URL, signal });
  return (data ?? []).map(mapMember);
}

export async function acceptJoinRequest(leagueId: number, userId: number): Promise<void> {
  await api.patch(`${LeagueEndpoints.REQUESTS}/${leagueId}/requests/${userId}/accept`, null, { baseURL: LEAGUE_URL });
}

export async function rejectJoinRequest(leagueId: number, userId: number): Promise<void> {
  await api.patch(`${LeagueEndpoints.REQUESTS}/${leagueId}/requests/${userId}/reject`, null, { baseURL: LEAGUE_URL });
}

// Self-leave. The backend blocks the creator from leaving their own league
// this way - they have to delete it instead (deleteLeague below).
export async function leaveLeague(id: number): Promise<void> {
  await api.delete(`${LeagueEndpoints.DETAIL}/${id}/membership`, { baseURL: LEAGUE_URL });
}

export async function deleteLeague(id: number): Promise<void> {
  await api.delete(`${LeagueEndpoints.DETAIL}/${id}`, { baseURL: LEAGUE_URL });
}

export async function getLeaguePredictionLeaderboard(id: number, signal?: AbortSignal): Promise<LeagueLeaderboardEntry[]> {
  const { data } = await api.get<any[]>(`${LeagueEndpoints.LEADERBOARD}/${id}/leaderboard/predictions`, {
    baseURL: LEAGUE_URL,
    signal,
  });
  return (data ?? []).map(mapLeaderboardEntry);
}

export async function getLeagueFantasyLeaderboard(id: number, signal?: AbortSignal): Promise<LeagueLeaderboardEntry[]> {
  const { data } = await api.get<any[]>(`${LeagueEndpoints.LEADERBOARD}/${id}/leaderboard/fantasy`, {
    baseURL: LEAGUE_URL,
    signal,
  });
  return (data ?? []).map(mapLeaderboardEntry);
}
