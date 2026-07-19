import api from './api';
import { FantasyEndpoints } from '../constants/apiUrls';
import type {
  Player, SquadPlayerDTO, FantasyTeam, ChipType,
  ScoringStats, PlayerPrice, Gameweek,
} from '../types';

function mapSquadToFantasyTeam(data: any): FantasyTeam {
  const squad: SquadPlayerDTO[] = (data.squad ?? []).map((s: any) => ({
    fantasyTeamPlayerId: s.fantasyTeamPlayerId,
    playerId: s.playerId,
    playerName: s.playerName,
    clubId: s.clubId,
    position: s.position,
    price: s.price,
    isStarting: s.isStarting ?? false,
    isCaptain: s.isCaptain ?? false,
    isViceCaptain: s.isViceCaptain ?? false,
    weekPoints: s.weekPoints ?? 0,
  }));

  const players: FantasyTeam['players'] = squad.map((s) => ({
    id: s.playerId,
    name: s.playerName,
    clubId: s.clubId,
    position: s.position as any,
    price: s.price,
    fantasyTeamPlayerId: s.fantasyTeamPlayerId,
    isStarting: s.isStarting,
    isCaptain: s.isCaptain,
    isViceCaptain: s.isViceCaptain,
    weekPoints: s.weekPoints,
  }));

  const captainEntry = squad.find((s) => s.isCaptain);
  const viceCaptainEntry = squad.find((s) => s.isViceCaptain && !s.isCaptain);
  const startingIds = squad.filter((s) => s.isStarting).map((s) => s.playerId);

  return {
    teamId: data.teamId ?? data.team_id ?? 0,
    userId: data.userId ?? data.user_id ?? 0,
    teamName: data.teamName ?? data.team_name ?? '',
    players,
    captainId: captainEntry?.playerId ?? null,
    viceCaptainId: viceCaptainEntry?.playerId ?? null,
    startingPlayerIds: startingIds,
    formation: data.formation ?? '4-3-3',
    chips: data.chips ?? { tripleCaptain: false, benchBoost: false, wildcard: false, wildcard2: false, freeHit: false },
    totalPoints: data.totalPoints ?? data.total_points ?? 0,
    gameweekPoints: data.gameweekPoints ?? data.gameweek_points ?? 0,
    rank: data.rank ?? 0,
    budget: data.budget ?? 100,
    transferCount: data.transferCount ?? data.transfer_count ?? 0,
    isLocked: data.isLocked ?? data.is_locked ?? false,
    createdAt: data.createdAt ?? data.created_at ?? '',
  };
}

export async function fetchPlayers(position?: string, signal?: AbortSignal): Promise<Player[]> {
  const params = position ? `?position=${position}` : '';
  const { data } = await api.get<any[]>(`${FantasyEndpoints.PLAYERS}${params}`, { signal });
  return (data ?? []).map((p: any) => ({
    id: p.playerId ?? p.id,
    name: p.name,
    clubId: p.clubId ?? p.club_id,
    position: p.position,
    price: p.price,
    photoUrl: p.photoUrl ?? p.photo_url,
  }));
}

export async function getMyTeam(signal?: AbortSignal): Promise<FantasyTeam | null> {
  try {
    const { data } = await api.get<any>(FantasyEndpoints.MY_TEAM, { signal });
    return mapSquadToFantasyTeam(data);
  } catch (err: any) {
    if (err.response?.status === 404) return null;
    throw err;
  }
}

export async function createTeam(teamName: string): Promise<FantasyTeam> {
  const { data } = await api.post<any>(FantasyEndpoints.CREATE_TEAM, { teamName });
  return mapSquadToFantasyTeam(data);
}

export async function addPlayerToSquad(playerId: number): Promise<void> {
  await api.post(FantasyEndpoints.SQUAD_ADD, { playerId });
}

export async function removePlayerFromSquad(fantasyTeamPlayerId: number): Promise<void> {
  await api.delete(`${FantasyEndpoints.SQUAD_REMOVE}/${fantasyTeamPlayerId}`);
}

export async function setLineup(fantasyTeamPlayerIds: number[]): Promise<void> {
  await api.put(FantasyEndpoints.SQUAD_LINEUP, { fantasyTeamPlayerIds });
}

export async function setCaptain(fantasyTeamPlayerId: number): Promise<void> {
  await api.put(FantasyEndpoints.SQUAD_CAPTAIN, { fantasyTeamPlayerId });
}

export async function setViceCaptain(fantasyTeamPlayerId: number): Promise<void> {
  await api.put(FantasyEndpoints.SQUAD_VICE_CAPTAIN, { fantasyTeamPlayerId });
}

export async function toggleBench(fantasyTeamPlayerId: number): Promise<void> {
  await api.put(`${FantasyEndpoints.SQUAD_BENCH_TOGGLE}/${fantasyTeamPlayerId}`);
}

export async function makeTransfer(outPlayerId: number, inPlayerId: number): Promise<{ budget: number; transferCount: number }> {
  const { data } = await api.post<{ budget: number; transferCount: number }>(
    FantasyEndpoints.TRANSFERS, { outPlayerId, inPlayerId },
  );
  return data;
}

export async function activateChip(chipType: ChipType): Promise<void> {
  await api.post(`${FantasyEndpoints.CHIPS_ACTIVATE}/${chipType}/activate`);
}

export async function deactivateChip(chipType: ChipType): Promise<void> {
  await api.delete(`${FantasyEndpoints.CHIPS_DEACTIVATE}/${chipType}`);
}

export async function getPlayerStats(gameweek: number, signal?: AbortSignal): Promise<ScoringStats[]> {
  const { data } = await api.get<ScoringStats[]>(
    `${FantasyEndpoints.SCORING_PLAYER_STATS}?gameweek=${gameweek}`,
    { signal },
  );
  return data ?? [];
}

export async function getPlayerScoringHistory(playerId: number, signal?: AbortSignal): Promise<ScoringStats[]> {
  const { data } = await api.get<ScoringStats[]>(
    `${FantasyEndpoints.SCORING_HISTORY_PLAYER}/${playerId}`,
    { signal },
  );
  return data ?? [];
}

export async function getTeamScoringHistory(teamId: number, signal?: AbortSignal): Promise<any[]> {
  const { data } = await api.get<any[]>(
    `${FantasyEndpoints.SCORING_HISTORY_TEAM}/${teamId}`,
    { signal },
  );
  return data ?? [];
}

export async function calculateScores(gameweek: number): Promise<void> {
  await api.post(`${FantasyEndpoints.SCORING_CALCULATE}/${gameweek}`);
}

export async function getPlayerPriceHistory(playerId: number, signal?: AbortSignal): Promise<PlayerPrice[]> {
  const { data } = await api.get<PlayerPrice[]>(
    `${FantasyEndpoints.PLAYER_PRICE}/${playerId}`,
    { signal },
  );
  return data ?? [];
}

export async function getGameweeks(signal?: AbortSignal): Promise<Gameweek[]> {
  const { data } = await api.get<any[]>('/gameweeks', { signal });
  return (data ?? []).map((g: any) => ({
    gameweekId: g.gameweekId ?? g.gameweek_id ?? g.id,
    seasonId: g.seasonId ?? g.season_id,
    gameweekNumber: g.gameweekNumber ?? g.gameweek_number ?? g.gameweek,
    deadline: g.deadline,
    isActive: g.isActive ?? g.is_active ?? false,
    isFinished: g.isFinished ?? g.is_finished ?? false,
  }));
}

export async function lockTeamForGameweek(): Promise<void> {
  await api.post('/fantasy-teams/lock');
}

export async function unlockTeam(): Promise<void> {
  await api.delete('/fantasy-teams/lock');
}
