# GPL Live — API Endpoint Reference

Every endpoint listed below corresponds to mock data locations in the frontend.
Use the **File** column to find the `TODO` comment where the fetch/axios call should be inserted.

---

## Auth

| Method | Endpoint | Purpose | Request Body / Params | Response | File |
|--------|----------|---------|----------------------|----------|------|
| `POST` | `/auth/register` | Create account | `{ name, email, password }` | `{ token, user }` | `RegisterLoginScreen.tsx` → `handleSubmit` |
| `POST` | `/auth/login` | Log in | `{ email, password }` | `{ token, user }` | `RegisterLoginScreen.tsx` → `handleSubmit` |
| `POST` | `/auth/demo` | Demo login | – | `{ token, user }` | `RegisterLoginScreen.tsx` → `handleDemo` |
| `POST` | `/auth/google` | Google OAuth | `{ idToken }` | `{ token, user }` | `RegisterLoginScreen.tsx` → `handleGoogleSignIn` |
| `POST` | `/auth/forgot-password` | Send reset email | `{ email }` | `{ message }` | `RegisterLoginScreen.tsx` → `handleForgotPassword` |
| `GET` | `/auth/me` | Validate token, get current user | – | `{ user }` | `authStore.ts` → hydration |

---

## Onboarding / User

| Method | Endpoint | Purpose | Request Body / Params | Response | File |
|--------|----------|---------|----------------------|----------|------|
| `PUT` | `/users/club` | Set favourite club | `{ clubId }` | `{ user }` | `PickClubScreen.tsx` → pick handler |
| `GET` | `/users/me` | Get current profile | – | `{ user }` | `MoreScreen.tsx` → user card |
| `PUT` | `/users/me` | Update profile | `{ username?, avatarUrl? }` | `{ user }` | future edit-profile screen |

---

## Matches & Fixtures

| Method | Endpoint | Purpose | Query Params | Response | File |
|--------|----------|---------|-------------|----------|------|
| `GET` | `/matches` | List matches | `?status=live\|scheduled\|ft&gameweek=24` | `Match[]` | `FixturesRoot.tsx` → `MOCK_MATCHES` |
| `GET` | `/matches/:id` | Single match detail + events | – | `Match + MatchEvent[]` | `MatchDetailsScreen.tsx` → mock |
| `GET` | `/matches/live` | Live matches (for home widget + tab badge) | – | `Match[]` | `HomeScreen.tsx`, `MainTabNavigator.tsx` |

---

## Standings

| Method | Endpoint | Purpose | Query Params | Response | File |
|--------|----------|---------|-------------|----------|------|
| `GET` | `/standings` | Full league table | `?gameweek=24` | `Standing[]` | `FixturesRoot.tsx` → `StandingsView`, `LeagueTableScreen.tsx` |

---

## News

| Method | Endpoint | Purpose | Query Params | Response | File |
|--------|----------|---------|-------------|----------|------|
| `GET` | `/news` | List articles | `?category=GPL\|Black+Stars\|...&page=1&limit=20` | `Article[]` | `NewsScreen.tsx`, `LatestNewsWidget.tsx` |
| `GET` | `/news/:id` | Single article | – | `Article` | `NewsDetailScreen.tsx` → `MOCK_ARTICLE` |

---

## Fantasy

| Method | Endpoint | Purpose | Request Body / Params | Response | File |
|--------|----------|---------|----------------------|----------|------|
| `GET` | `/fantasy/players` | Available players for draft | `?position=GK\|DEF\|MID\|FWD` | `Player[]` | `FantasyRoot.tsx` → `MOCK_PLAYERS` |
| `POST` | `/fantasy/team` | Create/submit squad | `{ teamName, badgeId, captainId, viceCaptainId, startingPlayerIds, formation, playerIds[] }` | `{ team }` | `FantasyRoot.tsx` → `submitSquad` |
| `GET` | `/fantasy/team` | Get current user's team | – | `FantasyTeam` | `FantasyRoot.tsx` → store hydrate |
| `PUT` | `/fantasy/team/lineup` | Update starting XI / captain | `{ startingPlayerIds, captainId, viceCaptainId, formation }` | `{ team }` | `FantasyRoot.tsx` → lineup step |
| `POST` | `/fantasy/team/lock` | Lock team for gameweek | – | `{ team }` | `FantasyRoot.tsx` → `lockTeamForGameweek` |
| `GET` | `/fantasy/leaderboard` | Overall leaderboard | `?page=1&limit=50` | `LeaderboardEntry[]` | `FantasyRoot.tsx` → `MOCK_FANTASY_LEADERBOARD` |
| `GET` | `/fantasy/leagues` | List private leagues | – | `{ leagues: [] }` | `FantasyRoot.tsx` → `MOCK_PRIVATE_LEAGUES` |
| `POST` | `/fantasy/leagues` | Create private league | `{ name, code }` | `{ league }` | `FantasyRoot.tsx` → HubLeagues Create button |
| `GET` | `/fantasy/leagues/:id` | League detail | – | `{ league, members, standings }` | future league detail screen |
| `POST` | `/fantasy/leagues/join` | Join by code | `{ code }` | `{ league }` | future join league screen |

---

## Predictions

| Method | Endpoint | Purpose | Request Body / Params | Response | File |
|--------|----------|---------|----------------------|----------|------|
| `GET` | `/predictions/fixtures` | Get gameweek fixtures for prediction | `?gameweek=24` | `Match[]` | `PredictRoot.tsx` → `MOCK_FIXTURES` |
| `POST` | `/predictions` | Submit predictions | `{ gameweek, predictions: [{ fixtureId, outcome, exactHomeGoals, exactAwayGoals }] }` | `{ success }` | `PredictRoot.tsx` → `submitAll` |
| `GET` | `/predictions/leaderboard` | Prediction league standings | `?page=1&limit=50` | `LeaderboardEntry[]` | `PredictRoot.tsx` → `MOCK_PREDICT_LEADERBOARD` |

---

## Notifications

| Method | Endpoint | Purpose | Query Params | Response | File |
|--------|----------|---------|-------------|----------|------|
| `GET` | `/notifications` | List notifications | `?page=1&limit=20` | `Notification[]` | `NotificationInboxScreen.tsx` → `DUMMY_NOTIFICATIONS` |
| `PUT` | `/notifications/read-all` | Mark all as read | – | `{ success }` | `NotificationInboxScreen.tsx` → `markAllRead` |

---

## Search

| Method | Endpoint | Purpose | Query Params | Response | File |
|--------|----------|---------|-------------|----------|------|
| `GET` | `/search` | Global search | `?q=query&type=player\|club\|news` | `{ results: SearchResult[] }` | `SearchScreen.tsx` → `MOCK_DATA` |

---

## Subscriptions

| Method | Endpoint | Purpose | Request Body / Params | Response | File |
|--------|----------|---------|----------------------|----------|------|
| `GET` | `/subscriptions` | Get available plans + user's plan | – | `{ plans: [], currentPlan: {...}, club: {...} }` | `SubscribeScreen.tsx` → mock |
| `POST` | `/subscriptions` | Create / upgrade subscription | `{ planId, clubId, paymentMethodId }` | `{ subscription }` | `SubscribeScreen.tsx` → subscribe action |
| `POST` | `/subscriptions/payment` | Process payment | `{ cardNumber, expiry, cvv, name }` | `{ success, transactionId }` | `PaymentScreen.tsx` → `handlePay` |
| `GET` | `/subscriptions/:id` | Get subscription details | – | `{ subscription }` | future subscription detail |
| `DELETE` | `/subscriptions/:id` | Cancel subscription | – | `{ success }` | future cancel action |

---

## Reactions (Match Comments)

| Method | Endpoint | Purpose | Request Body / Params | Response | File |
|--------|----------|---------|----------------------|----------|------|
| `GET` | `/matches/:id/reactions` | List reactions for a match | `?page=1&limit=30` | `Reaction[]` | `MatchDetailsScreen.tsx` → mock |
| `POST` | `/matches/:id/reactions` | Post a reaction | `{ text }` | `{ reaction }` | `MatchDetailsScreen.tsx` → post handler |
| `POST` | `/matches/:id/reactions/:reactionId/like` | Like a reaction | – | `{ reaction }` | `MatchDetailsScreen.tsx` → like handler |
