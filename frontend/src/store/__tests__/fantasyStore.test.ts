/// <reference types="jest" />

import { useFantasyStore, computeFormation } from '../fantasyStore';
import { Club, Player, FormationKey, ChipStatus } from '../../types';

jest.mock('../../services/fantasyService', () => {
  const emptyTeam = {
    teamId: 1,
    userId: 1,
    teamName: 'Test Team',
    players: [] as any[],
    captainId: null,
    viceCaptainId: null,
    startingPlayerIds: [] as number[],
    formation: '4-3-3',
    chips: { tripleCaptain: false, benchBoost: false, wildcard: false, wildcard2: false, freeHit: false },
    totalPoints: 0,
    gameweekPoints: 0,
    rank: 0,
    budget: 100,
    transferCount: 0,
    isLocked: false,
    createdAt: new Date().toISOString(),
  };
  return {
    createTeam: jest.fn().mockResolvedValue(emptyTeam),
    addPlayerToSquad: jest.fn().mockResolvedValue(undefined),
    removePlayerFromSquad: jest.fn().mockResolvedValue(undefined),
    setLineup: jest.fn().mockResolvedValue(undefined),
    setCaptain: jest.fn().mockResolvedValue(undefined),
    setViceCaptain: jest.fn().mockResolvedValue(undefined),
    getMyTeam: jest.fn().mockResolvedValue(emptyTeam),
    lockTeamForGameweek: jest.fn().mockResolvedValue(undefined),
    unlockTeam: jest.fn().mockResolvedValue(undefined),
    fetchPlayers: jest.fn(),
    getPlayerStats: jest.fn(),
    getGameweeks: jest.fn(),
  };
});

const makeMockClub = (id: number, name: string): Club => ({
  id,
  name,
  shortName: name.split(' ')[0] || name,
  slug: `slug_${id}`,
  badgeUrl: `local://${id}`,
  city: 'Test City',
});

const clubs: Record<number, Club> = {
  1: makeMockClub(1, 'Hearts of Oak'),
  2: makeMockClub(2, 'Asante Kotoko'),
  3: makeMockClub(3, 'Medeama SC'),
  4: makeMockClub(4, 'Dreams FC'),
};

const makePlayer = (id: number, name: string, position: 'GK' | 'DEF' | 'MID' | 'FWD', price: number, clubId: number): Player => ({
  id,
  name,
  position,
  price,
  clubId,
  photoUrl: undefined,
});

const GK = makePlayer(1, 'Test GK', 'GK', 6.0, 1);
const DEF1 = makePlayer(2, 'Test DEF1', 'DEF', 7.0, 2);
const DEF2 = makePlayer(3, 'Test DEF2', 'DEF', 6.5, 1);
const DEF3 = makePlayer(4, 'Test DEF3', 'DEF', 5.5, 3);
const DEF4 = makePlayer(5, 'Test DEF4', 'DEF', 5.0, 4);
const MID1 = makePlayer(6, 'Test MID1', 'MID', 9.0, 3);
const MID2 = makePlayer(7, 'Test MID2', 'MID', 8.0, 4);
const MID3 = makePlayer(8, 'Test MID3', 'MID', 7.0, 2);
const MID4 = makePlayer(9, 'Test MID4', 'MID', 6.0, 1);
const FWD1 = makePlayer(10, 'Test FWD1', 'FWD', 10.0, 2);
const FWD2 = makePlayer(11, 'Test FWD2', 'FWD', 9.5, 1);
const FWD3 = makePlayer(12, 'Test FWD3', 'FWD', 8.5, 3);

const resetStore = () => {
  useFantasyStore.setState({
    team: null,
    hasSquad: false,
    draftPlayers: [],
    draftCaptainId: null,
    draftViceCaptainId: null,
    draftStartingPlayerIds: [],
    draftFormation: '4-3-3' as FormationKey,
    budget: 100,
    loading: false,
    error: null,
  });
};

beforeEach(() => {
  resetStore();
});

describe('existing functionality', () => {
  it('starts with 100 budget and empty draft', () => {
    const state = useFantasyStore.getState();
    expect(state.budget).toBe(100);
    expect(state.draftPlayers).toEqual([]);
    expect(state.hasSquad).toBe(false);
    expect(state.team).toBeNull();
  });

  it('addPlayer deducts budget and adds to draft', () => {
    const store = useFantasyStore.getState();
    store.addPlayer(GK);
    expect(useFantasyStore.getState().budget).toBe(94);
    expect(useFantasyStore.getState().draftPlayers).toHaveLength(1);
    expect(useFantasyStore.getState().draftPlayers[0].id).toBe(1);
  });

  it('addPlayer does not add duplicate players', () => {
    const store = useFantasyStore.getState();
    store.addPlayer(GK);
    store.addPlayer(GK);
    expect(useFantasyStore.getState().draftPlayers).toHaveLength(1);
    expect(useFantasyStore.getState().budget).toBe(94);
  });

  it('removePlayer refunds budget and removes from draft', () => {
    const store = useFantasyStore.getState();
    store.addPlayer(GK);
    store.addPlayer(DEF1);
    expect(useFantasyStore.getState().budget).toBe(87);
    store.removePlayer(1);
    expect(useFantasyStore.getState().budget).toBe(93);
    expect(useFantasyStore.getState().draftPlayers).toHaveLength(1);
  });

  it('removePlayer of non-existent player does nothing', () => {
    const store = useFantasyStore.getState();
    store.addPlayer(GK);
    store.removePlayer(999);
    expect(useFantasyStore.getState().budget).toBe(94);
    expect(useFantasyStore.getState().draftPlayers).toHaveLength(1);
  });

  it('setCaptain sets draftCaptainId', () => {
    const store = useFantasyStore.getState();
    store.setCaptain(2);
    expect(useFantasyStore.getState().draftCaptainId).toBe(2);
  });

  it('submitSquad creates a team and resets draft state', async () => {
    const store = useFantasyStore.getState();
    const players = [GK, DEF1, DEF2, MID1, MID2, FWD1, FWD2];
    for (let i = 0; i < 8; i++) {
      const extra = makePlayer(100 + i, `Extra ${i}`, i < 3 ? 'DEF' : i < 6 ? 'MID' : 'FWD', 5.0, 3);
      players.push(extra);
    }
    for (const p of players) {
      store.addPlayer(p);
    }
    store.setCaptain(2);
    await useFantasyStore.getState().submitSquad('Test Team');
    const state = useFantasyStore.getState();
    expect(state.hasSquad).toBe(true);
    expect(state.team).not.toBeNull();
    expect(state.team!.teamName).toBe('Test Team');
    expect(state.draftPlayers).toEqual([]);
    expect(state.budget).toBe(100);
  });

  it('submitSquad throws if less than 15 players', async () => {
    const store = useFantasyStore.getState();
    store.addPlayer(GK);
    store.addPlayer(DEF1);
    store.setCaptain(1);
    await expect(store.submitSquad('Bad Team')).rejects.toThrow('Complete squad');
  });

  it('submitSquad throws if no captain', async () => {
    const store = useFantasyStore.getState();
    for (let i = 0; i < 15; i++) {
      const p = makePlayer(200 + i, `Player ${i}`, 'DEF', 5.0, 2);
      store.addPlayer(p);
    }
    await expect(store.submitSquad('No Captain')).rejects.toThrow('Complete squad');
  });

  it('resetDraft clears draft and resets budget', () => {
    const store = useFantasyStore.getState();
    store.addPlayer(GK);
    store.addPlayer(FWD1);
    expect(useFantasyStore.getState().draftPlayers).toHaveLength(2);
    store.resetDraft();
    const stateAfter = useFantasyStore.getState();
    expect(stateAfter.draftPlayers).toEqual([]);
    expect(stateAfter.budget).toBe(100);
  });
});

describe('new actions', () => {
  it('setViceCaptain sets draftViceCaptainId', () => {
    const store = useFantasyStore.getState();
    store.setViceCaptain(6);
    expect(useFantasyStore.getState().draftViceCaptainId).toBe(6);
  });

  it('setCaptain clears viceCaptainId if same player', () => {
    const store = useFantasyStore.getState();
    store.setViceCaptain(1);
    store.setCaptain(1);
    expect(useFantasyStore.getState().draftCaptainId).toBe(1);
    expect(useFantasyStore.getState().draftViceCaptainId).toBeNull();
  });

  it('setViceCaptain clears captainId if same player', () => {
    const store = useFantasyStore.getState();
    store.setCaptain(1);
    store.setViceCaptain(1);
    expect(useFantasyStore.getState().draftViceCaptainId).toBe(1);
    expect(useFantasyStore.getState().draftCaptainId).toBeNull();
  });

  it('setStartingXI stores starting player IDs and auto-derives formation', () => {
    const store = useFantasyStore.getState();
    store.addPlayer(GK);
    store.addPlayer(DEF1);
    store.addPlayer(DEF2);
    store.addPlayer(DEF3);
    store.addPlayer(DEF4);
    store.addPlayer(MID1);
    store.addPlayer(MID2);
    store.addPlayer(MID3);
    store.addPlayer(MID4);
    store.addPlayer(FWD1);
    store.addPlayer(FWD2);
    store.addPlayer(FWD3);

    store.setStartingXI([1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12]);
    let state = useFantasyStore.getState();
    expect(state.draftStartingPlayerIds).toHaveLength(11);
    expect(state.draftFormation).toBe('4-3-3');

    store.setStartingXI([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    state = useFantasyStore.getState();
    expect(state.draftFormation).toBe('4-4-2');
  });

  it('setFormation stores formation string', () => {
    const store = useFantasyStore.getState();
    store.setFormation('4-4-2');
    expect(useFantasyStore.getState().draftFormation).toBe('4-4-2');
  });

  it('removePlayer clears startingIds, captainId, viceCaptainId for removed player', () => {
    const store = useFantasyStore.getState();
    store.addPlayer(GK);
    store.addPlayer(MID1);
    store.setCaptain(1);
    store.setViceCaptain(6);
    store.setStartingXI([1, 6]);
    store.removePlayer(1);
    const state = useFantasyStore.getState();
    expect(state.draftStartingPlayerIds).not.toContain(1);
    expect(state.draftCaptainId).toBeNull();
    expect(state.draftViceCaptainId).toBe(6);
  });

  it('new initial state fields are set', () => {
    const state = useFantasyStore.getState();
    expect(state.draftViceCaptainId).toBeNull();
    expect(state.draftStartingPlayerIds).toEqual([]);
    expect(state.draftFormation).toBe('4-3-3');
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('new actions do not affect unrelated fields', () => {
    const store = useFantasyStore.getState();
    store.addPlayer(GK);
    store.addPlayer(DEF1);
    const budgetBefore = useFantasyStore.getState().budget;
    const draftBefore = useFantasyStore.getState().draftPlayers.length;

    store.setFormation('3-5-2');
    store.setStartingXI([1]);
    store.setViceCaptain(2);

    const state = useFantasyStore.getState();
    expect(state.budget).toBe(budgetBefore);
    expect(state.draftPlayers.length).toBe(draftBefore);
    expect(state.draftFormation).toBe('4-3-3');
    expect(state.draftStartingPlayerIds).toEqual([1]);
    expect(state.draftViceCaptainId).toBe(2);
  });
});

describe('computeFormation', () => {
  it('returns correct formation for valid splits', () => {
    expect(computeFormation(4, 3, 3)).toBe('4-3-3');
    expect(computeFormation(4, 4, 2)).toBe('4-4-2');
    expect(computeFormation(3, 4, 3)).toBe('3-4-3');
    expect(computeFormation(4, 5, 1)).toBe('4-5-1');
    expect(computeFormation(3, 5, 2)).toBe('3-5-2');
  });

  it('returns null for invalid splits', () => {
    expect(computeFormation(5, 3, 2)).toBeNull();
    expect(computeFormation(4, 2, 4)).toBeNull();
    expect(computeFormation(3, 3, 4)).toBeNull();
    expect(computeFormation(4, 6, 0)).toBeNull();
  });
});

describe('async actions (formation change, loading/error paths)', () => {
  it('submitSquad sets loading true then false on success', async () => {
    const store = useFantasyStore.getState();
    for (let i = 0; i < 15; i++) {
      const p = makePlayer(300 + i, `Player ${i}`, i < 1 ? 'GK' : i < 6 ? 'DEF' : i < 11 ? 'MID' : 'FWD', 5.0, 2);
      store.addPlayer(p);
    }
    store.setCaptain(300);

    const submitPromise = useFantasyStore.getState().submitSquad('Test');
    expect(useFantasyStore.getState().loading).toBe(true);
    await submitPromise;
    expect(useFantasyStore.getState().loading).toBe(false);
  });

  it('submitSquad sets error on failure', async () => {
    const { createTeam } = require('../../services/fantasyService');
    createTeam.mockRejectedValueOnce(new Error('API error'));

    const store = useFantasyStore.getState();
    for (let i = 0; i < 15; i++) {
      const p = makePlayer(400 + i, `Player ${i}`, i < 1 ? 'GK' : i < 6 ? 'DEF' : i < 11 ? 'MID' : 'FWD', 5.0, 2);
      store.addPlayer(p);
    }
    store.setCaptain(400);

    await expect(useFantasyStore.getState().submitSquad('Fail')).rejects.toThrow('API error');
    const state = useFantasyStore.getState();
    expect(state.loading).toBe(false);
    expect(state.error).toBe('API error');
  });

  it('clearError resets error to null', () => {
    useFantasyStore.setState({ error: 'Something went wrong' });
    useFantasyStore.getState().clearError();
    expect(useFantasyStore.getState().error).toBeNull();
  });
});
