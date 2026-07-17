import { ImageSourcePropType } from 'react-native';

// Badge artwork is loaded via require() from the local assets/badges/ directory.
// These files must exist in assets/badges/ — run scripts/extract-badges.js to generate them.
// Keyed by club.id for quick lookup.
export const Logos: Record<string, ImageSourcePropType> = {
  medeama: require('../../assets/badges/medeama_sc.png'),
  bibiani: require('../../assets/badges/bibiani_gold_stars.png'),
  hearts: require('../../assets/badges/hearts_of_oak.png'),
  dreams: require('../../assets/badges/dreams_fc.png'),
  samartex: require('../../assets/badges/samartex.png'),
  aduana: require('../../assets/badges/aduana_stars.png'),
  berekum: require('../../assets/badges/berekum_chelsea.png'),
  kotoko: require('../../assets/badges/asante_kotoko.png'),
  karela: require('../../assets/badges/karela_united.png'),
  bechem: require('../../assets/badges/bechem_united.png'),
  vision: require('../../assets/badges/vision_fc.png'),
  basake: require('../../assets/badges/basake_holy_stars.png'),
  apostles: require('../../assets/badges/young_apostles.png'),
  lions: require('../../assets/badges/heart_of_lions.png'),
  allblacks: require('../../assets/badges/all_blacks.png'),
  nations: require('../../assets/badges/nations_fc.png'),
  hohoe: require('../../assets/badges/hohoe_united.png'),
  wonders: require('../../assets/badges/eleven_wonders.png'),
};
