import api from './api';
import { StandingsEndpoints, STANDINGS_URL } from '../constants/apiUrls';
import { backendClubToLocalClub } from './clubService';
import type { Club, StandingRow } from '../types';

// Backend's StandingRowResponse shape (domain/standings/dto/StandingRowResponse.java):
// position, clubId, clubName, shortName, played, won, drawn, lost, goalsFor,
// goalsAgainst, goalDifference, points. It's computed live from finished
// fixtures already in the DB (see StandingsService.java) - no external API,
// no hardcoded rows - so this always reflects whatever's actually been
// recorded, current season or a future one.

// Same reasoning as matchService's resolveFixtureClub: the backend only
// ever sends the club's real full name, never an id that lines up with this
// app's local club list (confirmed mismatched previously - see
// clubService.ts) - resolve by name via the same mapping used for fixtures.
function resolveStandingClub(fullName: string): Club {
  const resolved = backendClubToLocalClub(fullName);
  if (resolved) return resolved;
  return {
    id: 0,
    name: fullName,
    shortName: fullName.length > 12 ? fullName.slice(0, 12) : fullName,
    slug: '',
    badgeUrl: '',
    city: '',
  };
}

function mapRow(raw: any): StandingRow {
  return {
    position: raw.position,
    club: resolveStandingClub(raw.clubName),
    played: raw.played,
    won: raw.won,
    drawn: raw.drawn,
    lost: raw.lost,
    goalsFor: raw.goalsFor,
    goalsAgainst: raw.goalsAgainst,
    goalDifference: raw.goalDifference,
    points: raw.points,
  };
}

export interface Standings {
  season: string;
  rows: StandingRow[];
}

// season is optional - omitted lets the backend pick (current gameweek's
// season, or the most recently-ended one if none is flagged current).
export async function fetchStandings(season?: string, signal?: AbortSignal): Promise<Standings> {
  const { data } = await api.get<any>(StandingsEndpoints.TABLE, {
    baseURL: STANDINGS_URL,
    signal,
    params: season ? { season } : undefined,
  });
  return {
    season: data?.season ?? '',
    rows: (data?.standings ?? []).map(mapRow),
  };
}
