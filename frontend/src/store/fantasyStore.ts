import { create } from 'zustand';
import { FantasyPlayer, FantasyState, FormationKey, FormationDefinition, Player } from '../types';
import { saveFantasySquad, lockTeamForGameweek as lockTeamApi, unlockTeam as unlockTeamApi } from '../services/fantasyService';

const INITIAL_BUDGET = 100;

export const FORMATIONS: Record<FormationKey, FormationDefinition> = {
  '4-3-3': { label: '4-3-3', def: 4, mid: 3, fwd: 3 },
  '4-4-2': { label: '4-4-2', def: 4, mid: 4, fwd: 2 },
  '3-4-3': { label: '3-4-3', def: 3, mid: 4, fwd: 3 },
  '4-5-1': { label: '4-5-1', def: 4, mid: 5, fwd: 1 },
  '3-5-2': { label: '3-5-2', def: 3, mid: 5, fwd: 2 },
};

const FORMATION_LOOKUP: Record<string, FormationKey> = {};
for (const key of Object.keys(FORMATIONS) as FormationKey[]) {
  const f = FORMATIONS[key];
  FORMATION_LOOKUP[`${f.def}-${f.mid}-${f.fwd}`] = key;
}

export function computeFormation(def: number, mid: number, fwd: number): FormationKey | null {
  return FORMATION_LOOKUP[`${def}-${mid}-${fwd}`] ?? null;
}

export const useFantasyStore = create<FantasyState>((set, get) => ({
  team: null,
  hasSquad: false,
  draftPlayers: [],
  draftCaptainId: null,
  draftViceCaptainId: null,
  draftStartingPlayerIds: [],
  draftFormation: '4-3-3',
  budget: INITIAL_BUDGET,
  loading: false,
  error: null,

  addPlayer: (player) => {
    const draftPlayers = get().draftPlayers;
    if (draftPlayers.find((item) => item.id === player.id)) return;
    set((state) => ({
      draftPlayers: [...state.draftPlayers, { ...player, isStarting: false, weekPoints: 0 }],
      budget: state.budget - player.price,
    }));
  },

  removePlayer: (playerId) => {
    set((state) => {
      const removed = state.draftPlayers.find((item) => item.id === playerId);
      const newStartingIds = state.draftStartingPlayerIds.filter((id) => id !== playerId);
      const newCaptainId = state.draftCaptainId === playerId ? null : state.draftCaptainId;
      const newViceCaptainId = state.draftViceCaptainId === playerId ? null : state.draftViceCaptainId;
      const newFormation = (() => {
        const starters = state.draftPlayers.filter(
          (p) => newStartingIds.includes(p.id) && p.id !== playerId
        );
        const def = starters.filter((p) => p.position === 'DEF').length;
        const mid = starters.filter((p) => p.position === 'MID').length;
        const fwd = starters.filter((p) => p.position === 'FWD').length;
        return computeFormation(def, mid, fwd) || state.draftFormation;
      })();
      return {
        draftPlayers: state.draftPlayers.filter((item) => item.id !== playerId),
        budget: removed ? state.budget + removed.price : state.budget,
        draftStartingPlayerIds: newStartingIds,
        draftCaptainId: newCaptainId,
        draftViceCaptainId: newViceCaptainId,
        draftFormation: newFormation,
      };
    });
  },

  setCaptain: (playerId) => {
    set((state) => ({
      draftCaptainId: playerId,
      draftViceCaptainId: state.draftViceCaptainId === playerId ? null : state.draftViceCaptainId,
    }));
  },

  setViceCaptain: (playerId) => {
    set((state) => ({
      draftViceCaptainId: playerId,
      draftCaptainId: state.draftCaptainId === playerId ? null : state.draftCaptainId,
    }));
  },

  setStartingXI: (playerIds) => {
    const starters = get().draftPlayers.filter((p) => playerIds.includes(p.id));
    const def = starters.filter((p) => p.position === 'DEF').length;
    const mid = starters.filter((p) => p.position === 'MID').length;
    const fwd = starters.filter((p) => p.position === 'FWD').length;
    const formation = computeFormation(def, mid, fwd) || '4-3-3';
    set({ draftStartingPlayerIds: playerIds, draftFormation: formation });
  },

  setFormation: (formation) => {
    set({ draftFormation: formation });
  },

  submitSquad: async (teamName) => {
    const state = get();
    const draftPlayers = state.draftPlayers;
    const captainId = state.draftCaptainId;
    const viceCaptainId = state.draftViceCaptainId;
    const startingPlayerIds = state.draftStartingPlayerIds;
    const formation = state.draftFormation;
    if (draftPlayers.length < 15 || !captainId) {
      throw new Error('Complete squad and select a captain');
    }

    set({ loading: true, error: null });
    try {
      const playerIds = draftPlayers.map((p) => p.id);
      await saveFantasySquad({
        teamName,
        captainId,
        viceCaptainId: viceCaptainId ?? undefined,
        startingPlayerIds,
        formation,
        playerIds,
      });

      const team = {
        id: 'fantasy-team-1',
        userId: 'user-1',
        teamName,
        players: draftPlayers.map((player) => ({ ...player, isStarting: true })),
        captainId,
        viceCaptainId: viceCaptainId ?? undefined,
        startingPlayerIds: startingPlayerIds.length > 0 ? startingPlayerIds : undefined,
        formation: formation || undefined,
        totalPoints: 0,
        weekPoints: 0,
        overallRank: 0,
      };

      set({
        team,
        hasSquad: true,
        draftPlayers: [],
        draftCaptainId: null,
        draftViceCaptainId: null,
        draftStartingPlayerIds: [],
        draftFormation: '4-3-3',
        budget: INITIAL_BUDGET,
        loading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit squad';
      set({ loading: false, error: message });
      throw err;
    }
  },

  lockTeamForGameweek: async () => {
    const state = get();
    if (!state.team) return;

    set({ loading: true, error: null });
    try {
      await lockTeamApi();
      const nextGwDeadline = new Date();
      nextGwDeadline.setDate(nextGwDeadline.getDate() + 7);
      set({
        team: { ...state.team!, isLocked: true, deadline: nextGwDeadline.toISOString() },
        loading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to lock team';
      set({ loading: false, error: message });
      throw err;
    }
  },

  unlockTeam: async () => {
    const state = get();
    if (!state.team) return;

    set({ loading: true, error: null });
    try {
      await unlockTeamApi();
      set({
        team: { ...state.team!, isLocked: false, deadline: undefined },
        loading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to unlock team';
      set({ loading: false, error: message });
      throw err;
    }
  },

  resetDraft: () => {
    set({
      draftPlayers: [],
      draftCaptainId: null,
      draftViceCaptainId: null,
      draftStartingPlayerIds: [],
      draftFormation: '4-3-3',
      budget: INITIAL_BUDGET,
      loading: false,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
