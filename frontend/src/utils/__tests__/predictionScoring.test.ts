/// <reference types="jest" />

import {
  baseTier,
  outcomeOf,
  scorePrediction,
  streakMultiplier,
} from '../predictionScoring';

describe('outcomeOf', () => {
  it('classifies home/draw/away from goals', () => {
    expect(outcomeOf(2, 0)).toBe('home');
    expect(outcomeOf(1, 1)).toBe('draw');
    expect(outcomeOf(0, 3)).toBe('away');
  });
});

describe('baseTier', () => {
  it('gives 7 for an exact score', () => {
    const r = baseTier({ outcome: 'home', exactHomeGoals: 2, exactAwayGoals: 1, actualHomeGoals: 2, actualAwayGoals: 1 });
    expect(r).toMatchObject({ base: 7, correctOutcome: true, exactScore: true, correctGoalDifference: true });
  });
  it('gives 4 for correct outcome + goal difference (near miss)', () => {
    const r = baseTier({ outcome: 'home', exactHomeGoals: 2, exactAwayGoals: 1, actualHomeGoals: 3, actualAwayGoals: 2 });
    expect(r).toMatchObject({ base: 4, exactScore: false, correctGoalDifference: true });
  });
  it('gives 2 for correct outcome only', () => {
    const r = baseTier({ outcome: 'draw', exactHomeGoals: 1, exactAwayGoals: 1, actualHomeGoals: 0, actualAwayGoals: 0 });
    expect(r).toMatchObject({ base: 2, correctOutcome: true, correctGoalDifference: false });
  });
  it('gives 0 for a wrong outcome', () => {
    const r = baseTier({ outcome: 'home', exactHomeGoals: 2, exactAwayGoals: 0, actualHomeGoals: 0, actualAwayGoals: 2 });
    expect(r).toMatchObject({ base: 0, correctOutcome: false });
  });
  it('gives 0 when incomplete/missing actual result', () => {
    expect(baseTier({ outcome: 'home' }).base).toBe(0);
    expect(baseTier({ outcome: 'home', exactHomeGoals: 1, exactAwayGoals: 0 }).base).toBe(0);
  });
});

describe('streakMultiplier', () => {
  it('returns no multiplier below 3', () => {
    expect(streakMultiplier(0)).toBe(1);
    expect(streakMultiplier(2)).toBe(1);
  });
  it('applies 1.25x from 3 and 1.5x from 6', () => {
    expect(streakMultiplier(3)).toBe(1.25);
    expect(streakMultiplier(5)).toBe(1.25);
    expect(streakMultiplier(6)).toBe(1.5);
    expect(streakMultiplier(10)).toBe(1.5);
  });
});

describe('scorePrediction', () => {
  it('exact score plain = 7', () => {
    const s = scorePrediction({ outcome: 'home', exactHomeGoals: 2, exactAwayGoals: 1, actualHomeGoals: 2, actualAwayGoals: 1 });
    expect(s).toMatchObject({ base: 7, derbyBonus: 0, bankerMultiplier: 1, streakMultiplier: 1, earlyBonus: 0, total: 7 });
  });
  it('near-miss on a derby = 4 + 2', () => {
    const s = scorePrediction({ outcome: 'home', exactHomeGoals: 2, exactAwayGoals: 1, actualHomeGoals: 3, actualAwayGoals: 2, isDerby: true });
    expect(s.total).toBe(6);
    expect(s.derbyBonus).toBe(2);
  });
  it('banker doubles base (2 -> 4)', () => {
    const s = scorePrediction({ outcome: 'home', exactHomeGoals: 1, exactAwayGoals: 0, actualHomeGoals: 1, actualAwayGoals: 0, isBanker: true });
    expect(s.bankerMultiplier).toBe(2);
    expect(s.total).toBe(14);
  });
  it('banker doubles (base + derby bonus)', () => {
    const s = scorePrediction({ outcome: 'draw', exactHomeGoals: 1, exactAwayGoals: 1, actualHomeGoals: 1, actualAwayGoals: 1, isDerby: true, isBanker: true });
    // base 2 + derby 2 = 4, doubled = 8
    expect(s.total).toBe(8);
  });
  it('streak of 3 multiplies to 1.25x', () => {
    const s = scorePrediction({ outcome: 'home', exactHomeGoals: 2, exactAwayGoals: 1, actualHomeGoals: 2, actualAwayGoals: 1, streakCount: 3 });
    // 7 * 1.25 = 8.75
    expect(s.streakMultiplier).toBe(1.25);
    expect(s.total).toBe(8.75);
  });
  it('early 24h+ submission adds +1', () => {
    const s = scorePrediction({ outcome: 'away', exactHomeGoals: 0, exactAwayGoals: 2, actualHomeGoals: 0, actualAwayGoals: 2, submittedEarly: true });
    expect(s.earlyBonus).toBe(1);
    expect(s.total).toBe(8);
  });
  it('bonuses stack on a perfect banker derby with streak and early bonus', () => {
    const s = scorePrediction({
      outcome: 'home',
      exactHomeGoals: 2,
      exactAwayGoals: 0,
      actualHomeGoals: 2,
      actualAwayGoals: 0,
      isBanker: true,
      isDerby: true,
      streakCount: 6,
      submittedEarly: true,
    });
    // (7 + 2) * 2 = 18, * 1.5 = 27, + 1 = 28
    expect(s.total).toBe(28);
  });
  it('a missed banker earns nothing (no bonuses on a miss)', () => {
    const s = scorePrediction({ outcome: 'home', exactHomeGoals: 2, exactAwayGoals: 0, actualHomeGoals: 0, actualAwayGoals: 1, isBanker: true, isDerby: true, submittedEarly: true });
    expect(s.base).toBe(0);
    expect(s.derbyBonus).toBe(0);
    expect(s.earlyBonus).toBe(0);
    expect(s.total).toBe(0);
  });
});