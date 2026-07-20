import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
import { activateChip } from '../../services/fantasyService';
import type { ChipType } from '../../types';

interface ChipCardProps {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  /** True once this chip has already been used this season - chips can't be undone. */
  used?: boolean;
  chipType: ChipType;
  fantasyTeamId: number;
  gameweekId: number | null;
  onActivated?: () => void;
}

export default function ChipCard({ name, icon, used = false, chipType, fantasyTeamId, gameweekId, onActivated }: ChipCardProps) {
  const [activating, setActivating] = useState(false);

  const handlePress = async () => {
    if (used || activating || !gameweekId) return;
    setActivating(true);
    try {
      await activateChip(chipType, fantasyTeamId, gameweekId);
      onActivated?.();
    } catch {
      // chip activation failed - leave the card in its current state so the
      // user can retry rather than showing a false "used" state
    } finally {
      setActivating(false);
    }
  };

  const disabled = used || activating || !gameweekId;

  return (
    <TouchableOpacity
      style={[styles.card, disabled && styles.cardDisabled]}
      activeOpacity={0.7}
      onPress={handlePress}
      disabled={disabled}
    >
      <View style={styles.iconWrap}>
        {activating ? (
          <ActivityIndicator size="small" color={Colors.yellow} />
        ) : (
          <Ionicons name={icon} size={20} color={Colors.yellow} />
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>{name}</Text>
      <View style={[styles.pill, !used ? styles.pillAvailable : styles.pillUnavailable]}>
        <Text style={[styles.pillText, !used ? styles.pillTextAvailable : styles.pillTextUnavailable]}>
          {used ? 'Used' : 'Play'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardDisabled: { opacity: 0.5 },
  card: {
    width: 80,
    backgroundColor: Colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 6,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 10,
    fontFamily: fonts.bodySemiBold,
    color: Colors.white,
    textAlign: 'center',
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  pillAvailable: {
    borderColor: Colors.yellow,
  },
  pillUnavailable: {
    borderColor: Colors.grey2,
  },
  pillText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: fonts.bodySemiBold,
  },
  pillTextAvailable: {
    color: Colors.yellow,
  },
  pillTextUnavailable: {
    color: Colors.grey2,
  },
});
