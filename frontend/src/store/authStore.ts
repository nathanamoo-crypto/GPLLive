import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError } from 'axios';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import api, { configureApiAuth, getApiErrorMessage } from '../services/api';
import { AuthEndpoints } from '../constants/apiUrls';
import { AuthState, User, Club, ClubSubscription } from '../types';

function isOfflineError(error: unknown): boolean {
  const axiosError = error as AxiosError;
  return !axiosError.response || axiosError.message === 'Network Error';
}

function normalizeUser(raw: Partial<User> & { name?: string; favouriteClub?: Club; subscription?: ClubSubscription }): User {
  return {
    id: raw.id ?? 0,
    username: raw.username ?? raw.name ?? 'Fan',
    email: raw.email ?? '',
    avatarUrl: raw.avatarUrl,
    favouriteClub: raw.favouriteClub,
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

          try {
            const meResponse = await api.get<{ user: Partial<User> & { name?: string } }>(
              AuthEndpoints.GET_ME,
            );
            if (meResponse.data?.user) {
              set({ user: normalizeUser(meResponse.data.user) });
            }
          } catch {
            // profile fetch is best-effort
          }
        } catch (error) {
          throw new Error(getApiErrorMessage(error, 'Login failed'));
        }
      },
      register: async (username, email, password) => {
        try {
          const response = await api.post<{ token: string; username: string; userId: number }>(
            AuthEndpoints.REGISTER, { username, email, password },
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
      setFavouriteClub: async (club: Club) => {
        const currentUser = get().user;
        if (!currentUser) {
          throw new Error('No user available');
        }

        const saveLocally = () => {
          set({ user: { ...currentUser, favouriteClub: club } });
        };

        const token = get().token;
        if (token === 'demo-token') {
          saveLocally();
          return;
        }

        try {
          const response = await api.patch<{ user: Partial<User> & { name?: string } }>(
            AuthEndpoints.UPDATE_ME, { favouriteClubId: club.id },
          );

          const updatedUser = response.data?.user
            ? normalizeUser(response.data.user)
            : { ...currentUser, favouriteClub: club };

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
