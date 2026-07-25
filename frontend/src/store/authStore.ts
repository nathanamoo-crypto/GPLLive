import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError } from 'axios';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import api, { configureApiAuth, EmailNotVerifiedError, getApiErrorMessage, isEmailNotVerifiedError } from '../services/api';
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

function normalizeUser(raw: Partial<User> & { name?: string; fullName?: string; favouriteClub?: { id?: number; fullName?: string } | Club; subscription?: ClubSubscription; premium?: boolean }): User {
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
    // Backend's UserProfileResponse field is `premium` (Lombok boolean,
    // Jackson key "premium") - deliberately not named isPremium there to
    // keep the getter/JSON key unambiguous (see PlayerAnalysisResponse for
    // the same convention). Mapped to isPremium on this side to read
    // naturally alongside the rest of the User type.
    isPremium: !!raw.premium,
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
          // A correct password on an unverified account gets a distinct
          // error type so RegisterLoginScreen can route straight to
          // VerifyEmailScreen instead of just showing an error string.
          if (isEmailNotVerifiedError(error)) {
            throw new EmailNotVerifiedError(getApiErrorMessage(error, 'Please verify your email before logging in.'));
          }
          throw new Error(getApiErrorMessage(error, 'Login failed'));
        }
      },
      // Creates the account but does NOT log the user in - the backend
      // only returns a real token from verifyEmail() once the emailed code
      // is confirmed. No auth state is set here; RegisterLoginScreen
      // navigates to VerifyEmailScreen on success instead of calling
      // goToNextStep().
      // username is a distinct, user-typed, unique field (separate from
      // fullName, which is never required to be unique) - the backend
      // returns a 409 if it's already taken.
      register: async (username, fullName, email, password, favouriteClubId) => {
        try {
          await api.post<{ email: string; message: string }>(
            AuthEndpoints.REGISTER,
            { username, email, password, fullName, favouriteClubId },
          );
        } catch (error) {
          throw new Error(getApiErrorMessage(error, 'Registration failed'));
        }
      },
      verifyEmail: async (email, code) => {
        try {
          const response = await api.post<{ token: string; username: string; userId: number }>(
            AuthEndpoints.VERIFY_EMAIL,
            { email, code },
          );
          const { token, username, userId } = response.data;

          if (!token || !username) {
            throw new Error('Invalid verification response');
          }

          const user: User = {
            id: userId ?? 0,
            username,
            email,
            predictionPoints: 0,
            reactionsPosted: 0,
            badges: [],
          };

          set({ user, token, isAuthenticated: true });

          // Same best-effort profile fetch as login()/register() - this is
          // where `user.favouriteClub` (already set during the registration
          // form, before verification) actually gets populated.
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
          throw new Error(getApiErrorMessage(error, 'Verification failed'));
        }
      },
      resendVerificationCode: async (email) => {
        try {
          await api.post<{ email: string; message: string }>(
            AuthEndpoints.RESEND_VERIFICATION,
            { email },
          );
        } catch (error) {
          throw new Error(getApiErrorMessage(error, 'Unable to resend the code'));
        }
      },
      loginWithGoogle: async (idToken) => {
        try {
          const response = await api.post<{ token: string; username: string; userId: number }>(
            AuthEndpoints.GOOGLE,
            { idToken },
          );
          const { token, username, userId } = response.data;

          if (!token || !username) {
            throw new Error('Invalid Google sign-in response');
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

          // Same best-effort profile fetch as login()/register() - for a
          // brand-new Google user this comes back with favouriteClub
          // unset, which is exactly the signal RegisterLoginScreen's
          // goToNextStep() uses to route to PickClub.
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
          throw new Error(getApiErrorMessage(error, 'Google sign-in failed'));
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
