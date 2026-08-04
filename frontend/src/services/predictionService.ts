import api from './api';
import { PREDICT_URL, PredictionEndpoints } from '../constants/apiUrls';
import { Prediction } from '../types';

export async function submitPredictions(predictions: Record<string, Prediction>): Promise<void> {
  const payload = Object.values(predictions).map((p) => ({
    fixtureId: p.fixtureId,
    outcome: p.outcome,
    exactHomeGoals: p.exactHomeGoals,
    exactAwayGoals: p.exactAwayGoals,
    isBanker: p.isBanker,
  }));

  const { data } = await api.post(
    PredictionEndpoints.SUBMIT,
    { predictions: payload },
    { baseURL: PREDICT_URL },
  );
  return data;
}
