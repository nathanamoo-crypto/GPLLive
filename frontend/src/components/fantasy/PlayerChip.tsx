import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
import { CLUB_COLORS } from '../../constants/clubs';
import { Jerseys, GoalkeeperJerseys } from '../../constants/jerseys';
import { backendClubIdToLocalClub, RealClub } from '../../services/clubService';
import JerseyIcon from './JerseyIcon';
import type { FantasyPlayer } from '../../types';

interface PlayerChipProps {
  player: FantasyPlayer;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  size?: 'pitch' | 'bench';
  /** When provided, the chip becomes tappable (used for the swap-starter-
   *  with-bench-player flow on MyTeamScreen). Omit for read-only pitches
   *  (e.g. the Squad Builder's own preview). */
  onPress?: () => void;
  /** Highlights the chip as the current swap selection. */
  selected?: boolean;
  /** Uniformly shrinks a "pitch"-size chip (jersey box, name, position tag)
   *  below its normal full size. PitchView computes this from how many
   *  players share the widest row (e.g. a back five) so the whole row still
   *  fits within the pitch instead of spilling outside it. Ignored for
   *  "bench" chips, which already wrap onto multiple lines safely. Defaults
   *  to 1 (full size). */
  scale?: number;
  /** Real-id -> RealClub map (from fetchClubsById()), needed to resolve
   *  player.clubId (a raw BACKEND club id) to this app's LOCAL club id -
   *  CLUB_COLORS/Jerseys/GoalkeeperJerseys are all keyed by the local id, not
   *  the backend one, so this resolution can't be skipped. Optional so a
   *  chip rendered before clubsById has loaded still degrades gracefully
   *  (neutral color, generated jersey icon) instead of crashing. */
  clubsById?: Record<number, RealClub>;
}

const POSITION_COLORS: Record<string, string> = {
  GK: Colors.roleGk,
  DEF: Colors.roleDef,
  MID: Colors.roleMid,
  FWD: Colors.roleFwd,
};

export default function PlayerChip({
  player,
  isCaptain = false,
  isViceCaptain = false,
  size = 'pitch',
  onPress,
  selected = false,
  scale = 1,
  clubsById,
}: PlayerChipProps) {
  // player.clubId is the raw BACKEND club id - CLUB_COLORS/Jerseys are keyed
  // by this app's LOCAL club id, so it must be resolved via clubsById first
  // (same pattern used in MyTeamScreen/FantasyRoot/MotmVoteScreen). Without
  // this, colors/jerseys were effectively indexed by the wrong id.
  const localClub = clubsById ? backendClubIdToLocalClub(player.clubId, clubsById) : null;
  const clubColor = (localClub ? CLUB_COLORS[localClub.id] : null) || Colors.grey2;
  const isGoalkeeper = player.position === 'GK';
  const jerseySource = localClub
    ? (isGoalkeeper ? GoalkeeperJerseys[localClub.id] : Jerseys[localClub.id])
    : undefined;
  const posColor = POSITION_COLORS[player.position] || Colors.grey1;
  const isBench = size === 'bench';
  const Wrapper: any = onPress ? TouchableOpacity : View;

  // Bench chips already wrap onto extra lines when there isn't room, so they
  // never need shrinking - only pitch chips (fixed one-per-row-slot) do.
  const s = isBench ? 1 : scale;
  const scaledStyle = s === 1 ? null : {
    wrapper: { width: 78 * s },
    box: { width: 56 * s, height: 56 * s, borderRadius: Math.max(6, 10 * s) },
    jersey: { width: 46 * s, height: 46 * s },
    name: { fontSize: 13 * s },
    posTag: { paddingHorizontal: 7 * s, paddingVertical: 2 * s },
    posText: { fontSize: 10 * s },
  };

  return (
    <Wrapper
      style={[styles.wrapper, isBench && styles.wrapperBench, scaledStyle?.wrapper]}
      {...(onPress ? { onPress, activeOpacity: 0.7 } : {})}
    >
      <View
        style={[
          styles.shirtCircle,
          isBench && styles.shirtCircleBench,
          scaledStyle?.box,
          selected && styles.shirtCircleSelected,
        ]}
      >
        {(isCaptain || isViceCaptain) && (
          <View style={[styles.armband, isCaptain ? styles.captainBand : styles.viceBand]}>
            <Text style={styles.armbandText}>{isCaptain ? 'C' : 'VC'}</Text>
          </View>
        )}
        {jerseySource ? (
          <Image
            source={jerseySource}
            style={[isBench ? styles.jerseyImageBench : styles.jerseyImage, scaledStyle?.jersey]}
            resizeMode="contain"
          />
        ) : (
          <JerseyIcon
            color={clubColor}
            size={(isBench ? 22 : 30) * s}
            isGoalkeeper={isGoalkeeper}
          />
        )}
      </View>
      <Text
        style={[styles.name, isBench && styles.nameBench, scaledStyle?.name]}
        numberOfLines={1}
      >
        {player.name.split(' ').pop()}
      </Text>
      <View style={[styles.posTag, scaledStyle?.posTag, { backgroundColor: posColor }]}>
        <Text style={[styles.posText, isBench && styles.posTextBench, scaledStyle?.posText]}>
          {player.position}
        </Text>
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: 78,
  },
  wrapperBench: {
    width: 64,
    opacity: 0.65,
  },
  shirtCircle: {
    width: 56,
    height: 56,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.1)',
    // Plain white box behind every jersey - a couple of the source photos
    // weren't shot on a clean white backdrop, so a neutral/dark chip
    // background let their backdrop color show through. White keeps every
    // jersey looking consistent regardless of what the source photo used.
    backgroundColor: Colors.white,
  },
  shirtCircleBench: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  shirtCircleSelected: {
    borderColor: Colors.yellow,
    borderWidth: 3,
  },
  jerseyImage: {
    width: 46,
    height: 46,
  },
  jerseyImageBench: {
    width: 36,
    height: 36,
  },
  armband: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    borderWidth: 1.5,
    borderColor: Colors.black,
  },
  captainBand: {
    backgroundColor: Colors.yellow,
  },
  viceBand: {
    backgroundColor: Colors.grey1,
  },
  armbandText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.black,
  },
  name: {
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
    color: Colors.white,
    textAlign: 'center',
  },
  nameBench: {
    fontSize: 12,
  },
  posTag: {
    marginTop: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  posText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: fonts.bodySemiBold,
    color: Colors.white,
  },
  posTextBench: {
    fontSize: 9,
  },
});
