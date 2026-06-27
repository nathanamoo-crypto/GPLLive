import { Club } from '../types';

// badgeUrl uses a local:// scheme because real badge images are not yet hosted on a CDN.
// The app loads badge artwork from the local require() map in logos.ts.
// When a CDN becomes available, swap local:// for https:// and update logos.ts accordingly.
export const GPL_CLUBS: Club[] = [
  { id: 'kotoko', name: 'Asante Kotoko', shortName: 'Kotoko', badgeUrl: 'local://asante_kotoko', city: 'Kumasi' },
  { id: 'hearts', name: 'Hearts of Oak', shortName: 'Hearts', badgeUrl: 'local://hearts_of_oak', city: 'Accra' },
  { id: 'medeama', name: 'Medeama SC', shortName: 'Medeama', badgeUrl: 'local://medeama_sc', city: 'Tarkwa' },
  { id: 'dreams', name: 'Dreams FC', shortName: 'Dreams', badgeUrl: 'local://dreams_fc', city: 'Dawu' },
  { id: 'bibiani', name: 'Bibiani Gold Stars', shortName: 'Gold Stars', badgeUrl: 'local://bibiani_gold_stars', city: 'Bibiani' },
  { id: 'cerro', name: 'Berekum Chelsea', shortName: 'Chelsea', badgeUrl: 'local://berekum_chelsea', city: 'Berekum' },
  { id: 'mighty', name: 'Mighty Jets', shortName: 'Mighty', badgeUrl: 'local://mighty_jets', city: 'Tamale' },
  { id: 'legon', name: 'Legon Cities', shortName: 'Legon', badgeUrl: 'local://legon_cities', city: 'Accra' },
  { id: 'king', name: 'King Faisal', shortName: 'King Faisal', badgeUrl: 'local://king_faisal', city: 'Kumasi' },
  { id: 'kuban', name: 'Karela United', shortName: 'Karela', badgeUrl: 'local://karela_united', city: 'Axim' },
  { id: 'ashgold', name: 'Ashanti Gold', shortName: 'AshGold', badgeUrl: 'local://ashanti_gold', city: 'Obuasi' },
  { id: 'dwarfs', name: 'Aduana Stars', shortName: 'Aduana', badgeUrl: 'local://aduana_stars', city: 'Dormaa' },
  { id: 'rtu', name: 'Real Tamale United', shortName: 'RTU', badgeUrl: 'local://real_tamale_united', city: 'Tamale' },
  { id: 'legon2', name: 'Great Olympics', shortName: 'Olympics', badgeUrl: 'local://great_olympics', city: 'Accra' },
  { id: 'karela', name: 'Accra Lions', shortName: 'Accra Lions', badgeUrl: 'local://accra_lions', city: 'Accra' },
  { id: 'tudu', name: 'King Solomon', shortName: 'King Solomon', badgeUrl: 'local://king_solomon', city: 'Kumasi' },
  { id: 'elmina', name: 'Elmina Sharks', shortName: 'Elmina', badgeUrl: 'local://elmina_sharks', city: 'Elmina' },
  { id: 'cape', name: 'Great Mariners', shortName: 'Mariners', badgeUrl: 'local://great_mariners', city: 'Accra' },
];

export const CLUB_LOOKUP: Record<string, Club> = {};
for (const club of GPL_CLUBS) {
  CLUB_LOOKUP[club.id] = club;
}

// Primary jersey colours for each club, used in pitch view and player chips.
export const CLUB_COLORS: Record<string, string> = {
  kotoko: '#C8102E',
  hearts: '#003D7A',
  medeama: '#FFD700',
  dreams: '#1E5631',
  bibiani: '#FFA500',
  cerro: '#0066CC',
  mighty: '#8B0000',
  legon: '#00A86B',
  king: '#4A0E4E',
  kuban: '#FF4500',
  ashgold: '#B8860B',
  dwarfs: '#006400',
  rtu: '#2F4F4F',
  legon2: '#4169E1',
  karela: '#8B4513',
  tudu: '#9932CC',
  elmina: '#008080',
  cape: '#191970',
};
