# GPLLive

GPL Live is a Ghana Premier League fan engagement platform built to connect fans with clubs through interactive football experiences, live engagement, and community-driven features.

The application is being developed using **React Native (Expo SDK 54)**, **TypeScript**, **Spring Boot (Java)**, **PostgreSQL**, and a **Microservices Architecture**.

---

## Status

| Layer | Status |
|-------|--------|
| Frontend | Active development — Expo app with navigation, services, state management |
| Backend | Not yet started |
| Database | Not yet started |

---

## Features

- ⚽ Match Reactions
- 🗳️ Man of the Match (MOTM) Voting
- 📊 Match Predictions
- 📰 Exclusive Club Content
- 🔔 Push Notifications
- 🏆 Fantasy League System *(planned)*
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

### Backend (planned)
- Spring Boot (Java)
- REST APIs
- Microservices Architecture

### Database (planned)
- PostgreSQL

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
├── backend/                   # Spring Boot microservices *(not yet started)*
├── database/                  # Database schemas and backups *(not yet started)*
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

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npx expo`)
- iOS Simulator (macOS) or Android Emulator / physical device with Expo Go

### Install & Run

```bash
cd frontend
npm install
npx expo start
```

Press `a` for Android, `i` for iOS, or `w` for web.

### Type Check

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
