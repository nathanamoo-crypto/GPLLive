import api from './api';
import { PREDICT_URL, PredictionEndpoints } from '../constants/apiUrls';
import { Prediction, PredictionLeaderboardEntry } from '../types';

// PredictionResponse (backend) -> Prediction (frontend). `locked`/`scored`/
// `pointsEarned` are computed server-side (see PredictionService.mapToResponse
// in the backend) - the frontend never has to guess kickoff-locking itself.
function mapPrediction(data: any): Prediction {
  return {
    fixtureId: data.fixtureId,
    outcome: data.outcome ?? null,
    exactHomeGoals: data.exactHomeGoals,
    exactAwayGoals: data.exactAwayGoals,
    locked: !!data.locked,
    submitted: true,
    isBanker: !!data.isBanker,
    isDerby: !!data.isDerby,
    scored: !!data.scored,
    pointsEarned: data.pointsEarned ?? null,
  };
}

export interface SubmitPredictionInput {
  fixtureId: number;
  outcome: 'home' | 'draw' | 'away';
  exactHomeGoals: number;
  exactAwayGoals: number;
  isBanker: boolean;
}

// Single-fixture submit/amend - the backend allows resubmitting the same
// fixture any number of times up until kickoff, so this doubles as both
// "save my pick" and "edit my pick".
export async function submitPrediction(input: SubmitPredictionInput): Promise<Prediction> {
  const { data } = await api.post(
    PredictionEndpoints.SUBMIT,
    input,
    { baseURL: PREDICT_URL },
  );
  return mapPrediction(data);
}

// Defaults to the current gameweek server-side when gameweekId is omitted.
export async function getMyPredictions(gameweekId?: number, signal?: AbortSignal): Promise<Prediction[]> {
  const { data } = await api.get<any[]>(
    PredictionEndpoints.ME,
    { baseURL: PREDICT_URL, params: gameweekId ? { gameweekId } : undefined, signal },
  );
  return (data ?? []).map(mapPrediction);
}

export async function getPredictionLeaderboard(signal?: AbortSignal): Promise<PredictionLeaderboardEntry[]> {
  const { data } = await api.get<any[]>(
    PredictionEndpoints.LEADERBOARD,
    { baseURL: PREDICT_URL, signal },
  );
  return (data ?? []).map((entry) => ({
    rank: entry.rank,
    userId: entry.userId,
    username: entry.username,
    predictionPoints: entry.predictionPoints ?? 0,
    predictionStreak: entry.predictionStreak ?? 0,
  }));
}
