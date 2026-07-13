import { ImageSourcePropType } from 'react-native';

// Badge artwork is loaded via require() from the local assets/badges/ directory.
// These files must exist in assets/badges/ — run scripts/extract-badges.js to generate them.
// Keyed by club.id for quick lookup.
export const Logos: Record<string, ImageSourcePropType> = {
  aduana: require('../../assets/badges/aduana_fc.png'),
  kotoko: require('../../assets/badges/asante_kotoko.png'),
  basake: require('../../assets/badges/basake_holy_stars.png'),
  bechem: require('../../assets/badges/bechem_united.png'),
  chelsea: require('../../assets/badges/berekum_chelsea.png'),
  bibiani: require('../../assets/badges/bibiani_gold_stars.png'),
  dreams: require('../../assets/badges/dreams_fc.png'),
  wonders: require('../../assets/badges/eleven_wonders.png'),
  lions: require('../../assets/badges/heart_of_lions.png'),
  hearts: require('../../assets/badges/hearts_of_oak.png'),
  hohoe: require('../../assets/badges/hohoe_united.png'),
  karela: require('../../assets/badges/karela_united.png'),
  medeama: require('../../assets/badges/medeama_sc.png'),
  nations: require('../../assets/badges/nations_fc.png'),
  samartex: require('../../assets/badges/samartex_fc.png'),
  blacks: require('../../assets/badges/swedru_all_blacks.png'),
  vision: require('../../assets/badges/vision_fc.png'),
  apostles: require('../../assets/badges/young_apostles_fc.png'),
};
