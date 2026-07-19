import { Match, Standing, LeaderboardEntry, Article, Notification } from '../types';
import { CLUB_BY_LEGACY_ID } from './clubs';

function c(id: string) {
  const club = CLUB_BY_LEGACY_ID[id];
  if (!club) throw new Error(`CLUB_BY_LEGACY_ID missing "${id}"`);
  return club;
}

/**
 * TODO: Replace with API call — see APIDocs.md → GET /matches/live
 * GW34 (final matchweek) fixtures — season 2025/26
 */
export const DUMMY_MATCHES: Match[] = [
  {
    id: 1,
    homeClub: c('hearts'),
    awayClub: c('medeama'),
    homeScore: 4,
    awayScore: 2,
    status: 'finished',
    kickoffTime: '2026-05-24T15:00:00Z',
    venue: 'Accra Sports Stadium',
    round: 34,
    gameweek: 34,
  },
  {
    id: 2,
    homeClub: c('berekum'),
    awayClub: c('bechem'),
    homeScore: 3,
    awayScore: 2,
    status: 'finished',
    kickoffTime: '2026-05-24T15:00:00Z',
    venue: 'Golden City Park',
    round: 34,
    gameweek: 34,
  },
  {
    id: 3,
    homeClub: c('kotoko'),
    awayClub: c('allblacks'),
    homeScore: 1,
    awayScore: 2,
    status: 'finished',
    kickoffTime: '2026-05-24T15:00:00Z',
    venue: 'Baba Yara Sports Stadium',
    round: 34,
    gameweek: 34,
  },
];

/**
 * TODO: Replace with API call — see APIDocs.md → GET /notifications
 */
export const DUMMY_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: 'goal',
    title: 'Goal for Hearts of Oak',
    body: 'Hearts of Oak take the lead against Medeama SC in a 4-2 thriller.',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    type: 'fantasy',
    title: 'Fantasy points updated',
    body: 'Your squad earned 54 points this gameweek.',
    read: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 3,
    type: 'prediction',
    title: 'Prediction results are in',
    body: 'You scored 12 points on Gameweek 34.',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

/**
 * TODO: Replace with API call — see APIDocs.md → GET /news
 */
export const DUMMY_NEWS: Array<Pick<Article, 'id' | 'headline' | 'source' | 'category'> & { time: string }> = [
  { id: 'news-1', headline: 'Medeama SC crowned GPL champions', source: 'Ghana Sports', category: 'GPL', time: '2h ago' },
  { id: 'news-2', headline: 'Hearts of Oak secure 3rd place with 4-2 win', source: 'GPL Daily', category: 'GPL', time: '4h ago' },
  { id: 'news-3', headline: 'Bibiani Gold Stars finish runners-up', source: 'Football Ghana', category: 'GPL', time: '6h ago' },
];

/**
 * Full 2025/26 GPL season standings — computed from all 34 matchweeks.
 * TODO: Replace with API call — see APIDocs.md → GET /standings
 */
export const DUMMY_STANDINGS: Standing[] = [
  { position: 1,  club: c('medeama'),   played: 34, won: 17, drawn: 11, lost: 6,  goalDifference: 24,  points: 62, form: ['W','W','D','W','L'] },
  { position: 2,  club: c('bibiani'),   played: 33, won: 18, drawn: 3,  lost: 12, goalDifference: 3,   points: 57, form: ['W','W','D','L','W'] },
  { position: 3,  club: c('hearts'),    played: 34, won: 13, drawn: 15, lost: 6,  goalDifference: 10,  points: 54, form: ['W','D','W','W','W'] },
  { position: 4,  club: c('dreams'),    played: 34, won: 15, drawn: 7,  lost: 12, goalDifference: 18,  points: 52, form: ['L','W','D','W','D'] },
  { position: 5,  club: c('aduana'),    played: 34, won: 13, drawn: 11, lost: 10, goalDifference: 5,   points: 50, form: ['D','W','W','D','W'] },
  { position: 6,  club: c('samartex'),  played: 34, won: 13, drawn: 11, lost: 10, goalDifference: 1,   points: 50, form: ['W','D','W','L','W'] },
  { position: 7,  club: c('karela'),    played: 34, won: 13, drawn: 10, lost: 11, goalDifference: -1,  points: 49, form: ['D','W','L','W','D'] },
  { position: 8,  club: c('vision'),    played: 34, won: 12, drawn: 11, lost: 11, goalDifference: 4,   points: 47, form: ['W','D','L','W','D'] },
  { position: 9,  club: c('berekum'),   played: 33, won: 13, drawn: 8,  lost: 12, goalDifference: -1,  points: 47, form: ['W','D','L','W','W'] },
  { position: 10, club: c('kotoko'),    played: 33, won: 12, drawn: 10, lost: 11, goalDifference: 9,   points: 46, form: ['W','D','L','W','L'] },
  { position: 11, club: c('lions'),     played: 34, won: 12, drawn: 9,  lost: 13, goalDifference: 3,   points: 45, form: ['D','L','W','D','W'] },
  { position: 12, club: c('allblacks'), played: 34, won: 12, drawn: 9,  lost: 13, goalDifference: 3,   points: 45, form: ['L','W','D','W','W'] },
  { position: 13, club: c('apostles'),  played: 34, won: 12, drawn: 9,  lost: 13, goalDifference: 0,   points: 45, form: ['D','L','W','D','W'] },
  { position: 14, club: c('nations'),   played: 34, won: 12, drawn: 8,  lost: 14, goalDifference: -1,  points: 44, form: ['W','D','L','W','L'] },
  { position: 15, club: c('bechem'),    played: 33, won: 12, drawn: 8,  lost: 13, goalDifference: -4,  points: 44, form: ['W','D','L','W','L'] },
  { position: 16, club: c('basake'),    played: 33, won: 12, drawn: 7,  lost: 14, goalDifference: -13, points: 43, form: ['D','L','W','L','L'] },
  { position: 17, club: c('hohoe'),     played: 28, won: 7,  drawn: 9,  lost: 12, goalDifference: -10, points: 30, form: ['D','L','W','D','L'] },
  { position: 18, club: c('wonders'),   played: 33, won: 2,  drawn: 4,  lost: 27, goalDifference: -50, points: 10, form: ['L','L','D','L','L'] },
];

/**
 * TODO: Replace with API call — see APIDocs.md → GET /predictions/leaderboard
 */
export const DUMMY_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    rankChange: 1,
    userId: 101,
    username: 'MedeamaKing',
    club: c('medeama'),
    totalPoints: 48,
    weekPoints: 12,
    isCurrentUser: false,
  },
  {
    rank: 2,
    rankChange: -1,
    userId: 102,
    username: 'HeartsLoyal',
    club: c('hearts'),
    totalPoints: 42,
    weekPoints: 9,
    isCurrentUser: false,
  },
  {
    rank: 3,
    rankChange: 0,
    userId: 103,
    username: 'KotokoFan1',
    club: c('kotoko'),
    totalPoints: 39,
    weekPoints: 8,
    isCurrentUser: false,
  },
];

/**
 * TODO: Replace with API call — see APIDocs.md → GET /fantasy/team
 */
export const DUMMY_FANTASY = {
  hasSquad: true,
  teamName: 'GPL All Stars',
  weekPoints: 54,
  overallRank: 128,
};
