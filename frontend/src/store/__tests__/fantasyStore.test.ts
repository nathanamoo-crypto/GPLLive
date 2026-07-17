/// <reference types="jest" />

import { useFantasyStore, computeFormation } from '../fantasyStore';
import { Club, Player, FormationKey } from '../../types';

jest.mock('../../services/fantasyService', () => ({
  saveFantasySquad: jest.fn().mockResolvedValue({ team: {} }),
  lockTeamForGameweek: jest.fn().mockResolvedValue({ team: {} }),
  unlockTeam: jest.fn().mockResolvedValue({ team: {} }),
}));

const makeMockClub = (id: string, name: string): Club => ({
  id,
  name,
  shortName: name.split(' ')[0] || name,
  badgeUrl: `local://${id}`,
  city: 'Test City',
});

const makePlayer = (id: string, name: string, position: 'GK' | 'DEF' | 'MID' | 'FWD', price: number, clubId: string, clubName: string): Player => ({
  id,
  name,
  position,
  price,
  clubId,
  club: makeMockClub(clubId, clubName),
});

const GK = makePlayer('gk1', 'Test GK', 'GK', 6.0, 'hearts', 'Hearts of Oak');
const DEF1 = makePlayer('def1', 'Test DEF1', 'DEF', 7.0, 'kotoko', 'Asante Kotoko');
const DEF2 = makePlayer('def2', 'Test DEF2', 'DEF', 6.5, 'hearts', 'Hearts of Oak');
const DEF3 = makePlayer('def3', 'Test DEF3', 'DEF', 5.5, 'medeama', 'Medeama SC');
const DEF4 = makePlayer('def4', 'Test DEF4', 'DEF', 5.0, 'dreams', 'Dreams FC');
const MID1 = makePlayer('mid1', 'Test MID1', 'MID', 9.0, 'medeama', 'Medeama SC');
const MID2 = makePlayer('mid2', 'Test MID2', 'MID', 8.0, 'dreams', 'Dreams FC');
const MID3 = makePlayer('mid3', 'Test MID3', 'MID', 7.0, 'kotoko', 'Asante Kotoko');
const MID4 = makePlayer('mid4', 'Test MID4', 'MID', 6.0, 'hearts', 'Hearts of Oak');
const FWD1 = makePlayer('fwd1', 'Test FWD1', 'FWD', 10.0, 'kotoko', 'Asante Kotoko');
const FWD2 = makePlayer('fwd2', 'Test FWD2', 'FWD', 9.5, 'hearts', 'Hearts of Oak');
const FWD3 = makePlayer('fwd3', 'Test FWD3', 'FWD', 8.5, 'medeama', 'Medeama SC');

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
    expect(useFantasyStore.getState().draftPlayers[0].id).toBe('gk1');
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
    store.removePlayer('gk1');
    expect(useFantasyStore.getState().budget).toBe(93);
    expect(useFantasyStore.getState().draftPlayers).toHaveLength(1);
  });

  it('removePlayer of non-existent player does nothing', () => {
    const store = useFantasyStore.getState();
    store.addPlayer(GK);
    store.removePlayer('nonexistent');
    expect(useFantasyStore.getState().budget).toBe(94);
    expect(useFantasyStore.getState().draftPlayers).toHaveLength(1);
  });

  it('setCaptain sets draftCaptainId', () => {
    const store = useFantasyStore.getState();
    store.setCaptain('def1');
    expect(useFantasyStore.getState().draftCaptainId).toBe('def1');
  });

  it('submitSquad creates a team and resets draft state', async () => {
    const store = useFantasyStore.getState();
    const players = [GK, DEF1, DEF2, MID1, MID2, FWD1, FWD2];
    for (let i = 0; i < 8; i++) {
      const extra = makePlayer(`extra${i}`, `Extra ${i}`, i < 3 ? 'DEF' : i < 6 ? 'MID' : 'FWD', 5.0, 'bibiani', 'Bibiani Gold Stars');
      players.push(extra);
    }
    for (const p of players) {
      store.addPlayer(p);
    }
    store.setCaptain('def1');
    await useFantasyStore.getState().submitSquad('Test Team');
    const state = useFantasyStore.getState();
    expect(state.hasSquad).toBe(true);
    expect(state.team).not.toBeNull();
    expect(state.team!.teamName).toBe('Test Team');
    expect(state.team!.captainId).toBe('def1');
    expect(state.draftPlayers).toEqual([]);
    expect(state.budget).toBe(100);
  });

  it('submitSquad throws if less than 15 players', async () => {
    const store = useFantasyStore.getState();
    store.addPlayer(GK);
    store.addPlayer(DEF1);
    store.setCaptain('gk1');
    await expect(store.submitSquad('Bad Team')).rejects.toThrow('Complete squad');
  });

  it('submitSquad throws if no captain', async () => {
    const store = useFantasyStore.getState();
    for (let i = 0; i < 15; i++) {
      const p = makePlayer(`p${i}`, `Player ${i}`, 'DEF', 5.0, 'kotoko', 'Asante Kotoko');
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

describe('new actions (Task 2)', () => {
  it('setViceCaptain sets draftViceCaptainId', () => {
    const store = useFantasyStore.getState();
    store.setViceCaptain('mid1');
    expect(useFantasyStore.getState().draftViceCaptainId).toBe('mid1');
  });

  it('setCaptain clears viceCaptainId if same player', () => {
    const store = useFantasyStore.getState();
    store.setViceCaptain('p1');
    store.setCaptain('p1');
    expect(useFantasyStore.getState().draftCaptainId).toBe('p1');
    expect(useFantasyStore.getState().draftViceCaptainId).toBeNull();
  });

  it('setViceCaptain clears captainId if same player', () => {
    const store = useFantasyStore.getState();
    store.setCaptain('p1');
    store.setViceCaptain('p1');
    expect(useFantasyStore.getState().draftViceCaptainId).toBe('p1');
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

    // 1 GK, 4 DEF, 3 MID, 3 FWD => 4-3-3
    store.setStartingXI(['gk1', 'def1', 'def2', 'def3', 'def4', 'mid1', 'mid2', 'mid3', 'fwd1', 'fwd2', 'fwd3']);
    let state = useFantasyStore.getState();
    expect(state.draftStartingPlayerIds).toHaveLength(11);
    expect(state.draftFormation).toBe('4-3-3');

    // Change to 4 DEF, 4 MID, 2 FWD => 4-4-2
    store.setStartingXI(['gk1', 'def1', 'def2', 'def3', 'def4', 'mid1', 'mid2', 'mid3', 'mid4', 'fwd1', 'fwd2']);
    state = useFantasyStore.getState();
    expect(state.draftFormation).toBe('4-4-2');
  });

  it('setFormation stores formation string', () => {
    const store = useFantasyStore.getState();
    store.setFormation('4-4-2');
    expect(useFantasyStore.getState().draftFormation).toBe('4-4-2');
  });

  it('lockTeamForGameweek locks the team and sets deadline', async () => {
    const store = useFantasyStore.getState();
    store.setCaptain('p1');
    store.lockTeamForGameweek();
    expect(useFantasyStore.getState().team).toBeNull();

    for (let i = 0; i < 15; i++) {
      const p = makePlayer(`p${i}`, `Player ${i}`, i < 1 ? 'GK' : i < 6 ? 'DEF' : i < 11 ? 'MID' : 'FWD', 5.0, 'kotoko', 'Asante Kotoko');
      store.addPlayer(p);
    }
    store.setCaptain('p0');
    await useFantasyStore.getState().submitSquad('Lockable Team');

    const afterSubmit = useFantasyStore.getState();
    await afterSubmit.lockTeamForGameweek();
    const locked = useFantasyStore.getState();
    expect(locked.team!.isLocked).toBe(true);
    expect(locked.team!.deadline).toBeDefined();
  });

  it('unlockTeam unlocks the team', async () => {
    const store = useFantasyStore.getState();
    for (let i = 0; i < 15; i++) {
      const p = makePlayer(`p${i}`, `Player ${i}`, i < 1 ? 'GK' : i < 6 ? 'DEF' : i < 11 ? 'MID' : 'FWD', 5.0, 'kotoko', 'Asante Kotoko');
      store.addPlayer(p);
    }
    store.setCaptain('p0');
    await useFantasyStore.getState().submitSquad('Unlockable Team');

    const afterSubmit = useFantasyStore.getState();
    await afterSubmit.lockTeamForGameweek();
    expect(useFantasyStore.getState().team!.isLocked).toBe(true);

    const lockedState = useFantasyStore.getState();
    await lockedState.unlockTeam();
    const unlocked = useFantasyStore.getState();
    expect(unlocked.team!.isLocked).toBe(false);
    expect(unlocked.team!.deadline).toBeUndefined();
  });

  it('removePlayer clears startingIds, captainId, viceCaptainId for removed player', () => {
    const store = useFantasyStore.getState();
    store.addPlayer(GK);
    store.addPlayer(MID1);
    store.setCaptain('gk1');
    store.setViceCaptain('mid1');
    store.setStartingXI(['gk1', 'mid1']);
    store.removePlayer('gk1');
    const state = useFantasyStore.getState();
    expect(state.draftStartingPlayerIds).not.toContain('gk1');
    expect(state.draftCaptainId).toBeNull();
    expect(state.draftViceCaptainId).toBe('mid1');
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
    store.setStartingXI(['gk1']);
    store.setViceCaptain('def1');

    const state = useFantasyStore.getState();
    expect(state.budget).toBe(budgetBefore);
    expect(state.draftPlayers.length).toBe(draftBefore);
    // setStartingXI auto-derives formation; with only GK starters formation is null → falls back to '4-3-3'
    expect(state.draftFormation).toBe('4-3-3');
    expect(state.draftStartingPlayerIds).toEqual(['gk1']);
    expect(state.draftViceCaptainId).toBe('def1');
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
      const p = makePlayer(`p${i}`, `Player ${i}`, i < 1 ? 'GK' : i < 6 ? 'DEF' : i < 11 ? 'MID' : 'FWD', 5.0, 'kotoko', 'Asante Kotoko');
      store.addPlayer(p);
    }
    store.setCaptain('p0');

    const submitPromise = useFantasyStore.getState().submitSquad('Test');
    expect(useFantasyStore.getState().loading).toBe(true);
    await submitPromise;
    expect(useFantasyStore.getState().loading).toBe(false);
  });

  it('submitSquad sets error on failure', async () => {
    const { saveFantasySquad } = require('../../services/fantasyService');
    saveFantasySquad.mockRejectedValueOnce(new Error('API error'));

    const store = useFantasyStore.getState();
    for (let i = 0; i < 15; i++) {
      const p = makePlayer(`p${i}`, `Player ${i}`, i < 1 ? 'GK' : i < 6 ? 'DEF' : i < 11 ? 'MID' : 'FWD', 5.0, 'kotoko', 'Asante Kotoko');
      store.addPlayer(p);
    }
    store.setCaptain('p0');

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
