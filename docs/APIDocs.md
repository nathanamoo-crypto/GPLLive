# GPL Live — API Endpoint Reference

All endpoints except those under `/auth/**` require:
```
Authorization: Bearer <token>
```

Every error response follows this shape:
```json
{ "timestamp": "...", "status": 400, "error": "Bad Request", "message": "...", "path": "/..." }
```

---

## Auth (`/auth`)

| Method | Endpoint | Purpose | Body | Response | Errors |
|--------|----------|---------|------|----------|--------|
| `POST` | `/auth/register` | Create account | `{ username, email, password, fullName, favouriteTeam }` | `{ token, username }` | 409 (email exists), 400 (invalid fields) |
| `POST` | `/auth/login` | Log in | `{ email, password }` | `{ token, username }` | 401 (wrong credentials), 400 (missing fields) |

---

## Clubs (`/clubs`)

| Method | Endpoint | Purpose | Body/Params | Response | Errors |
|--------|----------|---------|-------------|----------|--------|
| `GET` | `/clubs` | All active clubs | — | `Club[]` | — |
| `GET` | `/clubs/{id}` | Single club | — | `Club` | 404 |
| `POST` | `/clubs` | Create club | `{ fullName, shortName, logoUrl, homeGround, foundedYear, city, clubStatus }` | `Club` | 409 (duplicate name), 400 |
| `PUT` | `/clubs/{id}` | Update club | Same as create | `Club` | 404 |

---

## Players (`/players`)

| Method | Endpoint | Purpose | Params/Body | Response | Errors |
|--------|----------|---------|-------------|----------|--------|
| `GET` | `/players` | All available players from active clubs | — | `Player[]` | — |
| `GET` | `/players/{id}` | Single player | — | `Player` | 404 |
| `GET` | `/players/position/{position}` | Filter by GK/DEF/MID/FWD | — | `Player[]` | — |
| `GET` | `/players/club/{clubId}` | All players for a club | — | `Player[]` | 404 |
| `POST` | `/players` | Create player | `{ fullName, clubId, jerseyNumber, position, photoUrl?, nationality, status }` | `Player` | 409 (duplicate), 404 (club), 400 |
| `PUT` | `/players/{id}` | Update player | Same as create | `Player` | 404 |

---

## Player Prices (`/player-price`)

| Method | Endpoint | Purpose | Body/Params | Response | Errors |
|--------|----------|---------|-------------|----------|--------|
| `POST` | `/player-price` | Record price entry | `{ playerId, gameweekId, price }` | — | 404, 400 |
| `GET` | `/player-price/{playerId}/current` | Current price | — | `PlayerPrice` | 404 |
| `GET` | `/player-price/{playerId}/history` | Price history | — | `PlayerPrice[]` | — |

---

## Gameweeks (`/gameweeks`)

| Method | Endpoint | Purpose | Body/Params | Response | Errors |
|--------|----------|---------|-------------|----------|--------|
| `GET` | `/gameweeks` | All gameweeks | — | `Gameweek[]` | — |
| `GET` | `/gameweeks/current` | Currently active gameweek | — | `Gameweek` | 404 |
| `GET` | `/gameweeks/season/{season}` | By season string | — | `Gameweek[]` | — |
| `POST` | `/gameweeks` | Create gameweek | `{ season, gameweekNumber, startDate, endDate, deadline }` | `Gameweek` | — |
| `PUT` | `/gameweeks/{id}/set-current` | Activate this gameweek | — | — | 404 |

---

## Fixtures (`/fixtures`)

| Method | Endpoint | Purpose | Body/Params | Response | Errors |
|--------|----------|---------|-------------|----------|--------|
| `GET` | `/fixtures/scheduled` | Scheduled fixtures | — | `Fixture[]` | — |
| `GET` | `/fixtures/live` | Live fixtures | — | `Fixture[]` | — |
| `GET` | `/fixtures/finished` | Finished fixtures | — | `Fixture[]` | — |
| `GET` | `/fixtures/gameweek/{id}` | All fixtures for a gameweek | — | `Fixture[]` | — |
| `POST` | `/fixtures` | Create fixture | `{ homeClubId, awayClubId, gameweekId, matchDate, venue }` | `Fixture` | 400 (same club), 404 (club/gameweek) |
| `PATCH` | `/fixtures/{id}/status` | Change status | Raw JSON string: `"LIVE"` | — | 404 |
| `GET` | `/fixtures/{id}/lineups` | Starting XI + subs for both teams | — | `FixtureLineups` | 404 (fixture not found or lineups not yet published) |

Required `FixtureLineups` shape:
```json
{
  "fixtureId": 1,
  "homeTeam": { "teamId": 1, "name": "Hearts of Oak", "startingXI": [{ "playerId": 10, "playerName": "Michael Ampadu", "position": "MF", "jerseyNumber": 8, "clubId": 1 }], "substitutes": [] },
  "awayTeam": { "teamId": 2, "name": "Kotoko", "startingXI": [], "substitutes": [] }
}
```
The MOTM vote screen uses **startingXI** from both teams as candidate list. Without this endpoint, voting is blocked.

---

## Fixture Results (`/fixture-results`)

| Method | Endpoint | Purpose | Body/Params | Response | Errors |
|--------|----------|---------|-------------|----------|--------|
| `POST` | `/fixture-results` | Record final score + stats | `{ fixtureId, homeScore, awayScore, homePossession, awayPossession }` | — | 400 (already finished or postponed), 404 |
| `GET` | `/fixture-results/{fixtureId}` | Get result | — | `FixtureResult` | 404 |
| `GET` | `/fixture-results` | All results | — | `FixtureResult[]` | — |

---

## Fantasy Teams (`/fantasy-teams`)

| Method | Endpoint | Purpose | Body/Params | Response | Errors |
|--------|----------|---------|-------------|----------|--------|
| `POST` | `/fantasy-teams` | Create team (one per user) | `{ teamName }` | `{ budgetRemaining, totalPoints, transferPoints }` | 409 (already exists or name taken), 400 |
| `GET` | `/fantasy-teams/my-team` | Current user's team | — | `FantasyTeam` | 404 |
| `GET` | `/fantasy-teams/{id}` | Any team by ID | — | `FantasyTeam` | 404 |
| `GET` | `/fantasy-teams` | All teams | — | `FantasyTeam[]` | — |
| `PUT` | `/fantasy-teams/{id}` | Rename team | `{ teamName }` | — | 403 (not owner), 404 |

---

## Squad (`/squad`)

| Method | Endpoint | Purpose | Body/Params | Response | Errors |
|--------|----------|---------|-------------|----------|--------|
| `POST` | `/squad` | Add player to squad | `{ fantasyTeamId, playerId }` | — | 400 (rules violation), 403 (not owner), 404 |
| `PUT` | `/squad/lineup` | Set starting XI (full overwrite) | `{ fantasyTeamPlayerIds: [17,19,...] }` | — | 400 (rules), 403, 404 |
| `GET` | `/squad/{fantasyTeamId}` | Full squad | — | `SquadPlayer[]` | — |
| `GET` | `/squad/{fantasyTeamId}/start-xi` | Starting XI only | — | `SquadPlayer[]` | — |
| `GET` | `/squad/{fantasyTeamId}/bench` | Bench only | — | `SquadPlayer[]` | — |
| `PATCH` | `/squad/{id}/captain` | Assign captain | — | — | 400, 403, 404 |
| `PATCH` | `/squad/{id}/vice-captain` | Assign vice-captain | — | — | 400, 403, 404 |
| `PATCH` | `/squad/{a}/{b}/toggle-bench` | Swap starter/bench | — | — | 400 (rules), 404 |

---

## Transfers (`/transfers`)

| Method | Endpoint | Purpose | Body | Response | Errors |
|--------|----------|---------|------|----------|--------|
| `POST` | `/transfers` | Swap squad members | `{ fantasyTeamId, playerOutId, playerInId, gameweekId }` | — | 400 (rules), 403, 404 |
| `GET` | `/transfers/team/{fantasyTeamId}` | Transfer history | — | `Transfer[]` | — |

---

## Chips (`/chips`)

All require body: `{ fantasyTeamId, gameweekId }`

| Method | Endpoint | Rules | Errors |
|--------|----------|-------|--------|
| `POST` | `/chips/triple-captain` | One chip per gameweek; type not already used this season | 400, 403, 404 |
| `POST` | `/chips/bench-boost` | Same as above | same |
| `POST` | `/chips/wildcard` | gameweekNumber ≤ 19 | same |
| `POST` | `/chips/wildcard2` | gameweekNumber > 19 | same |
| `POST` | `/chips/free-hit` | Snapshots squad + budget, restores at next gameweek | same |

---

## Scoring (`/scoring`)

| Method | Endpoint | Purpose | Body/Params | Response | Errors |
|--------|----------|---------|-------------|----------|--------|
| `POST` | `/scoring/stats` | Record player fixture stats + compute points | `{ playerId, fixtureId, minutesPlayed, goalsScored, assists, cleanSheet, yellowCard, redCard, saves }` | — | 409 (already recorded), 400, 404 |
| `POST` | `/scoring/calculate-all/{gameweekId}` | Calculate all team scores | — | — | 404 (no fixtures) |
| `GET` | `/scoring/fixture/{fixtureId}` | Stats for a fixture | — | `PlayerStats[]` | — |
| `GET` | `/scoring/gameweek/{gameweekId}` | All team scores for gameweek | — | `TeamScore[]` | — |
| `GET` | `/scoring/history/{fantasyTeamId}` | Team score history | — | `TeamScore[]` | — |

---

## Discussion (`/discussion`)

| Method | Endpoint | Purpose | Body | Response | Errors |
|--------|----------|---------|------|----------|--------|
| `POST` | `/discussion` | Post message | `{ fixtureId, message }` | `{ message }` | 404 |
| `GET` | `/discussion/fixture/{fixtureId}` | Messages for a fixture | — | `{ messages: DiscussionMessage[] }` | — |

---

## MOTM Votes (`/motmVotes`)

| Method | Endpoint | Purpose | Body | Response | Errors |
|--------|----------|---------|------|----------|--------|
| `POST` | `/motmVotes` | Submit vote | `{ fixtureId, playerId }` | `{ success }` | 409 (already voted), 400 (not LIVE), 404 |
| `GET` | `/motmVotes/{fixtureId}` | All votes for a fixture | — | `MotmVote[]` | — |

**Frontend dependency**: The MOTM vote screen requires `GET /fixtures/{id}/lineups` to populate the player picker (candidates = all startingXI players from both teams). Without it, voting shows an explanatory message and is blocked.

---

## Notifications (`/notifications`)

| Method | Endpoint | Purpose | Body/Params | Response | Errors |
|--------|----------|---------|-------------|----------|--------|
| `POST` | `/notifications` | Send notification (any auth'd user to any userId) | `{ userId, message, type }` | — | 404 |
| `GET` | `/notifications` | Caller's notifications | — | `Notification[]` | — |
| `GET` | `/notifications/unread` | Unread only | — | `Notification[]` | — |
| `PATCH` | `/notifications/marked-as-read-notification/{id}` | Mark one read | — | — | 403 (not owner), 404 |

---

## Background Jobs (not HTTP)

- **GameweekScheduler** (nightly cron): restores Free Hit snapshots, advances gameweek, logs warnings but does not throw on edge cases.

---

## Notes on IDs

| Endpoint family | ID type expected |
|----------------|-----------------|
| `/squad/{id}/captain`, `/vice-captain`, `/toggle-bench`, `/squad/lineup` | `FantasyTeamPlayer` row ID (from squad responses) |
| `/transfers` (`playerOutId`, `playerInId`) | Player table ID |
| `/player-price/{playerId}/...` | Player table ID |
