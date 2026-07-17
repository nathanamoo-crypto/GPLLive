# GPL Live Frontend — Backend Integration Guide (v2, corrected)

This replaces the earlier `Backend-Integration-Guide.md`, which referenced a
navigation structure (`FantasyStack`, `PredictStack`, `ProfileScreen.tsx`)
that no longer exists. It reflects the app exactly as it is committed on
`feature/navigation-setup` today.

## Project Type

Classic Expo (SDK 54) + `@react-navigation/native` (NOT Expo Router).
Entry: `App.tsx` → `src/providers/AppProviders` → `src/navigation/RootNavigator`.

---

## Current Folder Map

```
frontend/
├── App.tsx
├── app.json
├── package.json                    # main: node_modules/expo/AppEntry.js
├── babel.config.js
├── APIDocs.md                      # legacy endpoint sketch — superseded by GPL_Live_API_Endpoints.md
│
└── src/
    ├── providers/
    │   └── AppProviders.tsx        # GestureHandler, SafeArea, QueryClient, fonts (do not touch)
    │
    ├── constants/
    │   ├── apiUrls.ts              ★ ALL microservice base URLs — update when you deploy
    │   ├── clubs.ts                ★ GPL club data (id, name, badge, colours)
    │   ├── colors.ts
    │   ├── routes.ts
    │   ├── layout.ts
    │   ├── logos.ts
    │   └── homeDummyData.ts        # Mock data — remove call sites once matchService/newsService are live
    │
    ├── types/
    │   └── index.ts                ★ ALL TypeScript interfaces — add new API response types here
    │
    ├── services/                    ★ YOUR MAIN WORK AREA
    │   ├── api.ts                  # Shared axios instance — baseURL=AUTH_URL, JWT interceptor, 401 handler
    │   ├── matchService.ts         # MOCK — matches/fixtures
    │   ├── fantasyService.ts       # PARTIALLY WIRED — fetch() based, FANTASY_URL
    │   ├── predictionService.ts    # MOCK — predictions
    │   ├── newsService.ts          # MOCK — news
    │   ├── motmService.ts          # WIRED — uses shared `api` + VOTE_URL override
    │   └── discussionService.ts    # WIRED — uses shared `api` + DISCUSSION_URL override
    │
    ├── store/                       ★ Zustand state — screens call stores, stores call services
    │   ├── authStore.ts            # WIRED — login/register/logout/setFavouriteClub all call real endpoints
    │   ├── fantasyStore.ts         # Squad draft state, FORMATIONS constant (all 5 formations), formation math
    │   └── predictionStore.ts      # Predictions per fixture
    │
    ├── hooks/
    │   └── useMatches.ts           # Wraps matchService with React Query — used for live-tab badge too
    │
    ├── navigation/                  # Do not touch structure unless adding a new screen
    │   ├── types.ts                 # Shared param types (MatchDetailsParams, NewsDetailParams, etc.)
    │   ├── RootNavigator.tsx        # Splash → Onboarding → Auth/PickClub → MainTabNavigator
    │   ├── OnboardingStack.tsx      # Slides → RegisterLogin → PickClub
    │   ├── AuthStack.tsx            # RegisterLogin → PickClub (re-entry path, e.g. after logout)
    │   ├── MainTabNavigator.tsx     # Bottom tabs: Home, Games, Table, News, Fixtures, Profile
    │   ├── HomeStack.tsx            # HomeFeed, NotificationInbox, Subscribe, Payment, Search,
    │   │                            #   MatchDetails, NewsDetail, MotmVote, Discussion
    │   ├── GamesStack.tsx           # GamesRoot (Fantasy + Predictions merged into one screen w/ inner tabs)
    │   ├── TableStack.tsx           # LeagueTable (standings is now its own top-level tab)
    │   ├── NewsStack.tsx            # NewsFeed, NewsDetail
    │   ├── FixturesStack.tsx        # FixturesRoot, MatchDetails, MotmVote, Discussion
    │   └── ProfileStack.tsx         # ProfileRoot → renders MoreScreen.tsx (see note below)
    │
    ├── screens/
    │   ├── onboarding/              # SplashScreen, OnboardingSlides, RegisterLoginScreen, PickClubScreen
    │   ├── home/                    # HomeScreen, NotificationInboxScreen, SearchScreen,
    │   │                            #   SubscribeScreen, PaymentScreen
    │   ├── match/                   # MatchDetailsScreen, MotmVoteScreen, DiscussionScreen
    │   ├── fixtures/                # FixturesRoot (fixtures/results), LeagueTableScreen (standings)
    │   ├── games/                   # GamesRoot — hosts Fantasy + Predictions as inner tabs
    │   ├── fantasy/                 # FantasyRoot — pitch view, lineup step, squad builder
    │   ├── predict/                 # PredictRoot — gameweek predictions + leaderboard
    │   ├── news/                    # NewsScreen, NewsDetailScreen
    │   └── profile/                 # MoreScreen.tsx (LIVE, wired) + ProfileScreen.tsx (DEAD, see below)
    │
    ├── components/
    │   ├── shared/                  # Badge, FixtureRow, IconChip, JerseyChip, MatchCard, etc.
    │   ├── home/, fantasy/, fixtures/, match/, news/, predict/, profile/
    │
    └── utils/
        └── authValidation.ts
```

### ⚠️ Known dead file — clean up before integration

`src/screens/profile/ProfileScreen.tsx` is **not imported anywhere**.
`ProfileStack.tsx` renders `MoreScreen.tsx` for the `ProfileRoot` route — that's
the real, live Profile tab (icons, badges, subscriptions, logout, replay
onboarding). `ProfileScreen.tsx` is an earlier draft that was left behind.
It doesn't break anything today (nothing points at it), but it will
confuse whoever implements profile-editing next. Delete it, or if any of
its logic (e.g. `handleReplayOnboarding`) isn't already in `MoreScreen.tsx`,
port it over first.

---

## Integration Checklist

### Step 1 — Point API URLs to your deployed microservices

Edit only **`src/constants/apiUrls.ts`**. Nothing else should ever contain a
raw `http://` or `https://` string.

```ts
export const AUTH_URL = 'https://gpl-auth.up.railway.app';
export const MATCH_URL = 'https://gpl-matches.up.railway.app';
export const FANTASY_URL = 'https://gpl-fantasy.up.railway.app';
export const VOTE_URL = 'https://gpl-votes.up.railway.app';
export const PREDICT_URL = 'https://gpl-predictions.up.railway.app';
export const NOTIFICATION_URL = 'https://gpl-notifications.up.railway.app';
export const DISCUSSION_URL = 'https://gpl-discussion.up.railway.app'; // confirm real port/service name with Augustine — currently a placeholder
```

There is no `STANDINGS_URL` or `NEWS_URL` or `SEARCH_URL` yet — see the
endpoint list for which service should own each. Add the constant when the
service exists; don't invent a base URL speculatively.

### Step 2 — Replace mocked services with real calls

Two wiring patterns already exist in the codebase — copy whichever matches
the service you're wiring next:

**Pattern A — shared `api` (axios) instance** (auth, motm, discussion already
use this). Preferred for anything needing the JWT header automatically:

```ts
import api from './api';
import { MATCH_URL } from '../constants/apiUrls';

export const getMatches = async (params?: { status?: string; gameweek?: number }) => {
  const { data } = await api.get<Match[]>('/matches', { baseURL: MATCH_URL, params });
  return data;
};
```

**Pattern B — plain `fetch`** (fantasyService.ts uses this today). Fine to
keep for fantasy, but if you want JWT auto-attached, migrate it to Pattern A.

Files to convert from mock → real, in priority order (this is also the
suggested integration order — see the bottom of this doc):

1. `matchService.ts` → `MATCH_URL` + `/matches`, `/matches/:id`
2. `newsService.ts` → new `NEWS_URL` (or `MATCH_URL` if news lives in the
   match-service) + `/news`, `/news/:id`
3. A new `standingsService.ts` → `MATCH_URL` + `/standings` (currently
   `LeagueTableScreen.tsx` and `FixturesRoot.tsx`'s Table tab both use
   local `MOCK_STANDINGS` derived from `GPL_CLUBS` — replace both with this
   one service)
4. `fantasyService.ts` → finish wiring `/fantasy/leaderboard`,
   `/fantasy/leagues*` (squad CRUD is already wired)
5. `predictionService.ts` → `PREDICT_URL` + `/predictions*`
6. A new `notificationService.ts` + `searchService.ts` + `subscriptionService.ts`
   for `NotificationInboxScreen.tsx`, `SearchScreen.tsx`,
   `SubscribeScreen.tsx` / `PaymentScreen.tsx`

### Step 3 — Sync types

Add any new API response fields to `src/types/index.ts`. It already defines
`Match`, `Player`, `FantasyTeam`, `Standing`, `Article`, `NewsItem`,
`Notification`, `Prediction`, `Reaction`, `LeaderboardEntry`, `User`,
`Club`. Use these — don't redefine shapes locally in a screen unless you
also update the shared type.

### Step 4 — Add new screens (only if the backend needs a new one)

1. Create `src/screens/<feature>/YourScreen.tsx`
2. Add its param type to `src/navigation/types.ts`
3. Register the route name in `src/constants/routes.ts`
4. Add a `<Stack.Screen>` entry in the right `src/navigation/<Feature>Stack.tsx`
5. If it needs a data call, add the function to the matching service file
   (or create a new one) — never call `api`/`fetch` directly from a screen.

---

## Data Flow

```
Screen                      Store (Zustand)               Service                    API
──────                      ──────────────                ───────                    ───
User taps login ──────► authStore.login() ──────► api.post('/auth/login') ──► auth-service
                              │
                              ▼
                        set({ user, token })

Screen reads store ────► useAuthStore(state => state.user)
```

- **Screens** call **stores** (or a service directly for read-only, one-shot
  fetches like `FixturesRoot`/`LeagueTableScreen` do today) — never call
  `api`/`fetch` directly from a screen.
- **Stores** call **services**.
- **Hooks** (`useMatches`) wrap services with React Query for cache/refetch.
- `src/services/api.ts`'s interceptor adds `Authorization: Bearer <token>` on
  every request and calls `logout()` automatically on a `401`.

---

## Golden Rules

| Rule | Why |
|---|---|
| Never import `api` or call `fetch` directly in a screen | Always go through a service or store |
| Never hardcode a URL in a screen or service | Use `src/constants/apiUrls.ts` |
| Add new API response shapes to `src/types/index.ts` | Keeps the frontend type-safe end to end |
| Put new UI pieces in `src/components/<feature>/` | Keeps screens thin |
| Don't touch `App.tsx`, `src/providers/`, or restructure `src/navigation/` unless adding a new screen/route | Those are wired once, shared everywhere |
| One service file per backend microservice boundary, not per screen | `fantasyService.ts` should stay the only place `FANTASY_URL` is called |

---

## Suggested integration order (least → most risky)

1. **Auth** — already done; verify against the real `auth-service` contract
   (see endpoint doc) and fix any field-name mismatches in `authStore.ts`'s
   `normalizeUser()`.
2. **Matches/Fixtures** (`matchService.ts`) — read-only, powers Home,
   Fixtures, and the live-badge on the Games tab icon.
3. **Standings** (new `standingsService.ts`) — read-only, powers the Table
   tab and the Fixtures "Table" sub-section.
4. **News** (`newsService.ts`) — read-only.
5. **Fantasy** (`fantasyService.ts`) — has write paths (squad save/lock);
   test against a staging fantasy-service before pointing at production.
6. **Predictions** (`predictionService.ts`) — write paths, gameweek-locked.
7. **MOTM voting** (`motmService.ts`) — already wired, just needs
   `VOTE_URL` pointed at a real host and the assumed response shapes
   confirmed with the backend (flagged in the file itself).
8. **Discussion** (`discussionService.ts`) — already wired, `DISCUSSION_URL`
   is a placeholder; confirm the real service/port before shipping.
9. **Notifications, Search, Subscriptions/Payments** — still fully mocked;
   build the service files last since they're lower priority for MVP.

Each step: point the URL → replace the mock function body → run
`tsc --noEmit` → manually smoke-test the screen(s) that call it → commit.
Don't do two services in the same pass — it makes a broken response hard to
isolate.
