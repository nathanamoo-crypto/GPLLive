import { Player, FantasyTeam, FormationKey } from '../types';
import { FANTASY_URL } from '../constants/apiUrls';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${FANTASY_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(body || `Request failed (${res.status})`);
  }
  return res.json();
}

export const fetchPlayers = async (position?: string, signal?: AbortSignal): Promise<Player[]> => {
  const params = position ? `?position=${position}` : '';
  return request<Player[]>(`/fantasy/players${params}`, { signal });
};

export interface SaveSquadPayload {
  teamName: string;
  badgeId?: string;
  captainId: string;
  viceCaptainId?: string;
  startingPlayerIds: string[];
  formation: FormationKey;
  playerIds: string[];
}

export const saveFantasySquad = async (data: SaveSquadPayload): Promise<{ team: FantasyTeam }> => {
  return request<{ team: FantasyTeam }>('/fantasy/team', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const lockTeamForGameweek = async (): Promise<{ team: FantasyTeam }> => {
  return request<{ team: FantasyTeam }>('/fantasy/team/lock', {
    method: 'POST',
  });
};

export const unlockTeam = async (): Promise<{ team: FantasyTeam }> => {
  return request<{ team: FantasyTeam }>('/fantasy/team/lock', {
    method: 'DELETE',
  });
};
