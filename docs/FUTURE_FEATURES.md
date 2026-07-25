# Deferred Features

Things that were deliberately scoped out for now, with notes on what it'd
actually take to build them later, so the reasoning isn't lost.

## Match Details: Events tab

**Status:** Removed from the UI (was a placeholder, never had real data).

A minute-by-minute feed ("Goal, 34'", "Yellow card, 61'") doesn't exist as a
concept anywhere in the backend - there's no entity or column that stores
*when* something happened during a match, only match-total counts
(`PlayerGameWeekStats`: total goals/assists/cards/minutes for the whole
game). Building this for real needs either:

- A new backend feature: an `Event` entity (fixture, player, minute, type)
  plus an admin screen to enter events as they happen - real work, and still
  manual.
- Or a live sports-data API (see below) - the only way to get this without
  an admin manually timestamping every event.

## Match Details: Lineups tab

**Status:** Removed from the UI (was a placeholder, never had real data).

There's no tracking anywhere of who actually started/subbed in a real
fixture - only full club squads. MOTM voting hit this same gap and works
around it by listing both clubs' entire squads as candidates instead of a
real XI. The Lineups tab could do the same as a stopgap, but a "lineup" that
lists 20+ players isn't really a lineup - not worth building until there's a
real data source (admin entry or a live API).

## Live sports-data API (events/lineups/live scores)

**Status:** Researched, not pursued - no budget for a paid tier.

Tested **API-Football** (api-football.com) directly with a real free-tier
key:

- Ghana Premier League is covered - league id **570**.
- Coverage flags for the current season (2025/26) show `events: true` and
  `lineups: true`.
- **BUT the free tier only allows access to the 2022-2024 seasons** -
  querying the current season returns: `"Free plans do not have access to
  this season, try from 2022 to 2024."` So the free tier can never see a
  live or recently-finished match - it's useless for this app's actual use
  case (current-season data).
- Getting current-season access requires the paid **Pro tier (~$19/mo)**.
- Also worth noting even on a paid tier: `statistics_players` and
  `statistics_fixtures` are `false` for every GPL season ever, including the
  current one - so detailed per-player match stats (minutes, saves, shots)
  would still need manual admin entry regardless. A paid plan would only
  unlock Events + Lineups, not Stats.

Other providers checked and ruled out: Sportmonks (no confirmed GPL
coverage, no free tier, worldwide-league access ~€269/mo), football-data.org
(European competitions only), TheSportsDB (GPL data exists but
community-sourced/patchy, key now requires a Patreon pledge), FootyStats (has
a GPL section but needs the ~£20-25/mo Pro tier).

**Revisit when:** there's budget for ~$19/mo, and even then, verify actual
match-by-match data quality for GPL specifically before committing (the
coverage flag being `true` doesn't guarantee every fixture has full data -
API-Football's own docs say as much).

## Match Details: Stats tab

**Status:** Built, live in the app.

This one already works with real data - `GET /scoring/fixture/{id}`
(admin-entered per-player totals) is wired into the Stats section on Match
Details. No changes needed; noted here only for contrast with the two above.
