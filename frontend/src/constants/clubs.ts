import { Club } from '../types';

export const GPL_CLUBS: Club[] = [
  { id: 1, slug: 'medeama_sc', name: 'Medeama SC', shortName: 'Medeama', badgeUrl: 'local://medeama_sc', logoUrl: undefined, city: 'Tarkwa', stadium: 'Tarkwa T&A Park', stadiumCapacity: 12000 },
  { id: 2, slug: 'bibiani_gold_stars', name: 'Bibiani Gold Stars', shortName: 'Gold Stars', badgeUrl: 'local://bibiani_gold_stars', logoUrl: undefined, city: 'Bibiani', stadium: 'Bibiani Dun\'s Park', stadiumCapacity: 7000 },
  { id: 3, slug: 'hearts_of_oak', name: 'Hearts of Oak', shortName: 'Hearts', badgeUrl: 'local://hearts_of_oak', logoUrl: undefined, city: 'Accra', stadium: 'Accra Sports Stadium', stadiumCapacity: 40000 },
  { id: 4, slug: 'dreams_fc', name: 'Dreams FC', shortName: 'Dreams', badgeUrl: 'local://dreams_fc', logoUrl: undefined, city: 'Tuba', stadium: 'Tuba Astro Turf', stadiumCapacity: 1000 },
  { id: 5, slug: 'samartex', name: 'Samartex', shortName: 'Samartex', badgeUrl: 'local://samartex', logoUrl: undefined, city: 'Samreboi', stadium: 'Nsenkyire Sports Arena', stadiumCapacity: 2000 },
  { id: 6, slug: 'aduana_stars', name: 'Aduana Stars', shortName: 'Aduana', badgeUrl: 'local://aduana_stars', logoUrl: undefined, city: 'Dormaa', stadium: 'Agyeman Badu Stadium', stadiumCapacity: 7000 },
  { id: 7, slug: 'berekum_chelsea', name: 'Berekum Chelsea', shortName: 'Chelsea', badgeUrl: 'local://berekum_chelsea', logoUrl: undefined, city: 'Berekum', stadium: 'Golden City Park', stadiumCapacity: 5000 },
  { id: 8, slug: 'asante_kotoko', name: 'Asante Kotoko', shortName: 'Kotoko', badgeUrl: 'local://asante_kotoko', logoUrl: undefined, city: 'Kumasi', stadium: 'Baba Yara Sports Stadium', stadiumCapacity: 40528 },
  { id: 9, slug: 'karela_united', name: 'Karela United', shortName: 'Karela', badgeUrl: 'local://karela_united', logoUrl: undefined, city: 'Tamale', stadium: 'Tamale Stadium', stadiumCapacity: 21017 },
  { id: 10, slug: 'bechem_united', name: 'Bechem United', shortName: 'Bechem', badgeUrl: 'local://bechem_united', logoUrl: undefined, city: 'Bechem', stadium: 'Nana Gyeabour\'s Park', stadiumCapacity: 5000 },
  { id: 11, slug: 'vision_fc', name: 'Vision FC', shortName: 'Vision', badgeUrl: 'local://vision_fc', logoUrl: undefined, city: 'Nungua', stadium: 'Nii Adjei Kraku Sports Complex', stadiumCapacity: 2500 },
  { id: 12, slug: 'basake_holy_stars', name: 'Basake Holy Stars', shortName: 'Holy Stars', badgeUrl: 'local://basake_holy_stars', logoUrl: undefined, city: 'Basake', stadium: 'Crosby Awuah Memorial Park', stadiumCapacity: 0 },
  { id: 13, slug: 'young_apostles', name: 'Young Apostles', shortName: 'Apostles', badgeUrl: 'local://young_apostles', logoUrl: undefined, city: 'Wenchi', stadium: 'Wenchi Sports Stadium', stadiumCapacity: 1000 },
  { id: 14, slug: 'heart_of_lions', name: 'Heart of Lions', shortName: 'Lions', badgeUrl: 'local://heart_of_lions', logoUrl: undefined, city: 'Kpando', stadium: 'Kpando Park', stadiumCapacity: 5000 },
  { id: 15, slug: 'all_blacks', name: 'All Blacks', shortName: 'All Blacks', badgeUrl: 'local://all_blacks', logoUrl: undefined, city: 'Swedru', stadium: 'Swedru Stadium', stadiumCapacity: 0 },
  { id: 16, slug: 'nations_fc', name: 'Nations FC', shortName: 'Nations', badgeUrl: 'local://nations_fc', logoUrl: undefined, city: 'Kumasi', stadium: 'Dr. Kwame Kyei Sports Complex', stadiumCapacity: 12000 },
  { id: 17, slug: 'hohoe_united', name: 'Hohoe United', shortName: 'Hohoe', badgeUrl: 'local://hohoe_united', logoUrl: undefined, city: 'Hohoe', stadium: '', stadiumCapacity: 0 },
  { id: 18, slug: 'eleven_wonders', name: 'Eleven Wonders', shortName: 'Wonders', badgeUrl: 'local://eleven_wonders', logoUrl: undefined, city: 'Techiman', stadium: 'Ohene Ameyaw Park', stadiumCapacity: 2000 },
];

export const CLUB_LOOKUP: Record<number, Club> = {};
for (const club of GPL_CLUBS) {
  CLUB_LOOKUP[club.id] = club;
}

export const CLUB_BY_SLUG: Record<string, Club> = {};
for (const club of GPL_CLUBS) {
  CLUB_BY_SLUG[club.slug] = club;
}

export const CLUB_BY_LEGACY_ID: Record<string, Club> = {
  medeama: CLUB_LOOKUP[1], bibiani: CLUB_LOOKUP[2], hearts: CLUB_LOOKUP[3],
  dreams: CLUB_LOOKUP[4], samartex: CLUB_LOOKUP[5], aduana: CLUB_LOOKUP[6],
  berekum: CLUB_LOOKUP[7], kotoko: CLUB_LOOKUP[8], karela: CLUB_LOOKUP[9],
  bechem: CLUB_LOOKUP[10], vision: CLUB_LOOKUP[11], basake: CLUB_LOOKUP[12],
  apostles: CLUB_LOOKUP[13], lions: CLUB_LOOKUP[14], allblacks: CLUB_LOOKUP[15],
  nations: CLUB_LOOKUP[16], hohoe: CLUB_LOOKUP[17], wonders: CLUB_LOOKUP[18],
};

export const CLUB_COLORS: Record<number, string> = {
  1: '#FFD700',
  2: '#FFA500',
  3: '#003D7A',
  4: '#1E5631',
  5: '#2E8B57',
  6: '#006400',
  7: '#0066CC',
  8: '#C8102E',
  9: '#FF4500',
  10: '#8B0000',
  11: '#4169E1',
  12: '#191970',
  13: '#9932CC',
  14: '#8B4513',
  15: '#000000',
  16: '#2F4F4F',
  17: '#008080',
  18: '#4A0E4E',
};
