import api from './api';
import { FantasyEndpoints, ChipEndpoints, FANTASY_URL } from '../constants/apiUrls';
import type {
  Player, SquadPlayerDTO, FantasyTeam, ChipType,
  ScoringStats, PlayerPrice, Gameweek, PlayerAnalysis,
} from '../types';

// Player prices are stored on the backend in whole cedis (e.g. 7500000).
// The rest of the app (budget, price labels) works in millions (e.g. 7.5),
// matching the GPL Live product spec ("GH₵Xm").
const CEDIS_PER_MILLION = 1_000_000;

// Backend doesn't persist a "formation" concept anywhere - it only tracks
// isPartOfXI per player, and its own lineup validation allows any DEF 3-5 /
// MID 3-5 / FWD 1-3 combination (not just the 5 named presets the Squad
// Builder's picker shows - e.g. toggle-bench swaps can legally land you on
// 5-3-2). So this always reports the REAL def-mid-fwd composition as the
// label - falling back to a hardcoded '4-3-3' here previously mislabeled
// any non-preset lineup as 4-3-3 even when it wasn't.
function deriveFormation(startingSquad: SquadPlayerDTO[]): string {
  const def = startingSquad.filter((s) => s.position === 'DEF').length;
  const mid = startingSquad.filter((s) => s.position === 'MID').length;
  const fwd = startingSquad.filter((s) => s.position === 'FWD').length;
  return `${def}-${mid}-${fwd}`;
}

function mapSquadToFantasyTeam(data: any): FantasyTeam {
  const squad: SquadPlayerDTO[] = (data.squad ?? []).map((s: any) => ({
    fantasyTeamPlayerId: s.fantasyTeamPlayerId,
    playerId: s.playerId,
    playerName: s.playerName,
    clubId: s.clubId,
    position: s.position,
    price: s.price,
    priceChange: s.priceChange ?? null,
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
    priceChange: s.priceChange,
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
    // FantasyTeamResponse (both POST /fantasy-teams and GET /fantasy-teams/
    // my-team) names this field plain `id`, not `teamId`/`team_id` - without
    // this fallback team.teamId was silently always 0.
    teamId: data.teamId ?? data.team_id ?? data.id ?? 0,
    userId: data.userId ?? data.user_id ?? 0,
    teamName: data.teamName ?? data.team_name ?? '',
    players,
    captainId: captainEntry?.playerId ?? null,
    viceCaptainId: viceCaptainEntry?.playerId ?? null,
    startingPlayerIds: startingIds,
    formation: data.formation ?? deriveFormation(squad.filter((s) => s.isStarting)),
    chips: data.chips ?? { tripleCaptain: false, benchBoost: false, wildcard: false, wildcard2: false, freeHit: false },
    activeChipKey: data.activeChipKey ?? null,
    totalPoints: data.totalPoints ?? data.total_points ?? 0,
    gameweekPoints: data.gameweekPoints ?? data.gameweek_points ?? 0,
    rank: data.rank ?? 0,
    // FantasyTeamResponse also only sends `budgetRemaining`, not `budget` -
    // and that field is in raw cedis (e.g. 92500000), same unit as player
    // prices, so it needs the same /CEDIS_PER_MILLION conversion.
    budget: data.budget ?? (
      data.budgetRemaining != null ? Number(data.budgetRemaining) / CEDIS_PER_MILLION
      : data.budget_remaining != null ? Number(data.budget_remaining) / CEDIS_PER_MILLION
      : 100
    ),
    // Backend's FantasyTeamResponse field is transferPoints, not
    // transferCount/transfer_count - those never existed on the response,
    // so this always silently read as 0 before.
    freeTransfers: data.transferPoints ?? data.transfer_points ?? 0,
    isLocked: data.isLocked ?? data.is_locked ?? false,
    createdAt: data.createdAt ?? data.created_at ?? '',
  };
}

// Backend only filters by position via a path variable
// (GET /players/position/{position}) - the plain GET /players route has no
// @RequestParam at all, so a ?position= query string was silently ignored
// and every call returned the full player list regardless of the filter
// passed in. FantasyRoot's Browse tab never noticed because it fetches
// everyone once and filters client-side; TransfersScreen calls this
// trusting the server to filter, so it was showing every player as a
// possible replacement instead of just same-position ones.
export async function fetchPlayers(position?: string, signal?: AbortSignal): Promise<Player[]> {
  const path = position ? `${FantasyEndpoints.PLAYERS}/position/${position}` : FantasyEndpoints.PLAYERS;
  const { data } = await api.get<any[]>(path, { baseURL: FANTASY_URL, signal });
  return (data ?? []).map(mapPlayer);
}

function mapPlayer(p: any): Player {
  const rawPrice = p.currentPrice ?? p.current_price;
  const rawPriceChange = p.priceChange ?? p.price_change;
  return {
    id: p.playerId ?? p.id,
    name: p.name ?? p.fullName ?? p.full_name,
    clubId: p.clubId ?? p.club_id,
    position: p.position,
    // No price record yet for this player - treat as free rather than
    // silently producing NaN budget math downstream.
    price: rawPrice != null ? Number(rawPrice) / CEDIS_PER_MILLION : 0,
    priceChange: rawPriceChange != null ? Number(rawPriceChange) / CEDIS_PER_MILLION : null,
    photoUrl: p.photoUrl ?? p.photo_url,
  };
}

// GET /players/{id}/analysis (PlayerAnalysisService) - powers the Player
// Details screen, reused from Draft, Transfers, and the Pitch view alike.
// `premium` on the response tells us whether the analysis fields below it
// are populated - a free user gets the basics with those left undefined.
export async function fetchPlayerAnalysis(playerId: number, signal?: AbortSignal): Promise<PlayerAnalysis> {
  const { data } = await api.get<any>(`${FantasyEndpoints.PLAYERS}/${playerId}/analysis`, { baseURL: FANTASY_URL, signal });
  // Same raw-cedis-to-millions conversion as mapPlayer() below - currentPrice
  // here comes from the exact same PlayerPrice source as the /players list.
  const rawPrice = data.currentPrice;
  const rawPriceChange = data.priceChange;
  return {
    id: data.id,
    fullName: data.fullName,
    photoUrl: data.photoUrl,
    clubName: data.clubName,
    position: data.position,
    currentPrice: rawPrice != null ? Number(rawPrice) / CEDIS_PER_MILLION : null,
    priceChange: rawPriceChange != null ? Number(rawPriceChange) / CEDIS_PER_MILLION : null,
    totalPoints: data.totalPoints ?? 0,
    totalGoals: data.totalGoals ?? 0,
    totalAssists: data.totalAssists ?? 0,
    premium: !!data.premium,
    averagePoints: data.averagePoints ?? undefined,
    recentForm: data.recentForm ?? undefined,
    trend: data.trend ?? undefined,
    insights: data.insights ?? undefined,
  };
}

// GET /players/club/{clubId} (PlayerController.getPlayersByClub) - used by
// MOTM voting to source candidates. There's no real matchday-lineup data
// anywhere in this app (no "who actually started" tracking), so both clubs'
// full active squads stand in for a starting-XI candidate list.
export async function fetchPlayersByClub(clubId: number, signal?: AbortSignal): Promise<Player[]> {
  const { data } = await api.get<any[]>(`${FantasyEndpoints.PLAYERS}/club/${clubId}`, { baseURL: FANTASY_URL, signal });
  return (data ?? []).map(mapPlayer);
}

// GET /fantasy-teams/my-team (FantasyTeamResponse) only ever returns the
// team's own fields (id, teamName, totalPoints, budgetRemaining,
// transferPoints, username) - it does NOT include the squad's players at
// all, despite that being exactly what screens showing "your team" need.
// The real player list (with club, price, captain/starting flags) lives at
// GET /squad/{fantasyTeamId} (FantasyTeamPlayerResponse[]) instead, so this
// merges both calls into the single FantasyTeam shape the rest of the app
// expects. Without this, team.players was always [] and nothing selected
// in the squad builder ever showed up after confirming.
export async function getMyTeam(signal?: AbortSignal): Promise<FantasyTeam | null> {
  let summary: any;
  try {
    const { data } = await api.get<any>(FantasyEndpoints.MY_TEAM, { baseURL: FANTASY_URL, signal });
    summary = data;
  } catch (err: any) {
    if (err.response?.status === 404) return null;
    throw err;
  }

  const teamId = summary.id ?? summary.teamId ?? summary.team_id;
  let squad: any[] = [];
  if (teamId != null) {
    try {
      const { data: squadRows } = await api.get<any[]>(
        `${FantasyEndpoints.SQUAD_BASE}/${teamId}`, { baseURL: FANTASY_URL, signal },
      );
      squad = (squadRows ?? []).map((row: any) => ({
        fantasyTeamPlayerId: row.id,
        playerId: row.playerId,
        playerName: row.playerName,
        clubId: row.clubId,
        position: row.position,
        price: row.currentPrice != null ? Number(row.currentPrice) / CEDIS_PER_MILLION : 0,
        priceChange: row.priceChange != null ? Number(row.priceChange) / CEDIS_PER_MILLION : null,
        isStarting: row.isPartOfXI ?? false,
        isCaptain: row.isCaptain ?? false,
        isViceCaptain: row.isViceCaptain ?? false,
        weekPoints: 0,
      }));
    } catch {
      // The team summary alone is still useful even if the squad fetch
      // fails - fall through with an empty squad rather than erroring out.
    }
  }

  return mapSquadToFantasyTeam({ ...summary, squad });
}

export async function createTeam(teamName: string): Promise<FantasyTeam> {
  const { data } = await api.post<any>(FantasyEndpoints.CREATE_TEAM, { teamName }, { baseURL: FANTASY_URL });
  return mapSquadToFantasyTeam(data);
}

// Deletes the caller's own fantasy team and everything under it (squad,
// transfers, chips, gameweek scores). createFantasyTeam permanently 409s
// ("You already have a fantasy team") once one exists, and there was no way
// to undo a bad/test team - this gives a real reset path.
export async function deleteMyTeam(): Promise<void> {
  await api.delete(FantasyEndpoints.DELETE_TEAM, { baseURL: FANTASY_URL });
}

// Backend's FantasyTeamPlayerRequest requires BOTH fields (fantasyTeamId is
// @NotNull) - sending playerId alone 400s with "fantasyTeamId: must not be
// null". Also returns the created FantasyTeamPlayerResponse so the caller
// can capture its `id` (the fantasyTeamPlayerId join-row id) - that's what
// setCaptain/setViceCaptain need, not the raw playerId.
export async function addPlayerToSquad(
  playerId: number,
  fantasyTeamId: number
): Promise<{ fantasyTeamPlayerId: number }> {
  const { data } = await api.post<{ id: number }>(
    FantasyEndpoints.SQUAD_ADD, { playerId, fantasyTeamId }, { baseURL: FANTASY_URL },
  );
  return { fantasyTeamPlayerId: data.id };
}

export async function removePlayerFromSquad(fantasyTeamPlayerId: number): Promise<void> {
  await api.delete(`${FantasyEndpoints.SQUAD_REMOVE}/${fantasyTeamPlayerId}`, { baseURL: FANTASY_URL });
}

export async function setLineup(fantasyTeamPlayerIds: number[]): Promise<void> {
  await api.put(FantasyEndpoints.SQUAD_LINEUP, { fantasyTeamPlayerIds }, { baseURL: FANTASY_URL });
}

export async function setCaptain(fantasyTeamPlayerId: number): Promise<void> {
  await api.patch(`${FantasyEndpoints.SQUAD_BASE}/${fantasyTeamPlayerId}/captain`, undefined, { baseURL: FANTASY_URL });
}

export async function setViceCaptain(fantasyTeamPlayerId: number): Promise<void> {
  await api.patch(`${FantasyEndpoints.SQUAD_BASE}/${fantasyTeamPlayerId}/vice-captain`, undefined, { baseURL: FANTASY_URL });
}

// Backend swaps exactly one starting player for one bench player at a time
// (enforces the 11-starters invariant) - it isn't a single-player toggle.
export async function swapStartingAndBenchPlayer(startingPlayerId: number, benchPlayerId: number): Promise<void> {
  await api.patch(`${FantasyEndpoints.SQUAD_BASE}/${startingPlayerId}/${benchPlayerId}/toggle-bench`, undefined, { baseURL: FANTASY_URL });
}

// Backend's TransferRequest needs all four fields (fantasyTeamId/gameweekId
// included, @NotNull) - the old signature here only ever sent
// outPlayerId/inPlayerId (wrong field names too), which would have 400'd on
// every real call. TransferResponse doesn't carry the team's updated
// budget/free-transfer count either (only the transfer's own details), so
// the caller needs to re-fetch the team afterwards to refresh those.
export interface TransferResult {
  playerOutName: string;
  playerInName: string;
  isFreeTransfer: boolean;
}

export async function makeTransfer(
  fantasyTeamId: number,
  gameweekId: number,
  playerOutId: number,
  playerInId: number
): Promise<TransferResult> {
  const { data } = await api.post<any>(
    FantasyEndpoints.TRANSFERS,
    { fantasyTeamId, gameweekId, playerOutId, playerInId },
    { baseURL: FANTASY_URL },
  );
  return {
    playerOutName: data.playerOutName,
    playerInName: data.playerInName,
    isFreeTransfer: data.isFreeTransfer ?? false,
  };
}

export interface TransferHistoryItem {
  id: number;
  playerOutName: string;
  playerInName: string;
  playerOutPrice: number;
  playerInPrice: number;
  isFreeTransfer: boolean;
  transferredAt: string;
}

// GET /transfers/team/{id} (TransferController.getTransfersByFantasyTeam) -
// existed on the backend but had no frontend caller until now.
export async function getTransferHistory(fantasyTeamId: number, signal?: AbortSignal): Promise<TransferHistoryItem[]> {
  const { data } = await api.get<any[]>(
    `${FantasyEndpoints.TRANSFERS}/team/${fantasyTeamId}`, { baseURL: FANTASY_URL, signal },
  );
  return (data ?? []).map((t: any) => ({
    id: t.id,
    playerOutName: t.playerOutName,
    playerInName: t.playerInName,
    playerOutPrice: t.playerOutPrice != null ? Number(t.playerOutPrice) / CEDIS_PER_MILLION : 0,
    playerInPrice: t.playerInPrice != null ? Number(t.playerInPrice) / CEDIS_PER_MILLION : 0,
    isFreeTransfer: t.isFreeTransfer ?? false,
    transferredAt: t.transferredAt,
  })).sort((a, b) => new Date(b.transferredAt).getTime() - new Date(a.transferredAt).getTime());
}

// Chips are one-time-use per season on this backend - there is no way to
// deactivate/undo one once played (Free Hit has an internal restore path,
// but it isn't exposed as an endpoint yet). fantasyTeamId/gameweekId are
// required by the backend (ChipRequest) even though the old signature here
// didn't send them, which would have 400'd on every real call.
export async function activateChip(chipType: ChipType, fantasyTeamId: number, gameweekId: number): Promise<void> {
  await api.post(ChipEndpoints[chipType], { fantasyTeamId, gameweekId }, { baseURL: FANTASY_URL });
}

// NOTE: getPlayerStats/getPlayerScoringHistory below don't have a real
// backend match yet (see project audit notes) - ScoringController only
// exposes stats by fixture, and team-level history by team, not "stats for
// a gameweek" or "history for a player". Left as-is pending a scoring
// feature pass; do not rely on these until that's resolved.
export async function getPlayerStats(gameweek: number, signal?: AbortSignal): Promise<ScoringStats[]> {
  const { data } = await api.get<ScoringStats[]>(
    `/scoring/stats?gameweek=${gameweek}`,
    { baseURL: FANTASY_URL, signal },
  );
  return data ?? [];
}

export async function getPlayerScoringHistory(playerId: number, signal?: AbortSignal): Promise<ScoringStats[]> {
  const { data } = await api.get<ScoringStats[]>(
    `/scoring/history/${playerId}`,
    { baseURL: FANTASY_URL, signal },
  );
  return data ?? [];
}

// GET /scoring/fixture/{fixtureId} (ScoringController.getPlayerStatsByFixture)
// - real per-player match totals, admin-entered, one row per player who had
// stats recorded for that fixture. Existed on the backend with no frontend
// caller until now; powers the Stats tab on Match Details.
export interface FixturePlayerStats {
  id: number;
  playerName: string;
  clubName: string;
  position: string;
  minutesPlayed: number;
  goalsScored: number;
  assists: number;
  cleanSheet: boolean;
  yellowCard: number;
  redCard: boolean;
  saves: number;
  fantasyPoint: number;
}

export async function getPlayerStatsByFixture(fixtureId: number, signal?: AbortSignal): Promise<FixturePlayerStats[]> {
  const { data } = await api.get<any[]>(
    `${FantasyEndpoints.SCORING_FIXTURE}/${fixtureId}`,
    { baseURL: FANTASY_URL, signal },
  );
  return (data ?? []).map((s: any) => ({
    id: s.id,
    playerName: s.playerName,
    clubName: s.clubName,
    position: s.position,
    minutesPlayed: s.minutesPlayed ?? 0,
    goalsScored: s.goalsScored ?? 0,
    assists: s.assists ?? 0,
    cleanSheet: s.cleanSheet ?? false,
    yellowCard: s.yellowCard ?? 0,
    redCard: s.redCard ?? false,
    saves: s.saves ?? 0,
    fantasyPoint: s.fantasyPoint ?? 0,
  }));
}

export async function getTeamScoringHistory(teamId: number, signal?: AbortSignal): Promise<any[]> {
  const { data } = await api.get<any[]>(
    `${FantasyEndpoints.SCORING_HISTORY_TEAM}/${teamId}`,
    { baseURL: FANTASY_URL, signal },
  );
  return data ?? [];
}

export async function calculateScores(gameweek: number): Promise<void> {
  await api.post(`${FantasyEndpoints.SCORING_CALCULATE}/${gameweek}`, undefined, { baseURL: FANTASY_URL });
}

export async function getPlayerPriceHistory(playerId: number, signal?: AbortSignal): Promise<PlayerPrice[]> {
  const { data } = await api.get<PlayerPrice[]>(
    `${FantasyEndpoints.PLAYER_PRICE}/${playerId}/history`,
    { baseURL: FANTASY_URL, signal },
  );
  return data ?? [];
}

function mapGameweek(g: any): Gameweek {
  return {
    gameweekId: g.gameweekId ?? g.gameweek_id ?? g.id,
    seasonId: g.seasonId ?? g.season_id,
    season: g.season,
    gameweekNumber: g.gameweekNumber ?? g.gameweek_number ?? g.gameweek,
    deadline: g.deadline,
    isActive: g.isActive ?? g.is_active ?? g.isCurrent ?? false,
    isFinished: g.isFinished ?? g.is_finished ?? false,
  };
}

export async function getGameweeks(signal?: AbortSignal): Promise<Gameweek[]> {
  const { data } = await api.get<any[]>('/gameweeks', { baseURL: FANTASY_URL, signal });
  return (data ?? []).map(mapGameweek);
}

export async function getCurrentGameweek(signal?: AbortSignal): Promise<Gameweek | null> {
  try {
    const { data } = await api.get<any>(FantasyEndpoints.GAMEWEEK_CURRENT, { baseURL: FANTASY_URL, signal });
    return mapGameweek(data);
  } catch (err: any) {
    if (err.response?.status === 404) return null;
    throw err;
  }
}

// Powers the Fixtures screen's season-scoped browsing (default view =
// current season, explicit search = any season/matchday typed in).
export async function getGameweeksBySeason(season: string, signal?: AbortSignal): Promise<Gameweek[]> {
  const { data } = await api.get<any[]>(
    `${FantasyEndpoints.GAMEWEEK_BY_SEASON}/${encodeURIComponent(season)}`,
    { baseURL: FANTASY_URL, signal },
  );
  return (data ?? []).map(mapGameweek);
}

export async function lockTeamForGameweek(): Promise<void> {
  await api.post('/fantasy-teams/lock', undefined, { baseURL: FANTASY_URL });
}

export async function unlockTeam(): Promise<void> {
  await api.delete('/fantasy-teams/lock', { baseURL: FANTASY_URL });
}
