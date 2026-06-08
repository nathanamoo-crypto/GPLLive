import { Match, Standing, LeaderboardEntry, Article, Notification } from '../types';

export const DUMMY_MATCHES: Match[] = [
  {
    id: 'match-1',
    homeClub: { id: 'kotoko', name: 'Asante Kotoko', shortName: 'Kotoko', badgeUrl: '', city: 'Kumasi' },
    awayClub: { id: 'hearts', name: 'Hearts of Oak', shortName: 'Hearts', badgeUrl: '', city: 'Accra' },
    homeScore: 2,
    awayScore: 1,
    status: 'live',
    kickoffTime: new Date().toISOString(),
    liveMinute: 67,
    venue: 'Baba Yara Stadium',
    round: 24,
    gameweek: 24,
  },
  {
    id: 'match-2',
    homeClub: { id: 'medeama', name: 'Medeama SC', shortName: 'Medeama', badgeUrl: '', city: 'Tarkwa' },
    awayClub: { id: 'dreams', name: 'Dreams FC', shortName: 'Dreams', badgeUrl: '', city: 'Dawu' },
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    kickoffTime: new Date(Date.now() + 3600 * 1000).toISOString(),
    venue: 'Theatre of Dreams',
    round: 25,
    gameweek: 24,
  },
];

export const DUMMY_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'goal',
    title: 'Goal for Kotoko',
    body: 'Asante Kotoko take the lead in the 67th minute.',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif-2',
    type: 'fantasy',
    title: 'Fantasy points updated',
    body: 'Your squad earned 12 points this gameweek.',
    read: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'notif-3',
    type: 'prediction',
    title: 'Prediction results are in',
    body: 'You scored 6 points on Gameweek 24.',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const DUMMY_NEWS: Array<Pick<Article, 'id' | 'headline' | 'source' | 'category'> & { time: string }> = [
  { id: 'news-1', headline: 'Kotoko secure narrow win in derby', source: 'Ghana Sports', category: 'GPL', time: '2h ago' },
  { id: 'news-2', headline: 'Hearts target top four finish after strong start', source: 'GPL Daily', category: 'GPL', time: '4h ago' },
  { id: 'news-3', headline: 'Medeama extend unbeaten run with late equaliser', source: 'Football Ghana', category: 'GPL', time: '6h ago' },
];

export const DUMMY_STANDINGS: Standing[] = [
  {
    position: 1,
    club: { id: 'kotoko', name: 'Asante Kotoko', shortName: 'Kotoko', badgeUrl: '', city: 'Kumasi' },
    played: 24,
    won: 15,
    drawn: 5,
    lost: 4,
    goalDifference: 12,
    points: 50,
    form: ['W', 'W', 'D', 'W', 'L'],
  },
  {
    position: 2,
    club: { id: 'hearts', name: 'Hearts of Oak', shortName: 'Hearts', badgeUrl: '', city: 'Accra' },
    played: 24,
    won: 14,
    drawn: 6,
    lost: 4,
    goalDifference: 10,
    points: 48,
    form: ['W', 'D', 'W', 'W', 'W'],
  },
  {
    position: 3,
    club: { id: 'medeama', name: 'Medeama SC', shortName: 'Medeama', badgeUrl: '', city: 'Tarkwa' },
    played: 24,
    won: 13,
    drawn: 7,
    lost: 4,
    goalDifference: 8,
    points: 46,
    form: ['D', 'W', 'W', 'D', 'W'],
  },
  {
    position: 4,
    club: { id: 'dreams', name: 'Dreams FC', shortName: 'Dreams', badgeUrl: '', city: 'Dawu' },
    played: 24,
    won: 12,
    drawn: 6,
    lost: 6,
    goalDifference: 5,
    points: 42,
    form: ['L', 'W', 'D', 'W', 'D'],
  },
  {
    position: 5,
    club: { id: 'rtu', name: 'Real Tamale United', shortName: 'RTU', badgeUrl: '', city: 'Tamale' },
    played: 24,
    won: 11,
    drawn: 7,
    lost: 6,
    goalDifference: 3,
    points: 40,
    form: ['W', 'D', 'L', 'W', 'D'],
  },
];

export const DUMMY_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    rankChange: 1,
    userId: 'user-1',
    username: 'KotokoKing',
    club: { id: 'kotoko', name: 'Asante Kotoko', shortName: 'Kotoko', badgeUrl: '', city: 'Kumasi' },
    totalPoints: 48,
    weekPoints: 12,
    isCurrentUser: false,
  },
  {
    rank: 2,
    rankChange: -1,
    userId: 'user-2',
    username: 'HeartsLoyal',
    club: { id: 'hearts', name: 'Hearts of Oak', shortName: 'Hearts', badgeUrl: '', city: 'Accra' },
    totalPoints: 42,
    weekPoints: 9,
    isCurrentUser: false,
  },
  {
    rank: 3,
    rankChange: 0,
    userId: 'user-3',
    username: 'MedeamaMagic',
    club: { id: 'medeama', name: 'Medeama SC', shortName: 'Medeama', badgeUrl: '', city: 'Tarkwa' },
    totalPoints: 39,
    weekPoints: 8,
    isCurrentUser: false,
  },
];

export const DUMMY_FANTASY = {
  hasSquad: true,
  teamName: 'GPL All Stars',
  weekPoints: 54,
  overallRank: 128,
};