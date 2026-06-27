import { ImageSourcePropType } from 'react-native';

// Badge artwork is loaded via require() from the local assets/badges/ directory.
// These files must exist in assets/badges/ — run scripts/extract-badges.js to generate them.
// Keyed by club.id for quick lookup.
export const Logos: Record<string, ImageSourcePropType> = {
  kotoko: require('../../assets/badges/asante_kotoko.png'),
  hearts: require('../../assets/badges/hearts_of_oak.png'),
  medeama: require('../../assets/badges/medeama_sc.png'),
  dreams: require('../../assets/badges/dreams_fc.png'),
  bibiani: require('../../assets/badges/bibiani_gold_stars.png'),
  cerro: require('../../assets/badges/berekum_chelsea.png'),
  mighty: require('../../assets/badges/mighty_jets.png'),
  legon: require('../../assets/badges/legon_cities.png'),
  king: require('../../assets/badges/king_faisal.png'),
  kuban: require('../../assets/badges/karela_united.png'),
  ashgold: require('../../assets/badges/ashanti_gold.png'),
  dwarfs: require('../../assets/badges/aduana_stars.png'),
  rtu: require('../../assets/badges/real_tamale_united.png'),
  legon2: require('../../assets/badges/great_olympics.png'),
  karela: require('../../assets/badges/accra_lions.png'),
  tudu: require('../../assets/badges/king_solomon.png'),
  elmina: require('../../assets/badges/elmina_sharks.png'),
  cape: require('../../assets/badges/great_mariners.png'),
};
