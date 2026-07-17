import { Club } from '../types';

// badgeUrl uses a local:// scheme because real badge images are not yet hosted on a CDN.
// The app loads badge artwork from the local require() map in logos.ts.
// When a CDN becomes available, swap local:// for https:// and update logos.ts accordingly.
export const GPL_CLUBS: Club[] = [
  { id: 'medeama', name: 'Medeama SC', shortName: 'Medeama', badgeUrl: 'local://medeama_sc', city: 'Tarkwa', stadium: 'Tarkwa T&A Park', stadiumCapacity: 12000 },
  { id: 'bibiani', name: 'Bibiani Gold Stars', shortName: 'Gold Stars', badgeUrl: 'local://bibiani_gold_stars', city: 'Bibiani', stadium: 'Bibiani Dun\'s Park', stadiumCapacity: 7000 },
  { id: 'hearts', name: 'Hearts of Oak', shortName: 'Hearts', badgeUrl: 'local://hearts_of_oak', city: 'Accra', stadium: 'Accra Sports Stadium', stadiumCapacity: 40000 },
  { id: 'dreams', name: 'Dreams FC', shortName: 'Dreams', badgeUrl: 'local://dreams_fc', city: 'Tuba', stadium: 'Tuba Astro Turf', stadiumCapacity: 1000 },
  { id: 'samartex', name: 'Samartex', shortName: 'Samartex', badgeUrl: 'local://samartex', city: 'Samreboi', stadium: 'Nsenkyire Sports Arena', stadiumCapacity: 2000 },
  { id: 'aduana', name: 'Aduana Stars', shortName: 'Aduana', badgeUrl: 'local://aduana_stars', city: 'Dormaa', stadium: 'Agyeman Badu Stadium', stadiumCapacity: 7000 },
  { id: 'berekum', name: 'Berekum Chelsea', shortName: 'Chelsea', badgeUrl: 'local://berekum_chelsea', city: 'Berekum', stadium: 'Golden City Park', stadiumCapacity: 5000 },
  { id: 'kotoko', name: 'Asante Kotoko', shortName: 'Kotoko', badgeUrl: 'local://asante_kotoko', city: 'Kumasi', stadium: 'Baba Yara Sports Stadium', stadiumCapacity: 40528 },
  { id: 'karela', name: 'Karela United', shortName: 'Karela', badgeUrl: 'local://karela_united', city: 'Tamale', stadium: 'Tamale Stadium', stadiumCapacity: 21017 },
  { id: 'bechem', name: 'Bechem United', shortName: 'Bechem', badgeUrl: 'local://bechem_united', city: 'Bechem', stadium: 'Nana Gyeabour\'s Park', stadiumCapacity: 5000 },
  { id: 'vision', name: 'Vision FC', shortName: 'Vision', badgeUrl: 'local://vision_fc', city: 'Nungua', stadium: 'Nii Adjei Kraku Sports Complex', stadiumCapacity: 2500 },
  { id: 'basake', name: 'Basake Holy Stars', shortName: 'Holy Stars', badgeUrl: 'local://basake_holy_stars', city: 'Basake', stadium: 'Crosby Awuah Memorial Park', stadiumCapacity: 0 },
  { id: 'apostles', name: 'Young Apostles', shortName: 'Apostles', badgeUrl: 'local://young_apostles', city: 'Wenchi', stadium: 'Wenchi Sports Stadium', stadiumCapacity: 1000 },
  { id: 'lions', name: 'Heart of Lions', shortName: 'Lions', badgeUrl: 'local://heart_of_lions', city: 'Kpando', stadium: 'Kpando Park', stadiumCapacity: 5000 },
  { id: 'allblacks', name: 'All Blacks', shortName: 'All Blacks', badgeUrl: 'local://all_blacks', city: 'Swedru', stadium: 'Swedru Stadium', stadiumCapacity: 0 },
  { id: 'nations', name: 'Nations FC', shortName: 'Nations', badgeUrl: 'local://nations_fc', city: 'Kumasi', stadium: 'Dr. Kwame Kyei Sports Complex', stadiumCapacity: 12000 },
  { id: 'hohoe', name: 'Hohoe United', shortName: 'Hohoe', badgeUrl: 'local://hohoe_united', city: 'Hohoe', stadium: '', stadiumCapacity: 0 },
  { id: 'wonders', name: 'Eleven Wonders', shortName: 'Wonders', badgeUrl: 'local://eleven_wonders', city: 'Techiman', stadium: 'Ohene Ameyaw Park', stadiumCapacity: 2000 },
];

export const CLUB_LOOKUP: Record<string, Club> = {};
for (const club of GPL_CLUBS) {
  CLUB_LOOKUP[club.id] = club;
}

// Primary jersey colours for each club, used in pitch view and player chips.
export const CLUB_COLORS: Record<string, string> = {
  medeama: '#FFD700',
  bibiani: '#FFA500',
  hearts: '#003D7A',
  dreams: '#1E5631',
  samartex: '#2E8B57',
  aduana: '#006400',
  berekum: '#0066CC',
  kotoko: '#C8102E',
  karela: '#FF4500',
  bechem: '#8B0000',
  vision: '#4169E1',
  basake: '#191970',
  apostles: '#9932CC',
  lions: '#8B4513',
  allblacks: '#000000',
  nations: '#2F4F4F',
  hohoe: '#008080',
  wonders: '#4A0E4E',
};
