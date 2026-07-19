import { create } from 'zustand';
import { FantasyPlayer, FantasyState, FormationKey, FormationDefinition, Player } from '../types';
import * as fantasyService from '../services/fantasyService';

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
      draftPlayers: [...state.draftPlayers, { ...player, fantasyTeamPlayerId: 0, isStarting: false, isCaptain: false, isViceCaptain: false, weekPoints: 0 }],
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
      const team = await fantasyService.createTeam(teamName);

      for (const player of draftPlayers) {
        await fantasyService.addPlayerToSquad(player.id);
      }

      if (startingPlayerIds.length > 0) {
        await fantasyService.setLineup(
          draftPlayers
            .filter((p) => startingPlayerIds.includes(p.id))
            .map((p) => p.id),
        );
      }

      const teamData = await fantasyService.getMyTeam();
      if (!teamData) throw new Error('Failed to load team after creation');

      const updatedCaptain = teamData.players.find((p) => p.id === captainId);
      if (updatedCaptain) {
        await fantasyService.setCaptain(updatedCaptain.fantasyTeamPlayerId);
      }
      if (viceCaptainId) {
        const updatedVC = teamData.players.find((p) => p.id === viceCaptainId);
        if (updatedVC) {
          await fantasyService.setViceCaptain(updatedVC.fantasyTeamPlayerId);
        }
      }

      const finalTeam = await fantasyService.getMyTeam();

      set({
        team: finalTeam,
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
    const currentTeam = get().team;
    if (!currentTeam) return;
    set({ loading: true, error: null });
    try {
      await fantasyService.lockTeamForGameweek();
      set({
        team: { ...currentTeam, isLocked: true },
        loading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to lock team';
      set({ loading: false, error: message });
      throw err;
    }
  },

  unlockTeam: async () => {
    const currentTeam = get().team;
    if (!currentTeam) return;
    set({ loading: true, error: null });
    try {
      await fantasyService.unlockTeam();
      set({
        team: { ...currentTeam, isLocked: false },
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
