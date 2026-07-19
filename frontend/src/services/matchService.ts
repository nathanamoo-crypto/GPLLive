import api from './api';
import { MatchEndpoints, MATCH_URL } from '../constants/apiUrls';
import { Match, MatchEvent, MatchStatus, FixtureResult } from '../types';

function normalizeStatus(status: string): MatchStatus {
  const lower = status.toLowerCase();
  if (lower === 'live' || lower === 'in_progress' || lower === 'playing') return 'live';
  if (lower === 'finished' || lower === 'completed') return 'finished';
  return 'scheduled';
}

export async function getMatches(gameweek?: number, status?: string, signal?: AbortSignal): Promise<Match[]> {
  const params = new URLSearchParams();
  if (gameweek != null) params.set('gameweek', String(gameweek));
  if (status) params.set('status', status);

  const qs = params.toString();
  const { data } = await api.get<any[]>(
    `${MatchEndpoints.FIXTURES}${qs ? `?${qs}` : ''}`,
    { baseURL: MATCH_URL, signal },
  );

  return (data ?? []).map((f: any) => ({
    id: f.fixtureId ?? f.id,
    homeClub: f.homeClub ?? f.home_club ?? f.homeTeam ?? f.home_team,
    awayClub: f.awayClub ?? f.away_club ?? f.awayTeam ?? f.away_team,
    homeScore: f.homeScore ?? f.home_score ?? null,
    awayScore: f.awayScore ?? f.away_score ?? null,
    status: normalizeStatus(f.status),
    kickoffTime: f.kickoffTime ?? f.kickoff_time ?? f.kickoff,
    liveMinute: f.liveMinute ?? f.live_minute,
    venue: f.venue ?? f.stadium ?? '',
    round: f.round ?? f.gameweek ?? 0,
    gameweek: f.gameweek ?? 0,
  }));
}

export async function getMatchDetails(id: number, signal?: AbortSignal): Promise<Match | null> {
  try {
    const { data } = await api.get<any>(
      `${MatchEndpoints.FIXTURES}/${id}`,
      { baseURL: MATCH_URL, signal },
    );
    return {
      id: data.fixtureId ?? data.id,
      homeClub: data.homeClub ?? data.home_club,
      awayClub: data.awayClub ?? data.away_club,
      homeScore: data.homeScore ?? data.home_score ?? null,
      awayScore: data.awayScore ?? data.away_score ?? null,
      status: normalizeStatus(data.status),
      kickoffTime: data.kickoffTime ?? data.kickoff_time ?? data.kickoff,
      liveMinute: data.liveMinute ?? data.live_minute,
      venue: data.venue ?? '',
      round: data.round ?? data.gameweek ?? 0,
      gameweek: data.gameweek ?? 0,
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

export async function getMatchEvents(matchId: number): Promise<MatchEvent[]> {
  const { data } = await api.get<any[]>(
    `${MatchEndpoints.FIXTURES}/${matchId}/events`,
    { baseURL: MATCH_URL },
  );
  return (data ?? []).map((e: any) => ({
    id: e.id ?? 0,
    matchId: e.matchId ?? e.fixtureId ?? matchId,
    type: e.type ?? 'goal',
    minute: e.minute ?? 0,
    playerName: e.playerName ?? e.player_name ?? '',
    side: e.side ?? 'home',
    assistPlayerName: e.assistPlayerName ?? e.assist_player_name,
    subOffPlayerName: e.subOffPlayerName ?? e.sub_off_player_name,
  }));
}
