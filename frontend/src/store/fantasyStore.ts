import { create } from 'zustand';
import { FantasyPlayer, FantasyState, FormationKey, FormationDefinition, Player } from '../types';
import * as fantasyService from '../services/fantasyService';
import { getApiErrorMessage } from '../services/api';

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

export function canApplyFormation(
  targetFormation: FormationKey,
  startingPlayers: FantasyPlayer[]
): { valid: boolean; message?: string } {
  const required = FORMATIONS[targetFormation];
  if (!required) {
    return { valid: false, message: `Unknown formation: ${targetFormation}` };
  }

  const defCount = startingPlayers.filter((p) => p.position === 'DEF').length;
  const midCount = startingPlayers.filter((p) => p.position === 'MID').length;
  const fwdCount = startingPlayers.filter((p) => p.position === 'FWD').length;

  if (defCount !== required.def) {
    return {
      valid: false,
      message:
        defCount > required.def
          ? `You have ${defCount} defenders but ${targetFormation} needs ${required.def}. Bench a defender and promote a midfielder, then try again.`
          : `You have ${defCount} defenders but ${targetFormation} needs ${required.def}. Add a defender from your bench, then try again.`,
    };
  }

  if (midCount !== required.mid) {
    return {
      valid: false,
      message:
        midCount > required.mid
          ? `You have ${midCount} midfielders but ${targetFormation} needs ${required.mid}. Bench a midfielder and promote a forward, then try again.`
          : `You have ${midCount} midfielders but ${targetFormation} needs ${required.mid}. Add a midfielder from your bench, then try again.`,
    };
  }

  if (fwdCount !== required.fwd) {
    return {
      valid: false,
      message:
        fwdCount > required.fwd
          ? `You have ${fwdCount} forwards but ${targetFormation} needs ${required.fwd}. Bench a forward and promote a defender, then try again.`
          : `You have ${fwdCount} forwards but ${targetFormation} needs ${required.fwd}. Add a forward from your bench, then try again.`,
    };
  }

  return { valid: true };
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
  submitProgress: null,
  error: null,

  // Mirrors the backend's per-position squad quota, per-club cap, and budget
  // rules (FantasyTeamPlayerService.addPlayerToSquad: 2 GK, 5 DEF, 5 MID,
  // 3 FWD, 15 total, max 3 players from any one club, never over budget) so
  // the user gets an immediate reason instead of building an "illegal" squad
  // that can only fail later at submit time.
  addPlayer: (player) => {
    const state = get();
    const draftPlayers = state.draftPlayers;

    if (draftPlayers.find((item) => item.id === player.id)) {
      return { success: false, message: `${player.name} is already in your squad` };
    }
    if (draftPlayers.length >= 15) {
      return { success: false, message: 'Your squad already has 15 players' };
    }

    const positionCounts = { GK: 0, DEF: 0, MID: 0, FWD: 0 } as Record<Player['position'], number>;
    for (const p of draftPlayers) {
      positionCounts[p.position] = (positionCounts[p.position] ?? 0) + 1;
    }

    const quota: Record<Player['position'], number> = { GK: 2, DEF: 5, MID: 5, FWD: 3 };
    if (positionCounts[player.position] >= quota[player.position]) {
      return { success: false, message: `You already have ${quota[player.position]} ${player.position}s` };
    }

    const MAX_PER_CLUB = 3;
    const clubCount = draftPlayers.filter((p) => p.clubId === player.clubId).length;
    if (clubCount >= MAX_PER_CLUB) {
      return { success: false, message: `You can only pick ${MAX_PER_CLUB} players from the same club` };
    }

    if (state.budget - player.price < 0) {
      return { success: false, message: `Not enough budget left to add ${player.name}` };
    }

    set((s) => ({
      draftPlayers: [...s.draftPlayers, { ...player, fantasyTeamPlayerId: 0, isStarting: false, isCaptain: false, isViceCaptain: false, weekPoints: 0 }],
      budget: s.budget - player.price,
    }));
    return { success: true };
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
    // Confirming is ~19 sequential backend calls (create team, 15x add
    // player, set lineup, captain, vice-captain) with no visual feedback
    // beforehand - on a cold Render instance that easily runs 30-60s. Without
    // this guard a user who thinks the tap didn't register can fire a SECOND
    // full submitSquad() while the first is still in flight, which calls
    // createTeam() again mid-flight and 409s while the original quietly
    // succeeds behind it. The caller (FantasyRoot) also disables the button
    // while `loading` is true, but this is the real backstop.
    if (state.loading) {
      return;
    }

    const total = draftPlayers.length + 1 + (startingPlayerIds.length > 0 ? 1 : 0) + 1 + (viceCaptainId ? 1 : 0);
    let step = 0;
    const progress = (label: string) => {
      step += 1;
      set({ submitProgress: { label, current: step, total } });
    };

    set({ loading: true, error: null, submitProgress: { label: 'Creating team...', current: 0, total } });
    try {
      const team = await fantasyService.createTeam(teamName);
      const fantasyTeamId = team.teamId;
      progress('Creating team...');

      // addPlayerToSquad requires fantasyTeamId alongside playerId (backend
      // 400s otherwise), and returns the created row's id (fantasyTeamPlayerId)
      // - captain/vice-captain endpoints need THAT id, not the player's id,
      // so track the mapping directly from these responses rather than
      // re-fetching the team afterward (GET /fantasy-teams/my-team doesn't
      // actually return the squad list, so that lookup always silently
      // failed before).
      const playerIdToRowId = new Map<number, number>();
      for (const player of draftPlayers) {
        const { fantasyTeamPlayerId } = await fantasyService.addPlayerToSquad(player.id, fantasyTeamId);
        playerIdToRowId.set(player.id, fantasyTeamPlayerId);
        progress(`Adding ${player.name}...`);
      }

      if (startingPlayerIds.length > 0) {
        await fantasyService.setLineup(
          startingPlayerIds
            .map((id) => playerIdToRowId.get(id))
            .filter((id): id is number => id != null),
        );
        progress('Setting starting XI...');
      }

      const captainRowId = playerIdToRowId.get(captainId);
      if (captainRowId != null) {
        await fantasyService.setCaptain(captainRowId);
        progress('Setting captain...');
      }
      if (viceCaptainId) {
        const viceCaptainRowId = playerIdToRowId.get(viceCaptainId);
        if (viceCaptainRowId != null) {
          await fantasyService.setViceCaptain(viceCaptainRowId);
          progress('Setting vice-captain...');
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
        submitProgress: null,
      });
    } catch (err: unknown) {
      // Axios errors default to a generic "Request failed with status code
      // 409" message - getApiErrorMessage pulls the backend's actual reason
      // (e.g. "You already have a fantasy team") out of the response body
      // instead, so the user (and we, debugging) can actually see why.
      const message = getApiErrorMessage(err, 'Failed to submit squad');
      set({ loading: false, submitProgress: null, error: message });
      throw new Error(message);
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
      submitProgress: null,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
