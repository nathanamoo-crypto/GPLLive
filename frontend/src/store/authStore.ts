import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError } from 'axios';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import api, { configureApiAuth, getApiErrorMessage } from '../services/api';
import { AuthEndpoints } from '../constants/apiUrls';
import { AuthState, User, Club, ClubSubscription } from '../types';
import { backendClubToLocalClub } from '../services/clubService';

function isOfflineError(error: unknown): boolean {
  const axiosError = error as AxiosError;
  return !axiosError.response || axiosError.message === 'Network Error';
}

// Backend's GET/PATCH /auth/users/me returns favouriteClub as
// {id, fullName, shortName, logoUrl} (the real backend club) - resolve that
// to this app's local Club shape (for badge/asset lookups) via the explicit
// name mapping, rather than trusting the backend's id against local data.
function resolveFavouriteClub(raw: { id?: number; fullName?: string } | null | undefined): Club | undefined {
  if (!raw?.fullName) return undefined;
  return backendClubToLocalClub(raw.fullName) ?? undefined;
}

function normalizeUser(raw: Partial<User> & { name?: string; fullName?: string; favouriteClub?: { id?: number; fullName?: string } | Club; subscription?: ClubSubscription }): User {
  const favouriteClub = raw.favouriteClub && 'slug' in raw.favouriteClub
    ? (raw.favouriteClub as Club)
    : resolveFavouriteClub(raw.favouriteClub as { id?: number; fullName?: string } | undefined);

  return {
    id: raw.id ?? 0,
    username: raw.username ?? raw.name ?? raw.fullName ?? 'Fan',
    email: raw.email ?? '',
    avatarUrl: raw.avatarUrl,
    favouriteClub,
    fantasyRank: raw.fantasyRank,
    predictionPoints: raw.predictionPoints ?? 0,
    reactionsPosted: raw.reactionsPosted ?? 0,
    badges: raw.badges ?? [],
    subscription: raw.subscription,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      onboardingComplete: false,
      isAuthenticated: false,
      splashKey: 0,
      login: async (email, password) => {
        try {
          const response = await api.post<{ token: string; username: string; userId: number }>(
            AuthEndpoints.LOGIN, { email, password },
          );
          const { token, username, userId } = response.data;

          if (!token || !username) {
            throw new Error('Invalid auth response');
          }

          const user: User = {
            id: userId ?? 0,
            username,
            email: '',
            predictionPoints: 0,
            reactionsPosted: 0,
            badges: [],
          };

          set({ user, token, isAuthenticated: true });

          // Best-effort - backend's GET /auth/users/me returns the profile
          // flat (no wrapper), including favouriteClub if one was set at
          // registration. If this fails, the login already succeeded above.
          try {
            const meResponse = await api.get<Partial<User> & { fullName?: string; favouriteClub?: { id?: number; fullName?: string } }>(
              AuthEndpoints.GET_ME,
            );
            if (meResponse.data) {
              set({ user: normalizeUser(meResponse.data) });
            }
          } catch {
            // profile fetch is best-effort
          }
        } catch (error) {
          throw new Error(getApiErrorMessage(error, 'Login failed'));
        }
      },
      register: async (username, email, password, favouriteClubId) => {
        try {
          const response = await api.post<{ token: string; username: string; userId: number }>(
            AuthEndpoints.REGISTER,
            { username, email, password, fullName: username, favouriteClubId },
          );
          const { token, username: returnedUsername, userId } = response.data;

          if (!token || !returnedUsername) {
            throw new Error('Invalid register response');
          }

          const user: User = {
            id: userId ?? 0,
            username: returnedUsername,
            email,
            predictionPoints: 0,
            reactionsPosted: 0,
            badges: [],
          };

          set({ user, token, isAuthenticated: true });

          // Fetch the full profile so `user.favouriteClub` is populated -
          // RegisterLoginScreen relies on this being set to skip the
          // fallback club-picker step after a fresh registration.
          try {
            const meResponse = await api.get<Partial<User> & { fullName?: string; favouriteClub?: { id?: number; fullName?: string } }>(
              AuthEndpoints.GET_ME,
            );
            if (meResponse.data) {
              set({ user: normalizeUser(meResponse.data) });
            }
          } catch {
            // profile fetch is best-effort
          }
        } catch (error) {
          throw new Error(getApiErrorMessage(error, 'Registration failed'));
        }
      },
      loginDemo: async () => {
        const demoUser: User = {
          id: 999,
          username: 'Demo User',
          email: 'demo@example.com',
          predictionPoints: 0,
          reactionsPosted: 0,
          badges: [],
        };

        set({ user: demoUser, token: 'demo-token', isAuthenticated: true });
      },
      logout: async () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      resetOnboarding: () => {
        set({ onboardingComplete: false, splashKey: get().splashKey + 1 });
      },
      setFavouriteClub: async (club: { id: number; fullName: string }) => {
        const currentUser = get().user;
        if (!currentUser) {
          throw new Error('No user available');
        }

        const localClub = resolveFavouriteClub(club);
        const saveLocally = () => {
          set({ user: { ...currentUser, favouriteClub: localClub } });
        };

        const token = get().token;
        if (token === 'demo-token') {
          saveLocally();
          return;
        }

        try {
          const response = await api.patch<Partial<User> & { fullName?: string; favouriteClub?: { id?: number; fullName?: string } }>(
            AuthEndpoints.UPDATE_ME, { favouriteClubId: club.id },
          );

          const updatedUser = response.data
            ? normalizeUser(response.data)
            : { ...currentUser, favouriteClub: localClub };

          set({ user: updatedUser });
        } catch (error) {
          if (isOfflineError(error)) {
            saveLocally();
            return;
          }
          throw new Error(getApiErrorMessage(error, 'Unable to save favourite club'));
        }
      },
      completeOnboarding: () => {
        set({ onboardingComplete: true });
      },
    }),
    {
      name: 'gpl-live-auth-storage-v2',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

configureApiAuth(
  () => useAuthStore.getState().token,
  () => {
    const { token, logout } = useAuthStore.getState();
    if (token && token !== 'demo-token') {
      void logout();
    }
  }
);
