import { Player, FantasyTeam } from '../types';

/**
 * MOCK FANTASY SERVICE
 * -------------------
 * This layer abstracts data fetching to make future API integration seamless.
 * 
 * TO REVERT/UPDATE: Replace mock returns with real 'api.post()' or 'api.get()' calls.
 */

// TODO: Replace with API call to /players
export const fetchPlayers = async (): Promise<Player[]> => {
  return [
    { id: 'p1', name: 'Frank Etouga', position: 'FWD', price: 12.5, clubId: 'kotoko', club: { name: 'Asante Kotoko' } } as Player,
    { id: 'p2', name: 'Gladson Awako', position: 'MID', price: 10.0, clubId: 'hearts', club: { name: 'Hearts of Oak' } } as Player,
  ];
};

// TODO: Replace with API call to /fantasy/squad
export const saveFantasySquad = async (teamName: string, playerIds: string[]): Promise<void> => {
  console.log('Saving squad to backend...', { teamName, playerIds });
  await new Promise(resolve => setTimeout(resolve, 1000));
};
