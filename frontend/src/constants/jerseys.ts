import { ImageSourcePropType } from 'react-native';

// Real jersey photos, keyed by LOCAL club id (same keying scheme as
// constants/logos.ts's `Logos`). Only the 15 currently ACTIVE GPL clubs are
// covered here - the 3 missing clubs (Nations FC id 16, Hohoe United id 17,
// Eleven Wonders id 18) are RELEGATED (see V17__seed_clubs.sql) and already
// excluded server-side by ClubService.getAllClub(), so no player can ever
// actually belong to one of them - there's nothing to add later.
//
// Any lookup miss (e.g. a future promoted club without a photo yet) falls
// back to the generated JerseyIcon in PlayerChip, so this map is safe to
// leave partial.
export const Jerseys: Record<number, ImageSourcePropType> = {
  1: require('../assets/jerseys/Medeama.png'),
  // bibiani.jpeg has a smoky green photo backdrop baked into the image
  // itself (not fixable with a CSS background change) - gold_stars_jersey
  // is the same Bibiani Gold Stars / Asante Gold Corp kit sponsor branding,
  // shot on a clean white backdrop like every other club's photo.
  2: require('../assets/jerseys/gold_stars_jersey.png'),
  3: require('../assets/jerseys/hearts_of_oak.png'),
  4: require('../assets/jerseys/drems fc.png'),
  5: require('../assets/jerseys/samartex.png'),
  6: require('../assets/jerseys/aduana.png'),
  7: require('../assets/jerseys/Berekum_Chelsea_FC.png'),
  8: require('../assets/jerseys/Asante_Kotoko.png'),
  9: require('../assets/jerseys/karela.png'),
  10: require('../assets/jerseys/Bechem_United_FC.png'),
  11: require('../assets/jerseys/visionFc.png'),
  12: require('../assets/jerseys/Basake_Holy_Stars_Fc.png'),
  13: require('../assets/jerseys/young_apostles.png'),
  14: require('../assets/jerseys/hearts_of_lions.png'),
  15: require('../assets/jerseys/Swedru All Blacks United FC.png'),
};

export const GoalkeeperJerseys: Record<number, ImageSourcePropType> = {
  1: require('../assets/jerseys/Medeama_gk.png'),
  2: require('../assets/jerseys/gold_stars_gk.png'),
  3: require('../assets/jerseys/hearts_of_oak_gk.png'),
  4: require('../assets/jerseys/Dreams_fc_gk.png'),
  5: require('../assets/jerseys/samartex_gk.png'),
  6: require('../assets/jerseys/Aduana_gk.png'),
  7: require('../assets/jerseys/Brekum_Chelsea_FC_gk.png'),
  8: require('../assets/jerseys/Asante_Kotoko_gk.png'),
  9: require('../assets/jerseys/Karela_gk.png'),
  10: require('../assets/jerseys/Bechem_United_FC_gk.png'),
  11: require('../assets/jerseys/visionFC_gk.png'),
  12: require('../assets/jerseys/Basake_Holy_Stars_Fc_gk.png'),
  13: require('../assets/jerseys/young_apostles_gk.png'),
  14: require('../assets/jerseys/hearts_of_lions_gk.png'),
  15: require('../assets/jerseys/Swedru_All_Blacks_United_FC_gk.png'),
};
