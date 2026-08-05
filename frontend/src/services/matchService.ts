import api from './api';
import { MatchEndpoints, MATCH_URL } from '../constants/apiUrls';
import { Match, MatchStatus, FixtureResult, Club } from '../types';
import { backendClubToLocalClub } from './clubService';

function normalizeStatus(status: string): MatchStatus {
  const lower = (status ?? '').toLowerCase();
  if (lower === 'live' || lower === 'in_progress' || lower === 'playing') return 'live';
  if (lower === 'finished' || lower === 'completed') return 'finished';
  return 'scheduled';
}

// FixtureResponse only ever sends the club's real full name (homeClubName/
// awayClubName), never an id or object - resolve it to this app's local Club
// shape (badge/slug) via the same name mapping used for the club picker,
// rather than trusting any id, since local and backend club ids don't match.
function resolveFixtureClub(fullName: string | undefined): Club {
  const resolved = fullName ? backendClubToLocalClub(fullName) : null;
  if (resolved) return resolved;
  const name = fullName ?? 'Unknown Club';
  return {
    id: 0,
    name,
    shortName: name.length > 12 ? name.slice(0, 12) : name,
    slug: '',
    badgeUrl: '',
    city: '',
  };
}

function mapFixture(data: any): Match {
  return {
    id: data.id ?? data.fixtureId,
    homeClub: resolveFixtureClub(data.homeClubName ?? data.homeClub?.fullName),
    awayClub: resolveFixtureClub(data.awayClubName ?? data.awayClub?.fullName),
    homeScore: data.homeScore ?? null,
    awayScore: data.awayScore ?? null,
    status: normalizeStatus(data.fixtureStatus ?? data.status),
    kickoffTime: data.matchDate ?? data.kickoffTime ?? data.kickoff,
    liveMinute: data.liveMinute,
    venue: data.venue ?? '',
    round: data.gameweekNumber ?? data.gameweek ?? 0,
    gameweek: data.gameweekNumber ?? data.gameweek ?? 0,
    season: data.season,
    isDerby: data.isDerby ?? false,
  };
}

export async function getMatches(gameweekId?: number, status?: string, signal?: AbortSignal): Promise<Match[]> {
  let path: string;
  if (gameweekId != null) {
    path = `${MatchEndpoints.FIXTURES}/gameweek/${gameweekId}`;
  } else if (status) {
    const s = status.toLowerCase();
    if (s === 'live') path = `${MatchEndpoints.FIXTURES}/live`;
    else if (s === 'scheduled') path = `${MatchEndpoints.FIXTURES}/scheduled`;
    else if (s === 'finished') path = `${MatchEndpoints.FIXTURES}/finished`;
    else path = MatchEndpoints.FIXTURES;
  } else {
    path = MatchEndpoints.FIXTURES;
  }

  const { data } = await api.get<any[]>(path, { baseURL: MATCH_URL, signal });
  return (data ?? []).map(mapFixture);
}

export async function getMatchDetails(id: number, signal?: AbortSignal): Promise<Match | null> {
  try {
    const { data } = await api.get<any>(`${MatchEndpoints.FIXTURES}/${id}`, { baseURL: MATCH_URL, signal });
    return mapFixture(data);
  } catch (err: any) {
    if (err.response?.status === 404) return null;
    throw err;
  }
}

// mapFixture() above resolves club names down to this app's LOCAL club ids
// (via name->slug->local id), discarding the backend's real club id/name in
// the process - fine for display, but useless for calling anything that
// needs the real id (e.g. GET /players/club/{clubId}). This returns the raw
// backend names straight off FixtureResponse instead, so callers can match
// them against fetchClubs() (which has real id + the same exact fullName)
// to recover the real ids.
export async function getFixtureClubNames(
  fixtureId: number,
  signal?: AbortSignal,
): Promise<{ homeClubName: string; awayClubName: string } | null> {
  try {
    const { data } = await api.get<any>(`${MatchEndpoints.FIXTURES}/${fixtureId}`, { baseURL: MATCH_URL, signal });
    return {
      homeClubName: data.homeClubName,
      awayClubName: data.awayClubName,
    };
  } catch (err: any) {
    if (err.response?.status === 404) return null;
    throw err;
  }
}

export async function getFixtureResults(fixtureId: number, signal?: AbortSignal): Promise<FixtureResult | null> {
  try {
    const { data } = await api.get<FixtureResult>(
      `${MatchEndpoints.FIXTURE_RESULTS}/${fixtureId}`,
      { baseURL: MATCH_URL, signal },
    );
    return data;
  } catch (err: any) {
    if (err.response?.status === 404) return null;
    throw err;
  }
}
