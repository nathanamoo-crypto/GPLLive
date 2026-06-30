import { Match, MatchEvent } from '../types';
import { DUMMY_MATCHES } from '../constants/homeDummyData';

/**
 * MOCK MATCH SERVICE
 * -------------------
 * This layer abstracts data fetching to make future API integration seamless.
 * 
 * TO REVERT/UPDATE: Replace mock returns with real 'api.get()' calls.
 */

// TODO: Replace with API call to /matches
export const getMatches = async (): Promise<Match[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return DUMMY_MATCHES;
};

// TODO: Replace with API call to /matches/:id
export const getMatchDetails = async (id: string): Promise<Match | null> => {
  const match = DUMMY_MATCHES.find(m => m.id === id);
  return match || null;
};

// TODO: Replace with API call to /matches/:id/events
export const getMatchEvents = async (matchId: string): Promise<MatchEvent[]> => {
  return [
    { id: 'e1', matchId, type: 'goal', minute: 12, playerName: 'Frank Etouga', side: 'home' },
    { id: 'e2', matchId, type: 'yellow_card', minute: 34, playerName: 'Awako', side: 'away' },
  ];
};
