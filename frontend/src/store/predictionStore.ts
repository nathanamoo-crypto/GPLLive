import { create } from 'zustand';
import { Prediction, PredictionState } from '../types';
import { submitPredictions } from '../services/predictionService';

const blankPrediction = (fixtureId: number): Prediction => ({
  fixtureId,
  outcome: null,
  exactHomeGoals: undefined,
  exactAwayGoals: undefined,
  isBanker: false,
  locked: false,
  submitted: false,
});

export const usePredictionStore = create<PredictionState>((set, get) => ({
  predictions: {},
  bankerFixtureId: null,
  streak: 0,

  setPrediction: (fixtureId, outcome) => {
    set((state) => ({
      predictions: {
        ...state.predictions,
        [String(fixtureId)]: {
          ...(state.predictions[String(fixtureId)] ?? blankPrediction(fixtureId)),
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
          ...(state.predictions[String(fixtureId)] ?? blankPrediction(fixtureId)),
          exactHomeGoals: home,
          exactAwayGoals: away,
        },
      },
    }));
  },

  // Only one Banker may be set per gameweek. Picking a fixture makes it *the*
  // banker (clearing any previous one); clearing or re-picking moves the tag.
  setBanker: (fixtureId) => {
    if (fixtureId === get().bankerFixtureId) {
      // Tapping the current banker again removes the tag.
      set((state) => ({
        bankerFixtureId: null,
        predictions: {
          ...state.predictions,
          [String(fixtureId)]: {
            ...(state.predictions[String(fixtureId)] ?? blankPrediction(fixtureId)),
            isBanker: false,
          },
        },
      }));
      return;
    }
    set((state) => ({ bankerFixtureId: fixtureId }));
  },

  setStreak: (streak) => set({ streak }),

  submitAll: async () => {
    const state = get();
    await submitPredictions(state.predictions);
    set({
      bankerFixtureId: null,
      predictions: Object.fromEntries(
        Object.entries(state.predictions).map(([fixtureId, prediction]) => [
          fixtureId,
          {
            ...prediction,
            isBanker: prediction.fixtureId === state.bankerFixtureId,
            submitted: true,
            locked: true,
          },
        ])
      ),
    });
  },

  reset: () => set({ predictions: {}, bankerFixtureId: null }),
}));