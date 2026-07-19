import api from './api';
import { MatchEndpoints, MATCH_URL } from '../constants/apiUrls';
import { Match, MatchStatus, FixtureResult } from '../types';

function normalizeStatus(status: string): MatchStatus {
  const lower = status.toLowerCase();
  if (lower === 'live' || lower === 'in_progress' || lower === 'playing') return 'live';
  if (lower === 'finished' || lower === 'completed') return 'finished';
  return 'scheduled';
}

function mapFixture(data: any): Match {
  return {
    id: data.fixtureId ?? data.id,
    homeClub: data.homeClub ?? data.home_club ?? data.homeTeam ?? data.home_team,
    awayClub: data.awayClub ?? data.away_club ?? data.awayTeam ?? data.away_team,
    homeScore: data.homeScore ?? data.home_score ?? null,
    awayScore: data.awayScore ?? data.away_score ?? null,
    status: normalizeStatus(data.status ?? data.fixtureStatus),
    kickoffTime: data.kickoffTime ?? data.kickoff_time ?? data.kickoff ?? data.matchDate,
    liveMinute: data.liveMinute ?? data.live_minute,
    venue: data.venue ?? data.stadium ?? '',
    round: data.round ?? data.gameweek ?? 0,
    gameweek: data.gameweek ?? 0,
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
