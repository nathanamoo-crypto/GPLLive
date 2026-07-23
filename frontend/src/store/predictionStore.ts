import { create } from 'zustand';
import { Prediction, PredictionState } from '../types';
import { submitPredictions } from '../services/predictionService';

export const usePredictionStore = create<PredictionState>((set) => ({
  predictions: {},
  setPrediction: (fixtureId, outcome) => {
    set((state) => ({
      predictions: {
        ...state.predictions,
        [String(fixtureId)]: {
          ...(state.predictions[String(fixtureId)] ?? {
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
        [String(fixtureId)]: {
          ...(state.predictions[String(fixtureId)] ?? {
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
  submitAll: async () => {
    const state = usePredictionStore.getState();
    await submitPredictions(state.predictions);
    set({
      predictions: Object.fromEntries(
        Object.entries(state.predictions).map(([fixtureId, prediction]) => [
          fixtureId,
          { ...prediction, submitted: true, locked: true },
        ])
      ),
    });
  },
  reset: () => {
    set({ predictions: {} });
  },
}));
