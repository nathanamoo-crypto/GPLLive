// The backend's `real_clubs` table and this app's local GPL_CLUBS list
// (clubs.ts) were built independently and assign completely different
// numeric IDs to the same 18 clubs - e.g. frontend id 1 is Medeama SC, but
// the backend's id 1 is Aduana Stars. Trusting IDs across the two systems
// silently shows the wrong club.
//
// This is an explicit, hand-checked mapping from the backend's exact
// `full_name` (see V2__real_club.sql / V17__seed_clubs.sql) to this app's
// local `slug` (clubs.ts), so any club fetched live from the backend can be
// paired with the correct bundled badge image. Fuzzy/normalized name
// matching was deliberately avoided here - several pairs differ enough
// ("Swedru All Blacks United FC" vs "All Blacks", "Hearts of Lions" vs
// "Heart of Lions") that automatic matching would be as risky as trusting
// the mismatched IDs in the first place.
export const BACKEND_CLUB_NAME_TO_SLUG: Record<string, string> = {
  'Aduana Stars FC': 'aduana_stars',
  'Asante Kotoko SC': 'asante_kotoko',
  'Hearts of Oak': 'hearts_of_oak',
  'FC Samartex': 'samartex',
  'Bibiani Gold Stars FC': 'bibiani_gold_stars',
  'Medeama SC': 'medeama_sc',
  'Bechem United FC': 'bechem_united',
  'Berekum Chelsea FC': 'berekum_chelsea',
  'Karela United FC': 'karela_united',
  'Hohoe United Football Club': 'hohoe_united',
  'Nations Football Club': 'nations_fc',
  'Basake Holy Stars FC': 'basake_holy_stars',
  'Swedru All Blacks United FC': 'all_blacks',
  'Young Apostles FC': 'young_apostles',
  'Dreams FC': 'dreams_fc',
  'Vision FC': 'vision_fc',
  'Eleven Wonders FC': 'eleven_wonders',
  'Hearts of Lions': 'heart_of_lions',
};
