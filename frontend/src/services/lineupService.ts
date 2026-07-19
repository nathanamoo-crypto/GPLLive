import api from './api';
import { MATCH_URL, MatchEndpoints } from '../constants/apiUrls';

export interface LineupPlayer {
  playerId: number;
  playerName: string;
  position: string;
  jerseyNumber: number;
  clubId: number;
}

export interface FixtureLineups {
  fixtureId: number;
  homeTeam: {
    teamId: number;
    name: string;
    startingXI: LineupPlayer[];
    substitutes: LineupPlayer[];
  };
  awayTeam: {
    teamId: number;
    name: string;
    startingXI: LineupPlayer[];
    substitutes: LineupPlayer[];
  };
}

export async function getFixtureLineups(fixtureId: number, signal?: AbortSignal): Promise<FixtureLineups> {
  const endpoint = MatchEndpoints.FIXTURE_LINEUPS.replace('{id}', String(fixtureId));
  const { data } = await api.get<FixtureLineups>(endpoint, { baseURL: MATCH_URL, signal });
  return data;
}
