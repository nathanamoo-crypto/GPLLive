import { create } from 'zustand';
import { Prediction, PredictionState } from '../types';

export const usePredictionStore = create<PredictionState>((set) => ({
  predictions: {},
  setPrediction: (fixtureId, outcome) => {
    set((state) => ({
      predictions: {
        ...state.predictions,
        [fixtureId]: {
          ...(state.predictions[fixtureId] ?? {
            fixtureId,
            outcome: null,
            exactHomeGoals: undefined,
            exactAwayGoals: undefined,
            locked: false,
            submitted: false,
          }),
          outcome,
        },
      },
    }));
  },
  setExactScore: (fixtureId, home, away) => {
    set((state) => ({
      predictions: {
        ...state.predictions,
        [fixtureId]: {
          ...(state.predictions[fixtureId] ?? {
            fixtureId,
            outcome: null,
            exactHomeGoals: undefined,
            exactAwayGoals: undefined,
            locked: false,
            submitted: false,
          }),
          exactHomeGoals: home,
          exactAwayGoals: away,
        },
      },
    }));
  },
  submitAll: async (gameweek: number) => {
    // TODO: POST /predictions with gameweek — currently mock-only
    console.log(`Submitting predictions for gameweek ${gameweek}`);
    set((state) => ({
      predictions: Object.fromEntries(
        Object.entries(state.predictions).map(([fixtureId, prediction]) => [
          fixtureId,
          { ...prediction, submitted: true, locked: true },
        ])
      ),
    }));
  },
  reset: () => {
    set({ predictions: {} });
  },
}));
