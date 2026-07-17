/**
 * TODO: Replace `submitSquad` mock with real API call.
 * See APIDocs.md → Fantasy section.
 */
import { create } from 'zustand';
import { FantasyPlayer, FantasyState, FantasyTeam, Player } from '../types';

const INITIAL_BUDGET = 100;

export const useFantasyStore = create<FantasyState>((set, get) => ({
  team: null,
  hasSquad: false,
  draftPlayers: [],
  draftCaptainId: null,
  draftViceCaptainId: null,
  draftStartingPlayerIds: [],
  draftFormation: '4-3-3',
  budget: INITIAL_BUDGET,
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
      return {
        draftPlayers: state.draftPlayers.filter((item) => item.id !== playerId),
        budget: removed ? state.budget + removed.price : state.budget,
        draftStartingPlayerIds: newStartingIds,
        draftCaptainId: newCaptainId,
        draftViceCaptainId: newViceCaptainId,
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
    set({ draftStartingPlayerIds: playerIds });
  },
  setFormation: (formation) => {
    set({ draftFormation: formation });
  },
  submitSquad: async (teamName) => {
    const draftPlayers = get().draftPlayers;
    const captainId = get().draftCaptainId;
    const viceCaptainId = get().draftViceCaptainId;
    const startingPlayerIds = get().draftStartingPlayerIds;
    const formation = get().draftFormation;
    if (draftPlayers.length < 15 || !captainId) {
      throw new Error('Complete squad and select a captain');
    }

    const team: FantasyTeam = {
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

    set({ team, hasSquad: true, draftPlayers: [], draftCaptainId: null, draftViceCaptainId: null, draftStartingPlayerIds: [], draftFormation: '4-3-3', budget: INITIAL_BUDGET });
  },
  lockTeamForGameweek: () => {
    const team = get().team;
    if (!team) return;
    const nextGwDeadline = new Date();
    nextGwDeadline.setDate(nextGwDeadline.getDate() + 7);
    set({ team: { ...team, isLocked: true, deadline: nextGwDeadline.toISOString() } });
  },
  unlockTeam: () => {
    const team = get().team;
    if (!team) return;
    set({ team: { ...team, isLocked: false, deadline: undefined } });
  },
  resetDraft: () => {
    set({ draftPlayers: [], draftCaptainId: null, draftViceCaptainId: null, draftStartingPlayerIds: [], draftFormation: '4-3-3', budget: INITIAL_BUDGET });
  },
}));
