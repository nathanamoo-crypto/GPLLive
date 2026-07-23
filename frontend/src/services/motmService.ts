import api from './api';
import { VOTE_URL, MOTMEndpoints } from '../constants/apiUrls';

export interface MotmResult {
  playerId: number;
  playerName: string;
  clubId: number;
  votes: number;
  percentage: number;
}

// Matches MotmResultsResponse - MotmController used to return the raw list
// of individual vote rows (no tally, no playerId/clubId per candidate, and
// no way to tell whether the current user had already voted), which is why
// this always got rebuilt to actually be usable: the backend now aggregates
// votes per player and reports myVotePlayerId itself.
export interface MotmVotesResponse {
  results: MotmResult[];
  totalVotes: number;
  myVotePlayerId: number | null;
  // Voting is only open for a fixed window after kickoff (24h) once the
  // match is FINISHED - after that MotmService.castVote rejects new votes
  // and this flips to false, so the screen should show read-only final
  // results to everyone rather than a ballot.
  votingOpen: boolean;
}

function mapResults(data: any): MotmVotesResponse {
  return {
    results: (data.results ?? []).map((r: any) => ({
      playerId: r.playerId,
      playerName: r.playerName,
      clubId: r.clubId,
      votes: r.votes ?? 0,
      percentage: r.percentage ?? 0,
    })),
    totalVotes: data.totalVotes ?? 0,
    myVotePlayerId: data.myVotePlayerId ?? null,
    votingOpen: data.votingOpen ?? false,
  };
}

export async function getMotmVotes(fixtureId: number, signal?: AbortSignal): Promise<MotmVotesResponse> {
  const { data } = await api.get<any>(
    `${MOTMEndpoints.VOTE}/${fixtureId}`,
    { baseURL: VOTE_URL, signal },
  );
  return mapResults(data);
}

// MotmController's POST returns the saved vote row (id/username/playerName/
// fixtureId/votedAt), not a {success: boolean} - a 2xx response is itself
// the success signal, so this just resolves void and lets the caller catch
// non-2xx (e.g. "already voted" / "voting isn't open yet") the normal way.
export async function submitMotmVote(fixtureId: number, playerId: number): Promise<void> {
  await api.post(
    MOTMEndpoints.VOTE,
    { fixtureId, playerId },
    { baseURL: VOTE_URL },
  );
}
