import { Prediction, PredictionPointsBreakdown } from '../types';

export interface PredictionScoringInput {
  outcome: Prediction['outcome'];
  exactHomeGoals?: number;
  exactAwayGoals?: number;
  actualHomeGoals?: number;
  actualAwayGoals?: number;
  isBanker?: boolean;
  isDerby?: boolean;
  // Length of the user's current correct-outcome streak *before* this pick
  // resolved. Streak multiplier kicks in once it reaches 3.
  streakCount?: number;
  // True if the pick was submitted 24h+ before kickoff (the +1 bonus).
  submittedEarly?: boolean;
}

export interface TierResult {
  base: number;
  correctOutcome: boolean;
  exactScore: boolean;
  correctGoalDifference: boolean;
}

export function outcomeOf(homeGoals: number, awayGoals: number): 'home' | 'draw' | 'away' {
  if (homeGoals === awayGoals) return 'draw';
  return homeGoals > awayGoals ? 'home' : 'away';
}

// Base points *before* any bonuses: exact score, else correct outcome + goal
// difference, else correct outcome only, else nothing.
export function baseTier(input: PredictionScoringInput): TierResult {
  const { outcome, actualHomeGoals, actualAwayGoals, exactHomeGoals, exactAwayGoals } = input;
  if (!outcome || actualHomeGoals === undefined || actualAwayGoals === undefined) {
    return { base: 0, correctOutcome: false, exactScore: false, correctGoalDifference: false };
  }

  const actualOutcome = outcomeOf(actualHomeGoals, actualAwayGoals);
  const correctOutcome = outcome === actualOutcome;

  const predictedScore = exactHomeGoals === undefined || exactAwayGoals === undefined;
  const exactScore = !predictedScore && exactHomeGoals === actualHomeGoals && exactAwayGoals === actualAwayGoals;

  const predictedDiff = (exactHomeGoals ?? 0) - (exactAwayGoals ?? 0);
  const actualDiff = actualHomeGoals - actualAwayGoals;
  const correctGoalDifference = correctOutcome && predictedDiff === actualDiff;

  let base = 0;
  if (exactScore) base = 7;
  else if (correctOutcome && correctGoalDifference) base = 4;
  else if (correctOutcome) base = 2;

  return { base, correctOutcome, exactScore, correctGoalDifference };
}

// Streak bonus: blanks normally; 1.25x once the streak hits 3, rising to 1.5x
// from 6 and beyond. Multiplies the points earned on this pick only.
export function streakMultiplier(streakCount: number): number {
  if (streakCount >= 6) return 1.5;
  if (streakCount >= 3) return 1.25;
  return 1;
}

export function scorePrediction(input: PredictionScoringInput): PredictionPointsBreakdown {
  const { isBanker = false, isDerby = false, submittedEarly = false } = input;
  const { base } = baseTier(input);

  // A wrong pick earns nothing - no bonus is credited for a miss.
  const earned = base > 0 ? base : 0;
  const derbyBonus = earned > 0 && isDerby ? 2 : 0;

  // Banker doubles whatever the fixture earns (the derby bonus is added in
  // before the doubling, so a banker derby pick earns 2 * (base + 2)).
  const preBanker = earned + derbyBonus;
  const bankerMultiplier = isBanker ? 2 : 1;
  const afterBanker = preBanker * bankerMultiplier;

  const mult = streakMultiplier(input.streakCount ?? 0);
  const streakBonus = afterBanker * (mult - 1);
  const afterStreak = afterBanker + streakBonus;

  const earlyBonus = earned > 0 && submittedEarly ? 1 : 0;
  const total = afterStreak + earlyBonus;

  return {
    base: earned,
    derbyBonus,
    bankerMultiplier,
    streakMultiplier: mult,
    earlyBonus,
    total,
  };
}