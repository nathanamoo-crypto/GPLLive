import { create } from 'zustand';
import { Prediction, PredictionState } from '../types';
import { getMyPredictions, submitPrediction as submitPredictionRequest } from '../services/predictionService';

function draftFor(fixtureId: number, existing: Prediction | undefined): Prediction {
  return existing ?? {
    fixtureId,
    outcome: null,
    exactHomeGoals: undefined,
    exactAwayGoals: undefined,
    locked: false,
    submitted: false,
    isBanker: false,
    isDerby: false,
    scored: false,
    pointsEarned: null,
  };
}

export const usePredictionStore = create<PredictionState>((set, get) => ({
  predictions: {},
  loading: false,
  loadPredictions: async (gameweekId) => {
    set({ loading: true });
    try {
      const saved = await getMyPredictions(gameweekId);
      set((state) => {
        const merged = { ...state.predictions };
        saved.forEach((prediction) => {
          merged[String(prediction.fixtureId)] = prediction;
        });
        return { predictions: merged };
      });
    } finally {
      set({ loading: false });
    }
  },
  setPrediction: (fixtureId, outcome) => {
    set((state) => ({
      predictions: {
        ...state.predictions,
        [String(fixtureId)]: {
          ...draftFor(fixtureId, state.predictions[String(fixtureId)]),
          outcome,
        },
      },
    }));
  },
  setExactScore: (fixtureId, home, away) => {
    set((state) => ({
      predictions: {
        ...state.predictions,
        [String(fixtureId)]: {
          ...draftFor(fixtureId, state.predictions[String(fixtureId)]),
          exactHomeGoals: home,
          exactAwayGoals: away,
        },
      },
    }));
  },
  setBanker: (fixtureId) => {
    set((state) => {
      const updated: Record<string, Prediction> = {};
      Object.entries(state.predictions).forEach(([key, prediction]) => {
        updated[key] = { ...prediction, isBanker: false };
      });
      const key = String(fixtureId);
      updated[key] = { ...draftFor(fixtureId, updated[key]), isBanker: true };
      return { predictions: updated };
    });
  },
  submitPrediction: async (fixtureId) => {
    const draft = get().predictions[String(fixtureId)];
    if (!draft || !draft.outcome || draft.exactHomeGoals == null || draft.exactAwayGoals == null) {
      throw new Error('Pick an outcome and a scoreline before saving.');
    }

    const saved = await submitPredictionRequest({
      fixtureId,
      outcome: draft.outcome,
      exactHomeGoals: draft.exactHomeGoals,
      exactAwayGoals: draft.exactAwayGoals,
      isBanker: !!draft.isBanker,
    });

    set((state) => ({
      predictions: {
        ...state.predictions,
        [String(fixtureId)]: saved,
      },
    }));
  },
  reset: () => {
    set({ predictions: {} });
  },
}));
