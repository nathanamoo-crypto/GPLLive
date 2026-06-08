import { useMemo } from 'react';
import { Match } from '../types';

const mockMatches: Match[] = [
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
];

export function useMatches() {
  return useMemo(() => mockMatches, []);
}
