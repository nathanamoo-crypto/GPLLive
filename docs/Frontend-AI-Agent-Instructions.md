# GPL LIVE — FRONTEND AI AGENT INSTRUCTIONS

## For VS Code AI Agent

## Frontend Lead Workspace Only

---

# IMPORTANT — READ THIS ENTIRE FILE THOROUGHLY FIRST

Before generating code, suggestions, architecture, or commands:

* Read ALL instructions in this file carefully
* Follow the project structure exactly
* Respect teammate responsibilities
* Avoid creating unnecessary files
* Avoid modifying areas outside frontend/
* Avoid overengineering
* Keep everything Phase-1 focused only

You are assisting ONLY the Frontend Lead.

---

# PROJECT INFORMATION

## Project Name

GPL Live

## Project Description

GPL Live is a Ghana Premier League fan engagement mobile application built for an academic Mobile Application Development project.

The platform includes:

* Match feeds
* MOTM voting
* Predictions
* Fantasy league systems
* Notifications
* Fan engagement features

---

# TECHNOLOGY STACK

Frontend:

* React Native
* Expo
* TypeScript

Backend:

* Spring Boot (Java)

Database:

* PostgreSQL

Architecture:

* Microservices Architecture

Notifications:

* Expo Notifications

---

# MY ROLE

I am:

## Frontend Lead — Nathaniel

My responsibilities:

* Navigation setup
* React Native screens
* API integration setup
* Frontend architecture
* Form handling
* State management preparation

I am NOT responsible for:

* Database setup
* Backend APIs
* Docker setup
* Notification backend systems
* UI/UX design system ownership
* Full integration systems

---

# TEAM STRUCTURE

## Patrick — UI/UX Lead

Responsible for:

* Colors
* Typography
* Styling
* Reusable UI components
* Design consistency

DO NOT:

* Replace his design decisions
* Create large design systems
* Overstyle screens
* Create advanced reusable UI libraries

Simple placeholder UI only.

---

## Augustine — Backend Lead

Responsible for:

* Spring Boot services
* APIs
* Authentication logic
* Business logic
* Microservices

DO NOT:

* Create backend services
* Generate Java backend code
* Create backend folders
* Implement authentication logic

Frontend placeholders only.

---

## Kwaasi — Integration Lead

Responsible for:

* API testing
* Notifications
* Frontend/backend integration
* Debugging

DO NOT:

* Build notification systems
* Configure Postman collections
* Create integration pipelines

---

## Righteous — Database Lead

Responsible for:

* PostgreSQL setup
* Docker setup
* ERD diagrams
* Relationships
* SQL schemas

DO NOT:

* Create database files
* Generate schemas
* Create Docker configurations

---

# CURRENT LOCAL REPOSITORY STATUS

IMPORTANT:
My local machine currently ONLY contains:

GPLLive/
└── frontend/

The other folders:

* backend/
* database/
* docs/
* assets/

may exist on GitHub later, but they do NOT currently exist locally because my teammates have not pushed their work yet.

DO NOT:

* create missing teammate folders
* generate placeholder backend systems
* generate database structures
* create fake integration systems

ONLY work inside:
GPLLive/frontend/

---

# CURRENT BRANCH

I am currently working on:

feature/navigation-setup

DO NOT:

* suggest switching branches unnecessarily
* suggest working on main
* suggest restructuring the repository

---

# GITHUB RULES

These rules are STRICT.

## RULE 1

NEVER push directly to:

* main

## RULE 2

Never suggest bypassing:

* develop
* feature branches
* pull requests

## RULE 3

Workflow is ALWAYS:

main
↓
develop
↓
feature branch

## RULE 4

Before new work:

```bash
git checkout develop
git pull origin develop
```

## RULE 5

Create feature branches like:

```bash
git checkout -b feature/navigation-setup
```

## RULE 6

Commit properly:

```bash
git add .
git commit -m "Set up navigation structure"
```

## RULE 7

Push feature branches:

```bash
git push origin feature/navigation-setup
```

## RULE 8

All merges go:
feature branch → develop

NOT directly into main.

---

# CURRENT PROJECT PHASE

## PHASE 1 — PROJECT SETUP & LEARNING

### May 11 – May 17

This phase focuses ONLY on:

* setup
* navigation
* learning tools
* architecture
* folder structure
* sample screens
* API service setup

NOT advanced features.

---

# WHAT HAS ALREADY BEEN COMPLETED

Inside frontend/:

## Expo + TypeScript setup completed

Dependencies already installed:

* @react-navigation/native
* @react-navigation/stack
* @react-navigation/bottom-tabs
* react-native-screens
* react-native-safe-area-context
* react-native-gesture-handler
* react-native-reanimated
* axios
* @react-native-async-storage/async-storage

## Existing folder structure:

```text
frontend/
├── src/
│   ├── components/
│   ├── screens/
│   ├── navigation/
│   ├── services/
│   ├── hooks/
│   ├── context/
│   ├── utils/
│   ├── types/
│   ├── constants/
│   └── styles/
```

This structure already exists.
DO NOT recreate it.

---

# REMAINING PHASE 1 TASKS

You should ONLY help implement:

1. AppNavigator.tsx
2. AuthNavigator.tsx
3. MainTabNavigator.tsx
4. LoginScreen.tsx
5. HomeScreen.tsx
6. src/services/api.ts
7. App.tsx integration
8. Expo app testing

---

# IMPORTANT LIMITATIONS

DO NOT:

* build fantasy screens
* build notifications
* build real authentication
* connect to real APIs
* create backend systems
* create Docker systems
* add Redux unless absolutely necessary
* install unnecessary libraries
* create production-level complexity
* create teammate folders
* modify teammate responsibilities
* create advanced styling systems

Keep everything:

* simple
* clean
* beginner-friendly
* maintainable
* MVP-focused

---

# UI RULES

Since Patrick is UI/UX Lead:

Use only:

* basic placeholder styling
* simple layouts
* minimal colors
* functional UI

DO NOT:

* create final UI systems
* create advanced design systems
* overstyle screens

---

# DEVELOPMENT GOAL BEFORE MAY 17

The frontend should:

* run successfully with Expo
* navigate between Login and Home screens
* contain clean navigation architecture
* contain Axios API setup
* compile successfully
* avoid merge conflicts
* remain easy for teammates to integrate into later

---

# AI AGENT TASK

When helping me:

1. Explain WHY each file exists
2. Explain WHERE files belong
3. Generate clean TypeScript code
4. Keep solutions simple
5. Respect teammate boundaries
6. Avoid architecture conflicts
7. Suggest clean commit messages
8. Ensure all work stays inside:
   GPLLive/frontend/

Most importantly:
DO NOT complicate the project.
This is an academic MVP, not a production startup system.