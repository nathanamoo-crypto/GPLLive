/// <reference types="jest" />

import { useFantasyStore } from '../fantasyStore';
import { Club, Player } from '../../types';

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
const MID1 = makePlayer('mid1', 'Test MID1', 'MID', 9.0, 'medeama', 'Medeama SC');
const MID2 = makePlayer('mid2', 'Test MID2', 'MID', 8.0, 'dreams', 'Dreams FC');
const FWD1 = makePlayer('fwd1', 'Test FWD1', 'FWD', 10.0, 'kotoko', 'Asante Kotoko');
const FWD2 = makePlayer('fwd2', 'Test FWD2', 'FWD', 9.5, 'hearts', 'Hearts of Oak');

const resetStore = () => {
  useFantasyStore.setState({
    team: null,
    hasSquad: false,
    draftPlayers: [],
    draftCaptainId: null,
    draftViceCaptainId: null,
    draftStartingPlayerIds: [],
    draftFormation: '4-3-3',
    budget: 100,
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
    // Need 15 players minimum
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

  it('setStartingXI stores starting player IDs', () => {
    const store = useFantasyStore.getState();
    store.setStartingXI(['p1', 'p2', 'p3']);
    expect(useFantasyStore.getState().draftStartingPlayerIds).toEqual(['p1', 'p2', 'p3']);
  });

  it('setFormation stores formation string', () => {
    const store = useFantasyStore.getState();
    store.setFormation('4-4-2');
    expect(useFantasyStore.getState().draftFormation).toBe('4-4-2');
  });

  it('lockTeamForGameweek locks the team and sets deadline', () => {
    const store = useFantasyStore.getState();
    // Need a team first
    store.setCaptain('p1');
    store.lockTeamForGameweek();
    // No team yet, should be no-op
    expect(useFantasyStore.getState().team).toBeNull();

    // Create a team manually via submitSquad
    for (let i = 0; i < 15; i++) {
      const p = makePlayer(`p${i}`, `Player ${i}`, i < 1 ? 'GK' : i < 6 ? 'DEF' : i < 11 ? 'MID' : 'FWD', 5.0, 'kotoko', 'Asante Kotoko');
      store.addPlayer(p);
    }
    store.setCaptain('p0');
    store.submitSquad('Lockable Team').then(() => {
      const afterSubmit = useFantasyStore.getState();
      afterSubmit.lockTeamForGameweek();
      const locked = useFantasyStore.getState();
      expect(locked.team!.isLocked).toBe(true);
      expect(locked.team!.deadline).toBeDefined();
    });
  });

  it('unlockTeam unlocks the team', () => {
    // Setup team
    const store = useFantasyStore.getState();
    for (let i = 0; i < 15; i++) {
      const p = makePlayer(`p${i}`, `Player ${i}`, i < 1 ? 'GK' : i < 6 ? 'DEF' : i < 11 ? 'MID' : 'FWD', 5.0, 'kotoko', 'Asante Kotoko');
      store.addPlayer(p);
    }
    store.setCaptain('p0');
    store.submitSquad('Unlockable Team').then(() => {
      const afterSubmit = useFantasyStore.getState();
      afterSubmit.lockTeamForGameweek();
      expect(useFantasyStore.getState().team!.isLocked).toBe(true);
      afterSubmit.unlockTeam();
      const unlocked = useFantasyStore.getState();
      expect(unlocked.team!.isLocked).toBe(false);
      expect(unlocked.team!.deadline).toBeUndefined();
    });
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
    expect(state.draftViceCaptainId).toBe('mid1'); // unchanged
  });

  it('new initial state fields are set', () => {
    const state = useFantasyStore.getState();
    expect(state.draftViceCaptainId).toBeNull();
    expect(state.draftStartingPlayerIds).toEqual([]);
    expect(state.draftFormation).toBe('4-3-3');
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
    expect(state.draftFormation).toBe('3-5-2');
    expect(state.draftStartingPlayerIds).toEqual(['gk1']);
    expect(state.draftViceCaptainId).toBe('def1');
  });
});
