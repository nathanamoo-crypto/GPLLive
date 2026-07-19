import { useMemo } from 'react';
import { CLUB_BY_LEGACY_ID } from '../constants/clubs';
import { Match } from '../types';

const mockMatches: Match[] = [
  {
    id: 1,
    homeClub: CLUB_BY_LEGACY_ID['kotoko']!,
    awayClub: CLUB_BY_LEGACY_ID['hearts']!,
    homeScore: 2,
    awayScore: 1,
    status: 'live',
    kickoffTime: new Date().toISOString(),
    liveMinute: 67,
    venue: 'Baba Yara Stadium',
    round: 24,
    gameweek: 24,
  },
];

export function useMatches() {
  return useMemo(() => mockMatches, []);
}
