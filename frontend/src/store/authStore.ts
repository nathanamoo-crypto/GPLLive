import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError } from 'axios';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import api, { configureApiAuth, getApiErrorMessage } from '../services/api';
import { AuthState, User, Club } from '../types';

function isOfflineError(error: unknown): boolean {
  const axiosError = error as AxiosError;
  return !axiosError.response || axiosError.message === 'Network Error';
}

function normalizeUser(rawUser: Partial<User> & { name?: string }): User {
  return {
    id: rawUser.id ?? '',
    username: rawUser.username ?? rawUser.name ?? 'Fan',
    email: rawUser.email ?? '',
    avatarUrl: rawUser.avatarUrl,
    favouriteClub: rawUser.favouriteClub,
    fantasyRank: rawUser.fantasyRank,
    predictionPoints: rawUser.predictionPoints ?? 0,
    reactionsPosted: rawUser.reactionsPosted ?? 0,
    badges: rawUser.badges ?? [],
    subscription: rawUser.subscription,
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
          const response = await api.post<{ token: string; user: Partial<User> & { name?: string } }>(
            '/auth/login', { email, password },
          );
          const token = response.data?.token;
          const user = response.data?.user
            ? normalizeUser(response.data.user)
            : null;

          if (!token || !user) {
            throw new Error('Invalid auth response');
          }

          set({ user, token, isAuthenticated: true });
        } catch (error) {
          throw new Error(getApiErrorMessage(error, 'Login failed'));
        }
      },
      register: async (name, email, password) => {
        try {
          const response = await api.post<{ token: string; user: Partial<User> & { name?: string } }>(
            '/auth/register', { name, email, password },
          );
          const token = response.data?.token;
          const user = response.data?.user
            ? normalizeUser(response.data.user)
            : null;

          if (!token || !user) {
            throw new Error('Invalid register response');
          }

          set({ user, token, isAuthenticated: true });
        } catch (error) {
          throw new Error(getApiErrorMessage(error, 'Registration failed'));
        }
      },
      loginDemo: async () => {
        const demoUser: User = {
          id: 'demo-user-1',
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
            '/auth/users/me', { favouriteClubId: club.id },
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
