# GPLLive

GPL Live is a Ghana Premier League fan engagement platform built to connect fans with clubs through interactive football experiences, live engagement, and community-driven features.

The application is being developed using **React Native (Expo SDK 54)**, **TypeScript**, **Spring Boot (Java)**, and **PostgreSQL**.

---

## Status

| Layer | Status |
|-------|--------|
| Frontend | Active development — Expo app with navigation, services, state management |
| Backend | Active development — Spring Boot REST API, deployed on Render |
| Database | PostgreSQL (Neon), schema managed via Flyway migrations in `backend/` |

---

## Features

- ⚽ Match Reactions
- 🗳️ Man of the Match (MOTM) Voting
- 📊 Match Predictions
- 📰 Exclusive Club Content
- 🔔 Push Notifications
- 🏆 Fantasy League System
- 💳 Premium Club Subscriptions (Paystack)
- 📱 Mobile-First Experience

---

## Tech Stack

### Frontend
| Technology | Version |
|------------|---------|
| React Native | 0.81.5 |
| Expo | SDK 54 |
| TypeScript | 5.9 |
| React Navigation | 7.x (native-stack + bottom-tabs) |
| TanStack React Query | 5.x |
| Zustand | 4.x |
| Axios | 1.x |
| NativeWind | 4.x (Tailwind CSS for RN) |
| React Native Reanimated | 4.x |

### Backend
| Technology | Version |
|------------|---------|
| Spring Boot | 4.1.0 |
| Java | 17 |
| Spring Data JPA / Hibernate | — |
| Spring Security + JWT (jjwt) | — |
| Flyway | Schema migrations |
| PostgreSQL (Neon) | Hosted database |
| Deployed on | Render |

### Database
- PostgreSQL, hosted on Neon
- Schema versioned via Flyway migrations at `backend/src/main/resources/db/migration/`

---

## Project Structure

```
GPLLive/
├── frontend/                  # React Native Expo application
│   ├── App.tsx                # Root component
│   ├── app.json               # Expo configuration
│   ├── index.ts               # Entry point
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── shared/        #   Shared components (MatchCard, Badge, etc.)
│   │   │   ├── home/          #   Home screen components
│   │   │   └── fantasy/       #   Fantasy league components
│   │   ├── screens/           # Screen-level components
│   │   │   ├── home/          #   Home, Fixtures, Standings tabs
│   │   │   ├── fantasy/       #   Fantasy screens
│   │   │   ├── news/          #   News screens
│   │   │   ├── matches/       #   Match details
│   │   │   └── profile/       #   Profile & settings
│   │   ├── navigation/        # React Navigation config (RootNavigator, tabs)
│   │   ├── services/          # API service layer (Axios, match, fantasy, etc.)
│   │   ├── store/             # Zustand state stores
│   │   ├── constants/         # API URLs, club data, colors, routes, etc.
│   │   ├── types/             # TypeScript interfaces & types
│   │   ├── hooks/             # Custom React hooks
│   │   ├── context/           # React contexts
│   │   ├── providers/         # App providers (query client, safe area, etc.)
│   │   ├── assets/            # App-internal assets (jerseys, onboarding images)
│   │   ├── styles/            # Global styles
│   │   └── utils/             # Utility functions
│   ├── assets/                # Static images, splash, icons
│   ├── scripts/               # Standalone Node utilities
│   └── package.json
│
├── backend/                    # Spring Boot REST API
│   ├── src/main/java/com/augustine/gplfantasyleaague/
│   │   ├── config/             # Security, Flyway, scheduler config
│   │   ├── domain/             # Feature packages (each with controller/service/repository/dto/entity)
│   │   │   ├── auth/           #   Registration, login, email verification, Google sign-in, JWT
│   │   │   ├── club/           #   Clubs
│   │   │   ├── engagement/     #   Discussions, MOTM voting, notifications
│   │   │   ├── fantasy/        #   Fantasy teams, players, chips, transfers
│   │   │   ├── gameweek/       #   Gameweeks, fixtures, fixture results
│   │   │   ├── news/           #   News feed (RSS)
│   │   │   ├── player/         #   Players, player prices
│   │   │   ├── scoring/        #   Gameweek scoring
│   │   │   ├── standings/      #   League standings
│   │   │   └── subscription/   #   Premium (Paystack) subscriptions
│   │   └── exception/          # Global exception handling
│   ├── src/main/resources/
│   │   ├── application.yaml    # Base config (env-var driven)
│   │   ├── application-local.yml.example  # Template for local secrets
│   │   └── db/migration/       # Flyway SQL migrations (schema history)
│   ├── Dockerfile              # Used for Render deployment
│   └── DEPLOYMENT.md           # How to deploy your own instance
├── docs/                      # Project documentation
│   ├── APIDocs.md             # API documentation
│   ├── Backend-Integration-Guide.md
│   ├── Frontend-AI-Agent-Instructions.md
│   ├── GPL_Live_Frontend_Build_Prompt.md
│   └── FUTURE_FEATURES.md     # Deferred feature notes
├── assets/                    # Shared assets and branding *(not yet started)*
└── README.md
```

---

## Frontend Architecture

Entry: `App.tsx` → `src/providers/AppProviders` → `src/navigation/RootNavigator`.

Key design decisions:
- **Classic Expo** (not Expo Router) with `@react-navigation/native`
- **TypeScript** throughout — all source code in `.ts` / `.tsx`
- **TanStack React Query** for server state (caching, refetching, mutations)
- **Zustand** for lightweight client state
- **Axios** with interceptors for API calls and JWT injection
- **NativeWind** for utility-first styling via Tailwind CSS

---

## Backend Architecture

Each feature lives in its own package under `domain/` (controller → service →
repository → entity/dto), following standard Spring layering. Cross-cutting
concerns:
- **Spring Security + JWT** — stateless auth, token issued on login/verify-email/Google sign-in
- **Flyway** — every schema change is a numbered migration in `db/migration/`, applied automatically on startup
- **Global exception handling** — `exception/GlobalExceptionHandler` maps domain exceptions to consistent HTTP status codes (409 conflicts, 404 not found, 403 forbidden, etc.)
- **Email verification** — 6-digit code sent via Brevo's HTTPS email API (not SMTP — Render blocks outbound SMTP ports on free web services)
- **Google Sign-In** — backend token verification is implemented; frontend integration is currently parked (Expo Go's OAuth redirect isn't compatible with a Web-application-type Google client)
- **Paystack** — premium club subscription payments

A shared instance is already deployed on Render, so most teammates don't
need to run the backend locally at all — see `frontend/src/constants/apiUrls.ts`.
If you do want to run/deploy your own instance, see `backend/DEPLOYMENT.md`.

---

## Getting Started

### Frontend

**Prerequisites**
- Node.js 18+
- Expo CLI (`npx expo`)
- iOS Simulator (macOS) or Android Emulator / physical device with Expo Go

**Install & Run**

```bash
cd frontend
npm install
npx expo start
```

Press `a` for Android, `i` for iOS, or `w` for web. By default it points at
the shared backend on Render — no backend setup needed to just run the app.

### Backend

**Prerequisites**
- Java 17
- A local PostgreSQL instance (or point at the shared Neon database - ask a teammate for the connection details)

**Setup & Run**

```bash
cd backend
cp src/main/resources/application-local.yml.example src/main/resources/application-local.yml
# fill in a JWT secret + your local DB credentials in that file
./mvnw spring-boot:run
```

Flyway applies all migrations automatically on startup. See
`backend/DEPLOYMENT.md` for deploying your own instance (Render + Neon,
free tier).

### # backend (C:\Users\augus\IdeaProjects\gplFantasyLeaague)
git add src/main/java/com/augustine/gplfantasyleaague/domain/auth/service/AuthService.java src/main/java/com/augustine/gplfantasyleaague/domain/auth/entity/PendingRegistration.java src/main/java/com/augustine/gplfantasyleaague/domain/auth/repository/PendingRegistrationRepository.java src/main/java/com/augustine/gplfantasyleaague/config/PendingRegistrationCleanupScheduler.java src/main/resources/db/migration/V30__pending_registrations.sql
git commit -m "Don't create a user until email is verified - stage registrations in pending_registrations instead"
git push origin develop Type Check

```bash
cd frontend
npm run typecheck
```

---

## Git Workflow

This project follows a structured GitHub workflow:

```
main
  ↓
develop
  ↓
feature branches
```

### Rules
- Never push directly to `main`
- All work must be done in feature branches
- Feature branches merge into `develop`
- `main` is reserved for stable/demo-ready builds

### Example Workflow

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```
