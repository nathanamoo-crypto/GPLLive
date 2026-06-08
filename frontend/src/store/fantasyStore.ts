import { create } from 'zustand';
import { FantasyPlayer, FantasyState, FantasyTeam, Player } from '../types';

const INITIAL_BUDGET = 100;

export const useFantasyStore = create<FantasyState>((set, get) => ({
  team: null,
  hasSquad: false,
  draftPlayers: [],
  draftCaptainId: null,
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
      return {
        draftPlayers: state.draftPlayers.filter((item) => item.id !== playerId),
        budget: removed ? state.budget + removed.price : state.budget,
      };
    });
  },
  setCaptain: (playerId) => {
    set({ draftCaptainId: playerId });
  },
  submitSquad: async (teamName) => {
    const draftPlayers = get().draftPlayers;
    const captainId = get().draftCaptainId;
    if (draftPlayers.length < 15 || !captainId) {
      throw new Error('Complete squad and select a captain');
    }

    const team: FantasyTeam = {
      id: 'fantasy-team-1',
      userId: 'user-1',
      teamName,
      players: draftPlayers.map((player) => ({ ...player, isStarting: true })),
      captainId,
      totalPoints: 0,
      weekPoints: 0,
      overallRank: 0,
    };

    set({ team, hasSquad: true, draftPlayers: [], draftCaptainId: null, budget: INITIAL_BUDGET });
  },
  resetDraft: () => {
    set({ draftPlayers: [], draftCaptainId: null, budget: INITIAL_BUDGET });
  },
}));
