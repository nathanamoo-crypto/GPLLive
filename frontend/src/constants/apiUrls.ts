// ─────────────────────────────────────────────────────────────────────────────
// GPL Live — Microservice Base URLs
// src/constants/apiUrls.ts
//
// All six Spring Boot microservice base URLs are defined here.
// NEVER write raw URL strings inside screens or services — always import from
// this file. When the Backend Lead deploys a service to Railway, update ONLY
// this file and the change propagates everywhere automatically.
//
// HOW TO UPDATE FOR RAILWAY:
//   Before:  export const AUTH_URL = 'http://localhost:8081';
//   After:   export const AUTH_URL = 'https://gpl-auth.up.railway.app';
// ─────────────────────────────────────────────────────────────────────────────

/**
 * auth-service
 * Handles: user registration, login, JWT issuance & refresh
 * Endpoints: POST /auth/register  |  POST /auth/login
 */
export const AUTH_URL = 'http://localhost:8081';

/**
 * match-service
 * Handles: GPL fixtures, results, match details, club information
 * Endpoints: GET /matches  |  GET /matches/:id
 */
export const MATCH_URL = 'http://localhost:8082';

/**
 * fantasy-service
 * Handles: squad management, transfers, chips, scoring engine,
 *          auto-substitution, leaderboard, pricing
 * Endpoints: GET /fantasy/team  |  POST /fantasy/transfers
 */
export const FANTASY_URL = 'http://localhost:8083';

/**
 * vote-service
 * Handles: Man of the Match voting, vote counts, vote percentages
 * Endpoints: POST /votes/motm/:matchId  |  GET /votes/motm/:matchId
 */
export const VOTE_URL = 'http://localhost:8084';

/**
 * prediction-service
 * Handles: match outcome predictions, points calculation, prediction leaderboard
 * Endpoints: POST /predictions  |  GET /predictions/leaderboard
 */
export const PREDICT_URL = 'http://localhost:8085';

/**
 * notification-service
 * Handles: Expo push token registration, goal alerts, deadline reminders,
 *          rank update notifications
 * Endpoints: POST /notifications/register  |  POST /notifications/send
 */
export const NOTIFICATION_URL = 'http://localhost:8086';