# GPL Live Frontend — Backend Integration Guide

## Project Type

Classic Expo (SDK 54) + `@react-navigation/native` (NOT Expo Router).
Entry: `App.tsx` → `src/providers/AppProviders` → `src/navigation/RootNavigator`.

---

## Folder Map: Where to put files

```
frontend/
├── App.tsx                         # Root component (do not touch)
├── app.json                        # Expo config
├── package.json                    # main: node_modules/expo/AppEntry.js
├── babel.config.js
├── assets/                         # Static images, splash, icons
│
└── src/
    ├── providers/
    │   └── AppProviders.tsx         # GestureHandler, SafeArea, QueryClient, fonts (do not touch)
    │
    ├── constants/
    │   ├── apiUrls.ts              ★ ALL microservice base URLs — update when you deploy
    │   ├── clubs.ts                ★ GPL club data (id, name, badgeUrl, colours)
    │   ├── colors.ts               # App colour palette
    │   ├── routes.ts               # Screen route name constants
    │   ├── layout.ts               # Spacing/sizing tokens
    │   ├── logos.ts                # Logo image require() map
    │   └── homeDummyData.ts        # Mock data for matches/news (replace when API is live)
    │
    ├── types/
    │   └── index.ts                ★ ALL TypeScript interfaces — add new API response types here
    │
    ├── services/                    ★ YOUR MAIN WORK AREA
    │   ├── api.ts                  # Axios instance, interceptors, JWT injection (configured once)
    │   ├── matchService.ts         # Match/fixture API calls (currently mocked)
    │   ├── fantasyService.ts       # Fantasy squad API calls (currently mocked)
    │   ├── predictionService.ts    # Prediction API calls (currently mocked)
    │   └── newsService.ts          # News/article API calls (currently mocked)
    │
    ├── store/                       ★ Zustand state — call your services from here
    │   ├── authStore.ts            # Auth state, login/register/logout
    │   ├── fantasyStore.ts         # Fantasy team draft & submission
    │   └── predictionStore.ts      # Predictions per fixture
    │
    ├── hooks/
    │   ├── useMatches.ts           # React Query hook for match data
    │   └── useNotifications.ts     # Notification hooks
    │
    ├── navigation/                  # Stack navigators (do not touch unless adding a new screen)
    │   ├── types.ts                # Navigation param types
    │   ├── RootNavigator.tsx       # Auth flow / main tab switcher
    │   ├── OnboardingStack.tsx
    │   ├── AuthStack.tsx
    │   ├── MainTabNavigator.tsx    # Bottom tabs: Home, Fantasy, Predict, News, Fixtures, Profile
    │   ├── HomeStack.tsx
    │   ├── FantasyStack.tsx
    │   ├── PredictStack.tsx
    │   ├── NewsStack.tsx
    │   ├── FixturesStack.tsx
    │   └── ProfileStack.tsx
    │
    ├── screens/                     # One folder per tab / flow (add new screens here)
    │   ├── onboarding/             # Slides, RegisterLogin, PickClub, Splash
    │   ├── home/                   # HomeScreen, NotificationInbox, Search, Subscribe, Payment
    │   ├── match/                  # MatchDetailsScreen
    │   ├── fixtures/               # FixturesRoot, LeagueTableScreen
    │   ├── fantasy/                # FantasyRoot
    │   ├── predict/                # PredictRoot
    │   ├── news/                   # NewsScreen, NewsDetailScreen
    │   └── profile/                # ProfileScreen, MoreScreen
    │
    ├── components/                  # Reusable UI components (shared/ / per-feature/)
    │   ├── shared/                 # Badge, FixtureRow, IconChip, JerseyChip, MatchCard, etc.
    │   ├── home/
    │   ├── fantasy/
    │   ├── fixtures/
    │   ├── match/
    │   ├── news/
    │   ├── predict/
    │   └── profile/
    │
    └── utils/
        └── authValidation.ts       # Email/password validators
```

---

## Integration Checklist

### Step 1 — Point API URLs to your deployed microservices

Edit only **`src/constants/apiUrls.ts`**.

```ts
export const AUTH_URL = 'http://localhost:8081';       // → https://gpl-auth.up.railway.app
export const MATCH_URL = 'http://localhost:8082';       // → https://gpl-matches.up.railway.app
export const FANTASY_URL = 'http://localhost:8083';     // → https://gpl-fantasy.up.railway.app
export const VOTE_URL = 'http://localhost:8084';        // → https://gpl-votes.up.railway.app
export const PREDICT_URL = 'http://localhost:8085';     // → https://gpl-predictions.up.railway.app
export const NOTIFICATION_URL = 'http://localhost:8086';// → https://gpl-notifications.up.railway.app
```

### Step 2 — Replace mock services with real API calls

The `src/services/` files return hardcoded data today. Replace each function body with `api.get()` / `api.post()`. The `api` instance already injects the JWT token via interceptor.

**Already done for auth** — look at `src/store/authStore.ts` for a working example:
- `login()` calls `api.post('/auth/login', { email, password })`
- `register()` calls `api.post('/auth/register', { name, email, password })`

**Files to update:**
- `matchService.ts`   → call `MATCH_URL + '/matches'`
- `fantasyService.ts` → call `FANTASY_URL + '/fantasy/...'`
- `predictionService.ts` → call `PREDICT_URL + '/predictions'`
- `newsService.ts`    → call a future news endpoint

### Step 3 — Sync types

New API response fields must be added to `src/types/index.ts`. The frontend uses the interfaces there everywhere.

### Step 4 — Add new screens (if needed)

1. Create file in `src/screens/<feature>/YourScreen.tsx`
2. Add param type in `src/navigation/types.ts`
3. Add route name in `src/constants/routes.ts`
4. Register the screen in the appropriate stack navigator (`src/navigation/<Feature>Stack.tsx`)

---

## Data Flow

```
Screen                      Store (Zustand)               Service                  API
─────                       ──────────────                ───────                  ───
User taps login ──────► authStore.login() ──────► api.post('/auth/login') ──► auth-service
                              │
                              ▼
                        set({ user, token })

Screen reads store ────► useAuthStore(state => state.user)
```

- **Stores** call **services**.
- **Screens** call **stores** (never call API directly).
- **Hooks** (e.g. `useMatches`) wrap stores for React Query patterns.
- The **Axios interceptor** in `src/services/api.ts` adds `Bearer` token on every request and logs out on 401.

---

## Golden Rules

| Rule | Why |
|---|---|
| **Never import `api` directly in a screen** | Always go through a service or store |
| **Never hardcode a URL in a screen** | Use `src/constants/apiUrls.ts` |
| **Add new API response shapes to `src/types/index.ts`** | Keeps the frontend type-safe |
| **Put new UI pieces in `src/components/<feature>/`** | Keeps screens thin |
| **Never touch `App.tsx`, `src/providers/`, or `src/navigation/` unless adding a new screen/route** | Those are wired once |
