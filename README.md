# GPLLive

GPL Live is a Ghana Premier League fan engagement platform built to connect fans with clubs through interactive football experiences, live engagement, and community-driven features.

The application is being developed using React Native, Expo, TypeScript, Spring Boot (Java), PostgreSQL, and a Microservices Architecture.

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
- React Native
- Expo
- TypeScript

### Backend
- Spring Boot (Java)
- REST APIs
- Microservices Architecture

### Database
- PostgreSQL

---

## Project Structure
GPLLive/
├── frontend/      # React Native Expo application
├── backend/       # Spring Boot microservices
├── database/      # Database schemas and backups
├── docs/          # Project documentation
├── assets/        # Shared assets and branding
└── README.md

## Git Workflow

This project follows a structured GitHub workflow:

main
  ↓
develop
  ↓
feature branches

### Rules
Never push directly to main
All work must be done in feature branches
Feature branches merge into develop
main is reserved for stable/demo-ready builds

#### Example Workflow
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name