# GPL Live — Frontend Build Prompt for AI Agent

> Feed this entire document to your AI coding agent as its system/task prompt.
> The agent must follow every section strictly, check for errors after every step, and produce a working project by the end.

---

## 0. AGENT RULES (read before doing anything)

1. **Read every section of this prompt before writing a single line of code.**
2. After generating or modifying any file, **immediately lint/compile/run it** and fix every error before moving on.
3. **Do not delete any file without first confirming it is not imported or referenced anywhere** (use a grep/search pass first).
4. **Commit-style checkpoints:** After completing each numbered section below, log a summary of what was changed and confirm zero errors remain.
5. If a decision is ambiguous, **default to the conservative, explicit approach** — do not guess and leave broken imports.
6. The final deliverable must be a **fully runnable project** with zero console errors and zero broken navigation paths.

---

## 1. PROJECT BOOTSTRAP & CLEANUP

### 1.1 Tech stack (do not deviate)
- **React Native** (Expo managed workflow, latest stable SDK)
- **TypeScript** (strict mode enabled)
- **React Navigation v6** — Bottom Tab Navigator + Stack Navigators per tab
- **Zustand** for global state (auth, fantasy squad, predictions)
- **React Query (TanStack Query v5)** for all server data fetching
- **Paystack React Native SDK** for the subscription payment flow
- **NativeWind v4** (Tailwind for React Native) for styling utility classes
- **Expo Notifications** for push notifications
- **Expo Image** for optimised image rendering

### 1.2 Initial cleanup (before any new code)
Run the following audit and execute it precisely:

```
1. List every file in the project tree.
2. For each file: check if it is imported anywhere (grep -r "filename" src/).
3. Mark files that are: (a) unreferenced, (b) duplicate logic, (c) legacy stubs with no content.
4. Delete ONLY those files — do not touch any file that is directly or transitively imported.
5. After deletions, run `npx tsc --noEmit` and fix any resulting TypeScript errors.
6. Run the app — confirm it still starts without crashing.
```

### 1.3 Required folder structure (enforce this exactly)
```
src/
  app/                    ← root entry, navigation setup
  screens/
    onboarding/           ← Splash, OnboardingSlides, RegisterLogin, PickClub
    home/                 ← HomeScreen, NotificationInbox
    match/                ← MatchDetail (tabs: Overview, Lineups, Reactions, Vote)
    fantasy/              ← FantasyRoot, SquadBuilder, MySquad, FantasyLeaderboard
    predict/              ← PredictRoot, PredictTab, VoteTab, FullLeaderboard
    news/                 ← NewsScreen, ArticleDetail
    fixtures/             ← FixturesRoot, FixturesTab, ResultsTab, TableTab, ClubProfile
    profile/              ← ProfileScreen, EditProfile, ClubSubscription, SubscriptionSuccess
  components/
    shared/               ← Button, Card, Badge, Avatar, Chip, MatchCard, ClubBadge
    home/                 ← TodayMatchesWidget, LatestNewsWidget, LeagueTableWidget,
                             FantasySnapshotWidget, PredictionLeaderboardTeaser
    match/                ← MatchHeader, EventTimeline, LineupColumn, ReactionCard,
                             MOTMVoteRow
    fantasy/              ← PitchLayout, PlayerSlot, PlayerPickerModal, BudgetCounter
    predict/              ← PredictionCard, ScoreInput, LeaderboardRow
    news/                 ← NewsCard, CategoryFilterBar
    fixtures/             ← FixtureCard, ResultCard, StandingsTable, FormDots
    profile/              ← StatChip, BadgesRow, SubscriptionCard, SettingsRow
  navigation/
    RootNavigator.tsx     ← handles auth vs main stack
    MainTabNavigator.tsx  ← 6-tab bottom bar
    HomeStack.tsx
    FantasyStack.tsx
    PredictStack.tsx
    NewsStack.tsx
    FixturesStack.tsx
    ProfileStack.tsx
  store/
    authStore.ts          ← user session, favourite club, onboarding complete flag
    fantasyStore.ts       ← squad state, captain selection, budget
    predictionStore.ts    ← weekly predictions by fixture ID
  hooks/
    useMatches.ts
    useFantasy.ts
    usePredictions.ts
    useNews.ts
    useFixtures.ts
    useProfile.ts
    useNotifications.ts
  services/
    api.ts                ← base axios/fetch client with auth headers
    paystackService.ts    ← subscription initiation + webhook handling
  constants/
    colors.ts             ← GPL Live design tokens
    clubs.ts              ← 18 GPL club names, IDs, badge asset map
    routes.ts             ← typed route name constants
  assets/
    images/               ← club badges (PNG), GPL Live logo, onboarding illustrations
    fonts/                ← any custom fonts loaded via expo-font
  types/
    index.ts              ← shared TypeScript interfaces (Match, Club, Player, Article, etc.)
```

---

## 2. DESIGN SYSTEM

### 2.1 Color palette (`src/constants/colors.ts`)
```ts
export const Colors = {
  // Brand
  primary:        '#1A7C3E',   // deep GPL green
  primaryLight:   '#E8F5EE',
  accent:         '#F5A623',   // gold accent

  // Surfaces
  background:     '#F7F8FA',
  surface:        '#FFFFFF',
  surfaceAlt:     '#F0F2F5',

  // Text
  textPrimary:    '#0D1117',
  textSecondary:  '#5A6472',
  textTertiary:   '#9AA3AF',
  textInverse:    '#FFFFFF',

  // Status
  live:           '#E8253A',   // red for LIVE badge
  win:            '#27AE60',
  draw:           '#F39C12',
  loss:           '#E74C3C',

  // Tags (match the app map colour codes)
  tagFE:   { bg: '#EAF3DE', text: '#27500A' },
  tagBE:   { bg: '#FAECE7', text: '#712B13' },
  tagDB:   { bg: '#E6F1FB', text: '#0C447C' },
  tag3P:   { bg: '#EEEDFE', text: '#3C3489' },
  tagAdmin:{ bg: '#FAEEDA', text: '#633806' },

  // Borders
  border:         '#E3E7ED',
  borderLight:    '#F0F2F5',
};
```

### 2.2 Typography
Use **Expo Google Fonts** — load these two families via `useFonts`:
- **Display / headings:** `Nunito_700Bold`, `Nunito_800ExtraBold`
- **Body / UI:** `Inter_400Regular`, `Inter_500Medium`, `Inter_600SemiBold`

Apply globally via a `ThemeProvider` wrapper. Never use `System` fonts for any visible text.

### 2.3 Shared component specs
Every shared component must:
- Accept a `testID` prop (for QA)
- Have a TypeScript interface for its props
- Use `StyleSheet.create` or NativeWind classes — never inline style objects
- Render a fallback/skeleton state while loading

---

## 3. NAVIGATION ARCHITECTURE

### 3.1 Root Navigator (`src/navigation/RootNavigator.tsx`)
```
if (!onboardingComplete  →  OnboardingStack (Splash → Slides → RegisterLogin → PickClub)
if (!isAuthenticated     →  AuthStack (RegisterLogin)
else                     →  MainTabNavigator
```
Persist `onboardingComplete` and auth token in **Zustand + AsyncStorage** (rehydrate on app launch).

### 3.2 Main Tab Navigator — 6 tabs
| Tab index | Icon (Expo vector icons) | Label | Stack |
|-----------|--------------------------|-------|-------|
| 0 | `home` | Home | HomeStack |
| 1 | `trophy` | Fantasy | FantasyStack |
| 2 | `checkbox` | Predict | PredictStack |
| 3 | `newspaper` | News | NewsStack |
| 4 | `calendar` | Fixtures | FixturesStack |
| 5 | `person` | Profile | ProfileStack |

Tab bar style:
- Background: `Colors.surface`
- Active tint: `Colors.primary`
- Inactive tint: `Colors.textTertiary`
- Add a `LIVE` red dot badge on the **Home** tab when any match is in progress (driven by React Query `useMatches` hook)
- Safe area bottom inset respected via `react-native-safe-area-context`

---

## 4. SCREEN-BY-SCREEN SPECIFICATIONS

> For **every screen** listed below: build it, import it in its Stack navigator, and confirm navigation to/from it works before moving to the next screen.

---

### 4.1 ONBOARDING FLOW

#### 4.1.1 Splash Screen (`screens/onboarding/SplashScreen.tsx`)
- Full-screen `Colors.primary` green background
- GPL Live logo centred (SVG or PNG from assets)
- Fade-in animation (opacity 0 → 1, 600 ms)
- After 2 seconds auto-navigate to `OnboardingSlides` (first launch) or `MainTabs` (returning user)
- **No back button**

#### 4.1.2 Onboarding Slides (`screens/onboarding/OnboardingSlides.tsx`)
- 3 swipeable slides using `react-native-swiper` or a FlatList with `pagingEnabled`
- Slide 1: Reactions — "React to every GPL moment in real time"
- Slide 2: Fantasy — "Build your dream GPL squad and compete every week"
- Slide 3: Predictions — "Predict match results and climb the leaderboard"
- Each slide: full-bleed illustration (placeholder coloured rect until assets arrive), headline, sub-copy
- Bottom: dot pagination + "Next" button → "Get Started" on slide 3
- "Skip" text link top-right navigates straight to `RegisterLogin`

#### 4.1.3 Register / Login Screen (`screens/onboarding/RegisterLoginScreen.tsx`)
- Two tabs: **Register** | **Log In** (toggle pill, not full navigation push)
- Register fields: Full name, Email, Password, Confirm password
- Login fields: Email, Password + "Forgot password?" link
- Social login row: **Google** button (OAuth via `expo-auth-session`)
- Submit calls `authStore.login()` / `authStore.register()`
- On success → navigate to `PickClub` (register) or `MainTabs` (login)
- Form validation: all fields required, email regex, password ≥ 8 chars
- Show inline field error messages (not alerts)
- Loading spinner on submit button while request in flight

#### 4.1.4 Pick Favourite Club (`screens/onboarding/PickClubScreen.tsx`)
- Headline: "Which club do you support?"
- Grid (3 columns) of all 18 GPL clubs — each cell shows club badge + club name
- Tap a club → highlight with `Colors.primary` border + checkmark
- Only 1 club selectable
- "Continue" button (disabled until a club is selected) → saves to `authStore.favouriteClub` + API call → navigates to `MainTabs`

---

### 4.2 HOME TAB

#### 4.2.1 Home Screen (`screens/home/HomeScreen.tsx`)
- `ScrollView` (vertical)
- **Header bar** (fixed, not scrollable):
  - GPL Live logo (left)
  - Notification bell icon (right) with unread badge count from `useNotifications` hook
  - Tapping bell → pushes `NotificationInbox` screen
- Render these widgets **in order**, each as its own component:

**W2 — Today's Matches Widget** (`components/home/TodayMatchesWidget.tsx`)
- Horizontal `FlatList` with `horizontal={true}`
- Each `MatchCard` (shared component) shows:
  - Home club badge (32 px) + name
  - Score (bold, 18 px) or kick-off time (if not started)
  - Away club badge + name
  - Status chip: `LIVE` (red), `FT` (grey), or time (green)
- `LIVE` matches pulse-animate the chip (CSS-style loop, opacity 1 → 0.4)
- Tap → push `MatchDetail` screen, passing `matchId`
- Empty state: "No matches today" card

**W3 — Latest News Widget** (`components/home/LatestNewsWidget.tsx`)
- 2–3 `NewsCard` preview components stacked vertically
- Each: thumbnail (80 px height, border-radius 8), category chip, headline, source + relative time ("2h ago")
- "See all news →" link navigates to News tab
- Skeleton loader (3 grey placeholder rects) while fetching

**W4 — League Table Summary Widget** (`components/home/LeagueTableWidget.tsx`)
- Top 5 GPL clubs only
- Columns: Pos (number), Club badge (20 px) + name, Pts (bold)
- "See full table →" link deep-links to `FixturesStack` → `TableTab`
- Bordered card with light green header row ("GPL Standings")

**W5 — Fantasy Snapshot Widget** (`components/home/FantasySnapshotWidget.tsx`)
- If user HAS a fantasy team:
  - Team name (bold), this gameweek's points, overall rank
  - "Manage squad →" navigates to Fantasy tab
- If user has NO team:
  - Green CTA button "Create your fantasy team" → navigates to Fantasy tab
- Conditional render driven by `fantasyStore.hasSquad`

**W6 — Prediction Leaderboard Teaser** (`components/home/PredictionLeaderboardTeaser.tsx`)
- "This week's top predictors" label
- Top 3 rows: rank medal (🥇🥈🥉), username, points
- If user hasn't predicted this gameweek: "Make your predictions →" CTA (navigates to Predict tab)
- If user has predicted: show their rank ("You are #47 this week")

#### 4.2.2 Notification Inbox (`screens/home/NotificationInboxScreen.tsx`)
- Stack pushed from Home header bell icon
- List of notifications (most recent first)
- Each row: icon by type (⚽ goal, 🏆 fantasy, 📊 prediction, 💳 subscription), title + body text, relative timestamp, unread indicator (blue dot left side)
- Pull-to-refresh
- Mark all as read button (top right)
- Empty state illustration + "No notifications yet"

---

### 4.3 MATCH DETAIL SCREEN (`screens/match/MatchDetailScreen.tsx`)

Accessible from: Home W2, Fixtures (all sub-sections), Results, Vote tab cards.

**Persistent Match Header** (above the 4-tab bar, always visible):
- Home club badge (40 px) + name
- Score (if started) or kick-off time (if upcoming) — large, centred, bold
- Away club badge + name
- Status chip: `LIVE` + live minute (e.g. `LIVE 67'`) | `FT` | `Upcoming`
- Match date, round (e.g. "Matchweek 24")

Internal tab bar (4 tabs, not the bottom nav): **Overview · Lineups · Reactions · Vote**

**T1 — Overview Tab** (`components/match/EventTimeline.tsx`)
- Chronological event list (earliest at top)
- Each row: minute label (e.g. `45'`), event icon (⚽ goal, 🟨 yellow, 🟥 red, 🔄 sub), player name, home/away alignment (home events left-aligned, away right-aligned)
- Below events: venue name + city, competition round
- If no events yet: "Match not started" placeholder

**T2 — Lineups Tab**
- Two columns side by side: Home XI (left) | Away XI (right)
- Formation label at top of each column (e.g. "4-4-2")
- Player rows: shirt number + player name
- Bench section below with header "Bench"
- If lineups not yet released: "Lineups will be available 1 hour before kickoff"

**T3 — Reactions Tab** (`components/match/ReactionCard.tsx`)
- "Post a reaction" button at top → opens bottom sheet modal with a `TextInput` (max 280 chars) + "Post" button
- `FlatList` of reaction cards, each:
  - Avatar (initials circle, `Colors.primary` bg)
  - Username + club badge they support (small, 16 px)
  - Comment text
  - Like count + like button (heart icon, tapping toggles liked state)
  - Report button (flag icon → confirmation alert)
  - Relative timestamp
- Sort toggle: "Latest" | "Most Liked" (top right of list)
- Pull-to-refresh
- Empty state: "Be the first to react!"

**T4 — Vote Tab** (Man of the Match)
- Only rendered/accessible when `match.status === 'FT'`
- If `status !== 'FT'`: show "MOTM voting opens after full time" placeholder
- If open (< 24 hrs since FT):
  - Section headers: "Home: [Club]" | "Away: [Club]"
  - Each player row: player name + position tag + animated vote % bar (Animated API, expands from 0 on mount)
  - User taps player → immediate optimistic UI tick, disables all other rows
  - If already voted: all rows show percentages, user's pick has a green checkmark
- If poll closed (> 24 hrs since FT): show winner card with trophy icon

---

### 4.4 FANTASY TAB

#### 4.4.1 Fantasy Root (`screens/fantasy/FantasyRoot.tsx`)
- Toggle bar at top: **My Squad** | **Leaderboard**
- Renders `MySquad` or `FantasyLeaderboard` based on toggle
- If user has no squad AND toggle is "My Squad": render `SquadBuilder` flow instead

#### 4.4.2 Squad Builder (`screens/fantasy/SquadBuilder.tsx`)
Step 1: Team name input (text field + "Next →" button)
Step 2: Player picker (full screen modal):
- Position filter tabs: **All · GK · DEF · MID · FWD**
- Club filter dropdown (all 18 GPL clubs + "All clubs")
- Search bar (filter by player name)
- `FlatList` of `PlayerPickerCard` components:
  - Player name, club badge + name, position badge, price (GH₵Xm)
  - "Add" button → disabled if: position quota full, budget exceeded, already added
- Fixed bottom tray showing position slots filled (e.g. GK: 1/2, DEF: 3/5 …)
- Budget counter top-right: starts at GH₵100m, decrements per player added
- Quota: 2 GK, 5 DEF, 5 MID, 3 FWD = 15 total
- "Done" button enabled only when all 15 filled
Step 3: Captain selection:
- Full list of selected 15 players
- Tap any → "Set as captain" toggle; one captain only (C badge)
- "Submit Squad" button → calls `fantasyStore.submitSquad()` → API → navigates to `MySquad`

#### 4.4.3 My Squad (`screens/fantasy/MySquad.tsx`)
- Top card: team name, gameweek points (bold, large), "View points breakdown →" → `PointsBreakdown` screen
- **Pitch layout** (`components/fantasy/PitchLayout.tsx`):
  - Green background with white pitch markings (use SVG or react-native-svg lines)
  - Starting 11 positioned in formation rows (default 4-4-2): GK row, DEF row, MID row, FWD row
  - Each `PlayerSlot`: small circle (40 px) with player initials or photo, name below, captain "C" badge if captain
- **Bench row**: 4 players in a horizontal strip below the pitch
- Long-press a player slot: context menu "Set as captain" / "Transfer out" (transfer opens player picker pre-filtered for that position)

#### 4.4.4 Fantasy Leaderboard (`screens/fantasy/FantasyLeaderboard.tsx`)
- `FlatList` of top 20 managers
- Each row: rank number, rank change indicator (▲ green / ▼ red / — grey), avatar initials circle, username + club badge, total points (bold), this week's points
- User's own row highlighted with `Colors.primaryLight` background
- Pull-to-refresh

---

### 4.5 PREDICT / VOTE TAB

#### 4.5.1 Predict Root (`screens/predict/PredictRoot.tsx`)
- Top toggle: **Predict** | **Vote**

#### 4.5.2 Predict Tab (`screens/predict/PredictTab.tsx`)
- Gameweek label header ("Gameweek 24 Predictions")
- Up to 5 `PredictionCard` components (`components/predict/PredictionCard.tsx`):
  - Home club badge + name vs Away club badge + name
  - 3-button toggle: **Home Win** | **Draw** | **Away Win** (one selectable, primary fill on selected)
  - Expand chevron → reveals exact score inputs: home goals `[input]` – `[input]` away goals (numeric keyboard)
  - If match has kicked off: card greyed out, lock icon, "Locked" label
  - If already submitted this prediction: show submitted pick with lock icon
- "Submit Predictions" button at bottom (disabled if no predictions made)
  - On tap: calls API, shows success toast "Predictions submitted!"
- Below prediction cards: "This week's leaderboard" mini-section (top 10 rows, "See full leaderboard →" navigates to `FullLeaderboard`)

#### 4.5.3 Vote Tab (`screens/predict/VoteTab.tsx`)
- List of completed matches with open MOTM polls (within 24 hrs FT)
- Each: `MatchCard` showing home club vs away club + FT score + "Vote Now" chip
- Matches where user already voted: show their pick + result chip (tick)
- Tapping opens `MatchDetail` navigated to the Vote tab (pass `initialTab: 'vote'` param)

#### 4.5.4 Full Leaderboard (`screens/predict/FullLeaderboard.tsx`)
- "Prediction League — Gameweek X" header
- Top 100 rows, paginated or infinite scroll
- Same row format as Fantasy Leaderboard but with prediction points
- User's own row pinned at bottom if not in top 100

---

### 4.6 NEWS TAB

#### 4.6.1 News Screen (`screens/news/NewsScreen.tsx`)
- **Category filter bar** (`components/news/CategoryFilterBar.tsx`):
  - Horizontally scrollable chips: **All · GPL · Black Stars · AFCON · Transfers**
  - Selected chip: `Colors.primary` bg + white text
  - Default: "All" selected
- `FlatList` of `NewsCard` components:
  - Thumbnail image (full width, height 160, border-radius 12)
  - Category chip overlay (top-left corner, coloured bg)
  - Headline (bold, 15 px, 2-line max)
  - Source + relative time ("via GHANASoccernet · 3h ago")
- Pull-to-refresh
- Skeleton loader (3 placeholder cards)
- Tap → push `ArticleDetail`

#### 4.6.2 Article Detail (`screens/news/ArticleDetail.tsx`)
- Header image (full width, 220 px, no border-radius)
- Headline (bold, 20 px)
- Author / Source · Publish date (secondary text)
- Full article body (`ScrollView`)
- Share button (top right header): opens native share sheet with article URL
  - WhatsApp deep-link: `whatsapp://send?text=${headline + url}`
- Back chevron (top left)

---

### 4.7 FIXTURES / RESULTS / TABLE TAB

#### 4.7.1 Fixtures Root (`screens/fixtures/FixturesRoot.tsx`)
- Top tab bar: **Fixtures · Results · Table** (segmented control style)

#### 4.7.2 Fixtures Tab (`screens/fixtures/FixturesTab.tsx`)
- Matches grouped by matchweek using `SectionList`
- Section header: "Matchweek 24 — 7 June 2026" (collapsible, tap chevron to toggle)
- Each `FixtureCard`: home club badge + name · kick-off time · away club badge + name
- Upcoming only (status: `scheduled`)
- Tap → push `MatchDetail`

#### 4.7.3 Results Tab (`screens/fixtures/ResultsTab.tsx`)
- Filter bar (horizontal, compact):
  - Team picker (dropdown/modal — all 18 clubs + "All teams")
  - Month picker (current month default)
  - Gameweek picker (number input or scroll)
- `FlatList` of `ResultCard` components (completed matches, most recent first):
  - Home club badge + name · **2 – 1** (final score, bold) · away club badge + name
  - Date + time
- Tap → push `MatchDetail`

#### 4.7.4 Table Tab (`screens/fixtures/TableTab.tsx`)
- Full GPL standings table
- Columns: **Pos** | **Club** (badge 20 px + name) | **P** | **W** | **D** | **L** | **GD** | **Pts** | **Form**
- Form column: last 5 results as coloured dots (W = green, D = yellow/amber, L = red)
- Sticky header row (column labels)
- Highlighted row: user's favourite club (`Colors.primaryLight` bg)
- Tap any club row → push `ClubProfile`

#### 4.7.5 Club Profile (`screens/fixtures/ClubProfile.tsx`)
- Club badge (80 px, centred) + club name (headline)
- Sub-tabs: **Overview · Fixtures · Results**
- Overview: founded year, home ground, manager name, current position in table
- Fixtures: next 5 upcoming matches
- Results: last 5 completed matches

---

### 4.8 PROFILE TAB

#### 4.8.1 Profile Screen (`screens/profile/ProfileScreen.tsx`)

**PR1 — Profile Header:**
- Avatar circle (64 px, `Colors.primary` bg, white initials) or photo if set
- Username (bold, 16 px)
- Favourite club badge (20 px) below username
- "Edit Profile →" button (top right of header section)

**PR2 — Stats Row:**
3 `StatChip` components in a horizontal row:
- "Fantasy Rank" → "#142"
- "Prediction Pts" → "47 pts"
- "Reactions" → "12"

**PR3 — Badges Section:**
- Label: "Your Badges"
- Horizontal `FlatList` of badge icons (emoji or custom icon + label):
  - Prediction King, Top Reactor, Club Loyalist, MOTM Master
- Earned: full colour + label
- Unearned: grey tint + lock icon overlay

**PR4 — Club Subscription:**
- If NOT subscribed: card with "Subscribe to exclusive club content" + green "Subscribe" button → pushes `ClubSubscription` screen
- If subscribed: club name, "Active" chip (green), renewal date, "Manage" button → same screen in manage mode

**PR5 — Settings List:**
Tappable settings rows (chevron right each):
- **Notifications** → sub-screen with per-type toggles:
  - Goals (push)
  - Fantasy points updates
  - Prediction results
  - Subscription renewals
- **Change Password** → form screen (current password + new password + confirm)
- **Privacy** → toggle: Public profile | Private profile (with explainer text)
- **Help & Support** → WebView opening support URL or in-app FAQ list
- **About GPL Live** → version number, terms of service link, privacy policy link
- **Log Out** → confirmation `Alert.alert("Log out?", ..., [{text:"Cancel"}, {text:"Log out", style:"destructive"}])` → clears `authStore` + navigates to `RegisterLogin`

#### 4.8.2 Edit Profile (`screens/profile/EditProfile.tsx`)
- Avatar: tappable → `expo-image-picker` opens; on pick → upload to backend → update store
- Fields: Username (text), Email (text, read-only if social login), Favourite club (opens club picker same as onboarding)
- "Save changes" button → API call → toast "Profile updated" → pop back

#### 4.8.3 Club Subscription Flow (`screens/profile/ClubSubscription.tsx`)

**S1 → S2 — Subscription Details Bottom Sheet:**
- Use `@gorhom/bottom-sheet`
- Content:
  - Club badge (40 px) + club name, headline "Exclusive Content Subscription"
  - Price: **GH₵3 / month**
  - Benefits list (bullet points):
    - Exclusive club posts and updates
    - Member-only content
    - Direct club announcements
  - Two buttons: "Cancel" (outlined) | "Confirm & Pay" (filled `Colors.primary`)

**S3 — Paystack WebView:**
- On "Confirm & Pay": call backend to initialise Paystack transaction → receive `authorizationUrl`
- Open in `WebView` (full screen modal, with loading spinner overlay)
- Listen for redirect to your callback URL → close WebView → handle result

**S4 — Success / Failure Modal:**
- Success: green checkmark animation (Lottie or Animated), "You're now subscribed to [Club]!", "View exclusive content" button → navigates to Club's exclusive content screen
- Failure: red X, "Payment failed. Please try again." + "Retry" button (re-opens bottom sheet) + "Cancel" button

**S5:** Trigger push notification via backend webhook after successful payment (not frontend responsibility — document this requirement for the backend).

---

## 5. DATA TYPES (`src/types/index.ts`)

Define and export all of these — no `any` types anywhere:

```ts
export type MatchStatus = 'scheduled' | 'live' | 'ft' | 'postponed';
export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';
export type NewsCategory = 'GPL' | 'Black Stars' | 'AFCON' | 'Transfers';
export type EventType = 'goal' | 'yellow_card' | 'red_card' | 'substitution';
export type BadgeName = 'Prediction King' | 'Top Reactor' | 'Club Loyalist' | 'MOTM Master';

export interface Club {
  id: string;
  name: string;
  shortName: string;
  badgeUrl: string;
  city: string;
}

export interface Match {
  id: string;
  homeClub: Club;
  awayClub: Club;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  kickoffTime: string; // ISO 8601
  liveMinute?: number;
  venue: string;
  round: number;
  gameweek: number;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  type: EventType;
  minute: number;
  playerName: string;
  side: 'home' | 'away';
  assistPlayerName?: string;
  subOffPlayerName?: string; // for substitutions
}

export interface Player {
  id: string;
  name: string;
  clubId: string;
  club: Club;
  position: Position;
  price: number; // in GH₵m
  photoUrl?: string;
}

export interface FantasyTeam {
  id: string;
  userId: string;
  teamName: string;
  players: FantasyPlayer[];
  captainId: string;
  totalPoints: number;
  weekPoints: number;
  overallRank: number;
}

export interface FantasyPlayer extends Player {
  isStarting: boolean; // true = XI, false = bench
  weekPoints: number;
}

export interface Prediction {
  fixtureId: string;
  outcome: 'home' | 'draw' | 'away' | null;
  exactHomeGoals?: number;
  exactAwayGoals?: number;
  locked: boolean;
  submitted: boolean;
}

export interface Article {
  id: string;
  headline: string;
  body: string;
  thumbnailUrl: string;
  category: NewsCategory;
  source: string;
  publishedAt: string; // ISO 8601
  author?: string;
  url: string;
}

export interface Reaction {
  id: string;
  matchId: string;
  userId: string;
  username: string;
  userClub: Club;
  text: string;
  likeCount: number;
  isLikedByMe: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  favouriteClub: Club;
  fantasyRank?: number;
  predictionPoints: number;
  reactionsPosted: number;
  badges: BadgeName[];
  subscription?: ClubSubscription;
}

export interface ClubSubscription {
  clubId: string;
  club: Club;
  status: 'active' | 'cancelled' | 'expired';
  renewalDate: string;
}

export interface Notification {
  id: string;
  type: 'goal' | 'fantasy' | 'prediction' | 'subscription' | 'general';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface Standing {
  position: number;
  club: Club;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

export interface LeaderboardEntry {
  rank: number;
  rankChange: number; // positive = moved up, negative = moved down
  userId: string;
  username: string;
  club: Club;
  totalPoints: number;
  weekPoints: number;
  isCurrentUser: boolean;
}
```

---

## 6. API LAYER (`src/services/api.ts`)

- Use `axios` with a base instance
- Attach `Authorization: Bearer <token>` header from `authStore`
- Intercept 401 responses → auto-logout + navigate to `RegisterLogin`
- All endpoints return the types defined in Section 5

Endpoints to implement (mock with `msw` or a JSON stub if backend not ready):
```
GET  /matches/today                        → Match[]
GET  /matches/:id                          → Match + MatchEvent[]
GET  /matches/:id/lineups                  → { home: Player[], away: Player[] }
GET  /matches/:id/reactions                → Reaction[]
POST /matches/:id/reactions                → Reaction
POST /matches/:id/reactions/:rid/like      → { likeCount: number }
GET  /matches/:id/motm/players             → Player[] (only if status=FT)
POST /matches/:id/motm/vote                → { playerId: string }

GET  /fantasy/team/me                      → FantasyTeam | null
POST /fantasy/team                         → FantasyTeam
PATCH /fantasy/team/me                     → FantasyTeam
GET  /fantasy/players                      → Player[]
GET  /fantasy/leaderboard                  → LeaderboardEntry[]

GET  /predictions/gameweek/:gw             → Prediction[]
POST /predictions                          → Prediction[]
GET  /predictions/leaderboard/:gw          → LeaderboardEntry[]

GET  /news                                 → Article[]  (supports ?category= filter)
GET  /news/:id                             → Article

GET  /fixtures                             → Match[] (status=scheduled)
GET  /results                              → Match[] (status=ft, supports ?club= ?month= ?gw=)
GET  /standings                            → Standing[]
GET  /clubs/:id                            → Club + next 5 fixtures + last 5 results

GET  /profile/me                           → User
PATCH /profile/me                          → User
POST /profile/me/avatar                    → { avatarUrl: string }

GET  /notifications                        → Notification[]
POST /notifications/read-all               → { success: true }

POST /subscriptions/initiate               → { authorizationUrl: string, reference: string }
GET  /subscriptions/status                 → ClubSubscription | null
```

---

## 7. STATE MANAGEMENT

### `authStore.ts` (Zustand + AsyncStorage persist)
```ts
interface AuthState {
  user: User | null;
  token: string | null;
  onboardingComplete: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setFavouriteClub: (club: Club) => Promise<void>;
  completeOnboarding: () => void;
}
```

### `fantasyStore.ts`
```ts
interface FantasyState {
  team: FantasyTeam | null;
  hasSquad: boolean;
  draftPlayers: FantasyPlayer[];
  draftCaptainId: string | null;
  budget: number; // starts at 100
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  setCaptain: (playerId: string) => void;
  submitSquad: (teamName: string) => Promise<void>;
  resetDraft: () => void;
}
```

### `predictionStore.ts`
```ts
interface PredictionState {
  predictions: Record<string, Prediction>; // keyed by fixtureId
  setPrediction: (fixtureId: string, outcome: Prediction['outcome']) => void;
  setExactScore: (fixtureId: string, home: number, away: number) => void;
  submitAll: (gameweek: number) => Promise<void>;
  reset: () => void;
}
```

---

## 8. ERROR HANDLING & LOADING STATES

Every screen must handle all 3 states explicitly:
1. **Loading** — skeleton loaders (grey placeholder shapes matching final layout)
2. **Error** — error card with message + "Retry" button that re-calls the query
3. **Empty** — illustration + descriptive empty state message

Never show a blank white screen. Never show a raw error string from the API.

Use React Query's `isLoading`, `isError`, `data` destructured from each `useQuery` call.

---

## 9. PERFORMANCE REQUIREMENTS

- All `FlatList` components must have `keyExtractor`, `getItemLayout` (if fixed height), and `removeClippedSubviews={true}`
- Images must use `expo-image` with `contentFit="cover"` and a `placeholder` blur hash
- No anonymous functions as component props (define handlers outside render)
- React Query default `staleTime: 30_000` (30 seconds) for match data, `staleTime: 300_000` (5 min) for standings/news
- Live match data: enable `refetchInterval: 30_000` in `useMatches` for matches with `status === 'live'`

---

## 10. FINAL VERIFICATION CHECKLIST

Run this checklist before declaring the project done:

```
□ `npx tsc --noEmit` — zero TypeScript errors
□ `npx expo start` — app starts without metro errors
□ Navigate through every screen listed in Section 4 — zero blank screens, zero crashes
□ Every FlatList renders correctly with mock data
□ Onboarding flow: Splash → Slides → Register → PickClub → Home
□ Bottom tab bar renders with correct 6 tabs and correct icons
□ MatchDetail 4-tab bar navigates between Overview, Lineups, Reactions, Vote
□ Fantasy squad builder: can pick 15 players respecting budget and position quotas
□ Prediction cards: submit works, lock state renders after kickoff time
□ MOTM vote: renders only for FT matches, disabled after user votes
□ Paystack bottom sheet opens, WebView renders, success/failure modal shows
□ Profile settings: logout with confirmation dialog clears state and navigates to Login
□ Notifications: unread badge shows on bell icon
□ No `console.error` or `console.warn` output related to missing keys or prop types
□ All navigation params are typed (no `route.params as any`)
□ No files imported that do not exist
□ No files that exist but are not imported anywhere (dead files)
```

---

## 11. OPEN QUESTIONS (assumptions to use until confirmed)

These questions are unresolved per the original app map. Use these defaults and leave a `// TODO:` comment:

| # | Question | Default assumption |
|---|----------|-------------------|
| Q1 | Onboarding slide count / content | 3 slides: Reactions, Fantasy, Predictions |
| Q2 | Subscription price | GH₵3/month |
| Q3 | Fantasy formation | 4-4-2 (fixed), no user choice |
| Q4 | News source | Admin-posted via CMS; no external RSS initially |
| Q5 | Reaction edit/delete | Post-only; no edit or delete after posting |
| Q6 | Private profile scope | Hides stats row and reactions from other users; username and club badge still visible |

---

## 12. WHAT WAS DONE — SUMMARY SECTION

> The AI agent must append a summary here after completing the build. Format:

### Files Created
- List every new file path

### Files Modified
- List every modified file path + one-line description of change

### Files Deleted
- List every deleted file + reason for deletion

### Errors Encountered & Fixed
- Each error + how it was resolved

### Known Limitations / TODOs
- Anything deferred, mocked, or awaiting backend

---

*End of prompt. Begin execution from Section 1.1.*
