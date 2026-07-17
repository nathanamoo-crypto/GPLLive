# GPL Live — Complete Required Backend Endpoint List

Consolidated from every screen, store, and service in the frontend
(`feature/navigation-setup` branch). This supersedes `APIDocs.md`, which was
written against an older navigation structure. Types referenced (`Match`,
`Player`, `Standing`, etc.) are defined in `src/types/index.ts`.

Status legend:
- ✅ **Wired** — frontend already calls this endpoint; only needs a real host.
- 🟡 **Partially wired** — some functions in the service call real endpoints, others are still mock.
- ⬜ **Mocked** — frontend has a service function with hardcoded data; needs the real call written.
- 🆕 **No service file yet** — screen has its own local mock; needs a new service created.

---

## 1. auth-service (`AUTH_URL`)

| Status | Method | Endpoint | Purpose | Request Body | Response | Called from |
|---|---|---|---|---|---|---|
| ✅ | POST | `/auth/register` | Create account | `{ name, email, password }` | `{ token, user }` | `authStore.ts` → `register()` |
| ✅ | POST | `/auth/login` | Log in | `{ email, password }` | `{ token, user }` | `authStore.ts` → `login()` |
| ✅ | PATCH | `/auth/users/me` | Set/update favourite club | `{ favouriteClubId }` | `{ user }` | `authStore.ts` → `setFavouriteClub()` |
| ⬜ | GET | `/auth/users/me` | Validate token / hydrate current user on app open | – | `{ user }` | Not yet called — add to `RootNavigator.tsx` hydration or `authStore.ts` init |
| ⬜ | POST | `/auth/forgot-password` | Send password reset email | `{ email }` | `{ message }` | `RegisterLoginScreen.tsx` (UI present, not wired) |
| 🆕 | POST | `/auth/google` | Google OAuth sign-in | `{ idToken }` | `{ token, user }` | `RegisterLoginScreen.tsx` → `handleGoogleSignIn` (button exists, no service call) |

**`user` object shape expected everywhere** (see `normalizeUser()` in `authStore.ts` — it already tolerates a few field-name variants, but confirm these with Augustine so the fallback logic can be deleted):
```ts
{
  id: string;
  username: string;       // authStore also accepts `name`
  email: string;
  avatarUrl?: string;
  favouriteClub?: Club;
  fantasyRank?: number;
  predictionPoints: number;
  reactionsPosted: number;
  badges: string[];       // subset of 'Prediction King' | 'Top Reactor' | 'Club Loyalist' | 'MOTM Master'
  subscription?: { clubId, club, status: 'active'|'cancelled'|'expired', renewalDate };
}
```

---

## 2. match-service (`MATCH_URL`)

| Status | Method | Endpoint | Purpose | Query params | Response | Called from |
|---|---|---|---|---|---|---|
| ⬜ | GET | `/matches` | List matches (fixtures + results) | `?status=scheduled\|live\|finished&gameweek=24` | `Match[]` | `matchService.ts` → `getMatches()`, used by `FixturesRoot.tsx`, `HomeScreen.tsx`, `useMatches.ts` |
| ⬜ | GET | `/matches/:id` | Single match detail | – | `Match` | `matchService.ts` → `getMatchDetails()`, `MatchDetailsScreen.tsx` |
| ⬜ | GET | `/matches/:id/events` | Goals, cards, subs timeline | – | `MatchEvent[]` | `matchService.ts` → `getMatchEvents()`, `MatchDetailsScreen.tsx` |
| 🆕 | GET | `/matches/live` | Live matches only (powers Home widget + tab-icon live dot) | – | `Match[]` | Currently derived client-side from `/matches`; fine to keep client-side filtering instead of adding this |
| 🆕 | GET | `/clubs` | Full club list w/ badges, colours, city | – | `Club[]` | Currently hardcoded in `src/constants/clubs.ts` (`GPL_CLUBS`) — **recommend backing this with a real endpoint once roster/branding can change without an app release**, otherwise clubs.ts can stay static for MVP |

**`Match` shape:**
```ts
{
  id: string;
  homeClub: Club; awayClub: Club;
  homeScore: number | null; awayScore: number | null;
  status: 'scheduled' | 'live' | 'finished';
  kickoffTime: string; // ISO
  liveMinute?: number;
  venue: string; round: number; gameweek: number;
}
```
`MatchEvent`: `{ id, matchId, type: 'goal'|'yellow_card'|'red_card'|'substitution', minute, playerName, side: 'home'|'away' }`

---

## 3. standings (owner TBD — recommend match-service)

| Status | Method | Endpoint | Purpose | Query params | Response | Called from |
|---|---|---|---|---|---|---|
| 🆕 | GET | `/standings` | Full league table | `?gameweek=24` | `Standing[]` | No service file exists yet — `LeagueTableScreen.tsx` and `FixturesRoot.tsx`'s Table sub-section both compute a mock table locally from `GPL_CLUBS`. **Create `standingsService.ts` and point both screens at it.** |

**`Standing` shape (already defined in `types/index.ts` — reuse it):**
```ts
{ position, club: Club, played, won, drawn, lost, goalDifference, points, form: ('W'|'D'|'L')[] }
```

---

## 4. fantasy-service (`FANTASY_URL`)

| Status | Method | Endpoint | Purpose | Request/Query | Response | Called from |
|---|---|---|---|---|---|---|
| ✅ | GET | `/fantasy/players` | Player pool for the squad builder | `?position=GK\|DEF\|MID\|FWD` | `Player[]` | `fantasyService.ts` → `fetchPlayers()` |
| ✅ | POST | `/fantasy/team` | Save/submit squad | `SaveSquadPayload` (below) | `{ team: FantasyTeam }` | `fantasyService.ts` → `saveFantasySquad()` |
| ✅ | POST | `/fantasy/team/lock` | Lock team for the gameweek | – | `{ team: FantasyTeam }` | `fantasyService.ts` → `lockTeamForGameweek()` |
| ✅ | DELETE | `/fantasy/team/lock` | Unlock team | – | `{ team: FantasyTeam }` | `fantasyService.ts` → `unlockTeam()` |
| ⬜ | GET | `/fantasy/team` | Get current user's saved team (hydrate on app open) | – | `{ team: FantasyTeam }` | Needed by `FantasyRoot.tsx` on mount — not yet called |
| 🆕 | GET | `/fantasy/leaderboard` | Overall fantasy leaderboard | `?page=1&limit=50` | `LeaderboardEntry[]` | `FantasyRoot.tsx` still uses `MOCK_FANTASY_LEADERBOARD` |
| 🆕 | GET | `/fantasy/leagues` | List user's private leagues | – | `{ leagues: [] }` | `FantasyRoot.tsx` still uses `MOCK_PRIVATE_LEAGUES` |
| 🆕 | POST | `/fantasy/leagues` | Create a private league | `{ name, code }` | `{ league }` | "Create" button in Hub/Leagues section — no call yet |
| 🆕 | POST | `/fantasy/leagues/join` | Join a league by code | `{ code }` | `{ league }` | No screen yet — needed before leagues ship |
| 🆕 | GET | `/fantasy/leagues/:id` | League detail (members + mini-table) | – | `{ league, members, standings }` | No screen yet (explicitly out of scope for current sprint per project scope rules — build after MVP) |

**`SaveSquadPayload`:**
```ts
{
  teamName: string; badgeId?: string;
  captainId: string; viceCaptainId?: string;
  startingPlayerIds: string[];
  formation: '4-3-3' | '4-4-2' | '3-4-3' | '4-5-1' | '3-5-2';
  playerIds: string[]; // full 15/squad-size list, not just starters
}
```
`FantasyTeam`: `{ id, userId, teamName, players: FantasyPlayer[], captainId, viceCaptainId?, totalPoints, weekPoints, overallRank, startingPlayerIds?, formation?, isLocked?, deadline? }`
`FantasyPlayer` = `Player & { isStarting: boolean; weekPoints: number }`

**Open decision — flag to backend before finalizing the squad-save contract:**
When a user switches formation (e.g. 4-4-2 → 3-5-2) their currently-selected
starting XI may no longer satisfy the new DEF/MID/FWD split. The frontend
needs to know whether the backend will (a) reject a lineup that doesn't
match `formation`'s counts, or (b) accept any 11 players and let the client
enforce formation shape. This determines whether `FantasyRoot.tsx` needs a
"players to bench" confirmation step before calling `saveFantasySquad()`.

---

## 5. prediction-service (`PREDICT_URL`)

| Status | Method | Endpoint | Purpose | Request/Query | Response | Called from |
|---|---|---|---|---|---|---|
| ⬜ | GET | `/predictions/fixtures` | Gameweek fixtures open for prediction | `?gameweek=24` | `Match[]` | `PredictRoot.tsx` still uses `MOCK_FIXTURES` |
| ⬜ | POST | `/predictions` | Submit predictions | `{ gameweek, predictions: [{ fixtureId, outcome, exactHomeGoals, exactAwayGoals }] }` | `{ success: boolean }` | `predictionService.ts` → `submitPredictions()` (currently just logs + sleeps) |
| 🆕 | GET | `/predictions/leaderboard` | Prediction league standings | `?page=1&limit=50` | `LeaderboardEntry[]` | `PredictRoot.tsx` still uses `MOCK_PREDICT_LEADERBOARD` |
| 🆕 | GET | `/predictions/me` | Current user's saved predictions for a gameweek (hydrate on open) | `?gameweek=24` | `Prediction[]` | `predictionStore.ts` has no hydrate call yet |

`Prediction`: `{ fixtureId, outcome: 'home'|'draw'|'away'|null, exactHomeGoals?, exactAwayGoals?, locked, submitted }`

---

## 6. vote-service (`VOTE_URL`) — MOTM voting

Already wired in `motmService.ts`. Response shapes below are **assumed**,
inferred from REST convention and the old `apiUrls.ts` comments — confirm
with backend before deploying, the file itself is flagged with a "do not
trust blindly" comment.

| Status | Method | Endpoint | Purpose | Request | Response |
|---|---|---|---|---|---|
| ✅ (contract unconfirmed) | GET | `/votes/motm/:matchId/candidates` | Candidate list for a match | – | `{ candidates: MotmCandidate[], hasVoted: boolean, votedPlayerId? }` |
| ✅ (contract unconfirmed) | POST | `/votes/motm/:matchId` | Submit a vote | `{ playerId }` | `{ success: boolean }` |
| ✅ (contract unconfirmed) | GET | `/votes/motm/:matchId/results` | Vote tallies | – | `{ results: MotmResult[], totalVotes: number }` |

`MotmCandidate`: `{ playerId, playerName, clubId, position }`
`MotmResult`: `{ playerId, playerName, clubId, votes, percentage }`

**Action item:** confirm with backend whether `hasVoted` is actually
returned, or whether the client should infer "already voted" from a
non-empty results response — `motmService.ts` has a comment flagging this
ambiguity.

---

## 7. discussion-service (`DISCUSSION_URL`) — placeholder, unconfirmed

`discussionService.ts` is fully wired against an assumed contract, but
`DISCUSSION_URL` is a **placeholder value** (`http://localhost:8087`) — do
not deploy without confirming the real host/port with Augustine first.

| Status | Method | Endpoint | Purpose | Request | Response |
|---|---|---|---|---|---|
| ✅ (contract unconfirmed) | GET | `/discussions/:fixtureId` | List messages for a match thread | – | `{ messages: DiscussionMessage[] }` |
| ✅ (contract unconfirmed) | POST | `/discussions/:fixtureId` | Post a message | `{ message }` | `{ message: DiscussionMessage }` |

`DiscussionMessage`: `{ id, userId, username, message, createdAt }`

---

## 8. news (owner TBD — recommend a dedicated news-service or match-service)

| Status | Method | Endpoint | Purpose | Query | Response | Called from |
|---|---|---|---|---|---|---|
| ⬜ | GET | `/news` | List articles | `?category=GPL\|Black Stars\|AFCON\|Transfers&page=1&limit=20` | `NewsItem[]` | `newsService.ts` → `getLatestNews()`, feeds `NewsScreen.tsx` and the Home "Latest News" widget |
| ⬜ | GET | `/news/:id` | Full article | – | `Article` | `newsService.ts` → `getArticleDetails()`, `NewsDetailScreen.tsx` |

`NewsItem` (list card): `{ id, headline, source, category, time }`
`Article` (detail): `{ id, headline, body, thumbnailUrl, category, source, publishedAt, author?, url }`

---

## 9. notification-service (`NOTIFICATION_URL`)

| Status | Method | Endpoint | Purpose | Request/Query | Response | Called from |
|---|---|---|---|---|---|---|
| 🆕 | POST | `/notifications/register` | Register Expo push token | `{ expoPushToken, userId }` | `{ success }` | Not yet called anywhere — needed before push notifications work at all; call on login success and app foreground |
| 🆕 | GET | `/notifications` | List in-app notifications | `?page=1&limit=20` | `Notification[]` | `NotificationInboxScreen.tsx` still uses `DUMMY_NOTIFICATIONS` |
| 🆕 | PUT | `/notifications/read-all` | Mark all as read | – | `{ success }` | `NotificationInboxScreen.tsx` → `markAllRead()` (local state only today) |
| 🆕 | PUT | `/notifications/:id/read` | Mark a single notification read | – | `{ success }` | Not yet called — needed if per-item read-state should persist server-side |
| 🆕 | POST | `/notifications/send` | (Backend-internal, not called by the client) | – | – | Documents server-triggered push for goal alerts, deadline reminders, rank updates |

`Notification`: `{ id, type: 'goal'|'fantasy'|'prediction'|'subscription'|'general', title, body, read, createdAt }`

---

## 10. search (owner TBD)

| Status | Method | Endpoint | Purpose | Query | Response | Called from |
|---|---|---|---|---|---|---|
| 🆕 | GET | `/search` | Global search across players/clubs/news | `?q=query&type=player\|club\|news` | `{ results: SearchResult[] }` | `SearchScreen.tsx` still uses local `MOCK_DATA`; comment in file points here: `// TODO: Replace with API call — see APIDocs.md → GET /search` |

---

## 11. subscriptions & payments (owner TBD — likely its own service, wraps Paystack)

| Status | Method | Endpoint | Purpose | Request | Response | Called from |
|---|---|---|---|---|---|---|
| 🆕 | GET | `/subscriptions` | Available plans + user's current plan | – | `{ plans: [], currentPlan, club }` | `SubscribeScreen.tsx` still fully mocked |
| 🆕 | POST | `/subscriptions` | Create/upgrade subscription | `{ planId, clubId, paymentMethodId }` | `{ subscription }` | `SubscribeScreen.tsx` |
| 🆕 | POST | `/subscriptions/payment` | Process payment (Paystack) | `{ cardNumber, expiry, cvv, name }` or Paystack token, depending on final flow | `{ success, transactionId }` | `PaymentScreen.tsx` → `handlePay()` |
| 🆕 | GET | `/subscriptions/:id` | Subscription detail | – | `{ subscription }` | No screen yet |
| 🆕 | DELETE | `/subscriptions/:id` | Cancel subscription | – | `{ success }` | No screen yet |

⚠️ **Payment security note:** `PaymentScreen.tsx` currently has local state
for raw card number/CVV. Before wiring this for real, confirm with the
backend that card details go straight to Paystack (client-side Paystack SDK
or a tokenized field) and never touch the app's own backend in plaintext —
do not simply POST raw card fields to `/subscriptions/payment` as the mock
suggests.

---

## 12. reactions (match comments — owner TBD, likely match-service)

| Status | Method | Endpoint | Purpose | Request/Query | Response | Called from |
|---|---|---|---|---|---|---|
| 🆕 | GET | `/matches/:id/reactions` | List reactions on a match | `?page=1&limit=30` | `Reaction[]` | `MatchDetailsScreen.tsx` — mocked |
| 🆕 | POST | `/matches/:id/reactions` | Post a reaction | `{ text }` | `{ reaction }` | `MatchDetailsScreen.tsx` — mocked |
| 🆕 | POST | `/matches/:id/reactions/:reactionId/like` | Like a reaction | – | `{ reaction }` | `MatchDetailsScreen.tsx` — mocked |

`Reaction`: `{ id, matchId, userId, username, userClub: Club, text, likeCount, isLikedByMe, createdAt }`

---

## Deferred / post-MVP (flagged in project memory, don't build service files yet)

- **Live poll job** — not a client-called endpoint; backend polls an
  external provider every ~30s during match windows and diffs against
  `live_match_state`. The client just needs `/matches` and `/matches/:id`
  to reflect updated scores — no special frontend endpoint required, but the
  team should confirm whether the client should poll or the backend will
  push (WebSocket/SSE) once that job exists.
- **Fantasy scoring job** — same story; client reads
  `FantasyTeam.weekPoints`/`totalPoints` once the backend computes them.
- **Predictions leaderboard scoring** — same, feeds `/predictions/leaderboard`.

---

## Quick count for backend planning

| Service | Confirmed contract, needs deploy | Endpoint exists, contract unconfirmed | Needs to be built |
|---|---|---|---|
| auth-service | 3 | 0 | 3 |
| match-service | 0 | 0 | 3 (+ optional `/clubs`) |
| standings | 0 | 0 | 1 |
| fantasy-service | 4 | 0 | 6 |
| prediction-service | 0 | 0 | 4 |
| vote-service | 0 | 3 (contract unconfirmed) | 0 |
| discussion-service | 0 | 2 (host unconfirmed) | 0 |
| news | 0 | 0 | 2 |
| notification-service | 0 | 0 | 5 |
| search | 0 | 0 | 1 |
| subscriptions/payments | 0 | 0 | 5 |
| reactions | 0 | 0 | 3 |

**Total: 39 endpoints** across 12 domains. 4 are live and wired end-to-end,
5 have a frontend contract already written but need the real host
confirmed, and 30 need both a backend implementation and the frontend mock
swapped out.
