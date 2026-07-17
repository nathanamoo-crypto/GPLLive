import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
import { CLUB_COLORS } from '../../constants/clubs';
import type { FantasyPlayer } from '../../types';

interface PlayerChipProps {
  player: FantasyPlayer;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  size?: 'pitch' | 'bench';
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
}: PlayerChipProps) {
  const clubColor = CLUB_COLORS[player.clubId] || Colors.grey2;
  const posColor = POSITION_COLORS[player.position] || Colors.grey1;
  const isBench = size === 'bench';

  return (
    <View style={[styles.wrapper, isBench && styles.wrapperBench]}>
      <View style={[styles.shirtCircle, { backgroundColor: clubColor }, isBench && styles.shirtCircleBench]}>
        {(isCaptain || isViceCaptain) && (
          <View style={[styles.armband, isCaptain ? styles.captainBand : styles.viceBand]}>
            <Text style={styles.armbandText}>{isCaptain ? 'C' : 'VC'}</Text>
          </View>
        )}
        <Ionicons name="shirt" size={isBench ? 14 : 20} color={Colors.white} />
      </View>
      <Text style={[styles.name, isBench && styles.nameBench]} numberOfLines={1}>
        {player.name.split(' ').pop()}
      </Text>
      <View style={[styles.posTag, { backgroundColor: posColor }]}>
        <Text style={[styles.posText, isBench && styles.posTextBench]}>
          {player.position}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: 68,
  },
  wrapperBench: {
    width: 56,
    opacity: 0.65,
  },
  shirtCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  shirtCircleBench: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
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
    fontSize: 11,
    fontFamily: fonts.bodySemiBold,
    color: Colors.white,
    textAlign: 'center',
  },
  nameBench: {
    fontSize: 10,
  },
  posTag: {
    marginTop: 2,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
  },
  posText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: fonts.bodySemiBold,
    color: Colors.white,
  },
  posTextBench: {
    fontSize: 8,
  },
});
