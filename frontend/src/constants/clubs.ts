import { Club } from '../types';

// badgeUrl uses a local:// scheme because real badge images are not yet hosted on a CDN.
// The app loads badge artwork from the local require() map in logos.ts.
// When a CDN becomes available, swap local:// for https:// and update logos.ts accordingly.
export const GPL_CLUBS: Club[] = [
  { id: 'aduana', name: 'Aduana FC', shortName: 'Aduana', badgeUrl: 'local://aduana_fc', city: 'Dormaa' },
  { id: 'kotoko', name: 'Asante Kotoko', shortName: 'Kotoko', badgeUrl: 'local://asante_kotoko', city: 'Kumasi' },
  { id: 'basake', name: 'Basake Holy Stars', shortName: 'Holy Stars', badgeUrl: 'local://basake_holy_stars', city: 'Basake' },
  { id: 'bechem', name: 'Bechem United', shortName: 'Bechem', badgeUrl: 'local://bechem_united', city: 'Bechem' },
  { id: 'chelsea', name: 'Berekum Chelsea', shortName: 'Chelsea', badgeUrl: 'local://berekum_chelsea', city: 'Berekum' },
  { id: 'bibiani', name: 'Bibiani Gold Stars', shortName: 'Gold Stars', badgeUrl: 'local://bibiani_gold_stars', city: 'Bibiani' },
  { id: 'dreams', name: 'Dreams FC', shortName: 'Dreams', badgeUrl: 'local://dreams_fc', city: 'Dawu' },
  { id: 'wonders', name: 'Eleven Wonders', shortName: 'Wonders', badgeUrl: 'local://eleven_wonders', city: 'Techiman' },
  { id: 'lions', name: 'Heart of Lions', shortName: 'Lions', badgeUrl: 'local://heart_of_lions', city: 'Kpando' },
  { id: 'hearts', name: 'Hearts of Oak', shortName: 'Hearts', badgeUrl: 'local://hearts_of_oak', city: 'Accra' },
  { id: 'hohoe', name: 'Hohoe United', shortName: 'Hohoe', badgeUrl: 'local://hohoe_united', city: 'Hohoe' },
  { id: 'karela', name: 'Karela United', shortName: 'Karela', badgeUrl: 'local://karela_united', city: 'Aiyinase' },
  { id: 'medeama', name: 'Medeama SC', shortName: 'Medeama', badgeUrl: 'local://medeama_sc', city: 'Tarkwa' },
  { id: 'nations', name: 'Nations FC', shortName: 'Nations', badgeUrl: 'local://nations_fc', city: 'Kumasi' },
  { id: 'samartex', name: 'Samartex FC', shortName: 'Samartex', badgeUrl: 'local://samartex_fc', city: 'Samreboi' },
  { id: 'blacks', name: 'Swedru All Blacks', shortName: 'All Blacks', badgeUrl: 'local://swedru_all_blacks', city: 'Swedru' },
  { id: 'vision', name: 'Vision FC', shortName: 'Vision', badgeUrl: 'local://vision_fc', city: 'Accra' },
  { id: 'apostles', name: 'Young Apostles FC', shortName: 'Apostles', badgeUrl: 'local://young_apostles_fc', city: 'Wenchi' },
];

export const CLUB_LOOKUP: Record<string, Club> = {};
for (const club of GPL_CLUBS) {
  CLUB_LOOKUP[club.id] = club;
}

// Primary jersey colours for each club, used in pitch view and player chips.
export const CLUB_COLORS: Record<string, string> = {
  aduana: '#006400',
  kotoko: '#C8102E',
  basake: '#8B0000',
  bechem: '#00A86B',
  chelsea: '#0066CC',
  bibiani: '#FFA500',
  dreams: '#1E5631',
  wonders: '#4A0E4E',
  lions: '#B8860B',
  hearts: '#003D7A',
  hohoe: '#2F4F4F',
  karela: '#FF4500',
  medeama: '#FFD700',
  nations: '#4169E1',
  samartex: '#8B4513',
  blacks: '#9932CC',
  vision: '#008080',
  apostles: '#191970',
};
