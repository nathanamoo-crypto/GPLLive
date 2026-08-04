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
  // Outcome is derived from the scoreline itself rather than picked
  // separately - typing 5-0 sets the outcome to 'home' automatically, so
  // there's no way to end up with a scoreline and an outcome that
  // contradict each other (e.g. picking "Draw" with a 5-3 scoreline typed
  // in).
  setExactScore: (fixtureId, home, away) => {
    const outcome = home === away ? 'draw' : home > away ? 'home' : 'away';
    set((state) => ({
      predictions: {
        ...state.predictions,
        [String(fixtureId)]: {
          ...draftFor(fixtureId, state.predictions[String(fixtureId)]),
          exactHomeGoals: home,
          exactAwayGoals: away,
          outcome,
        },
      },
    }));
  },
  // Tapping the current Banker again clears it (no Banker set this
  // gameweek); tapping a different fixture moves the tag there instead.
  // Only a local draft change - like outcome/score edits, it needs a
  // Save/Update Pick tap to actually persist to the backend.
  setBanker: (fixtureId) => {
    set((state) => {
      const key = String(fixtureId);
      const wasBanker = !!state.predictions[key]?.isBanker;

      const updated: Record<string, Prediction> = {};
      Object.entries(state.predictions).forEach(([k, prediction]) => {
        updated[k] = { ...prediction, isBanker: false };
      });

      updated[key] = { ...draftFor(fixtureId, updated[key]), isBanker: !wasBanker };
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
