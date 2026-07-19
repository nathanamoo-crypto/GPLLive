import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
import { activateChip, deactivateChip } from '../../services/fantasyService';
import type { ChipType } from '../../types';

interface ChipCardProps {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  available?: boolean;
  chipType?: ChipType;
}

export default function ChipCard({ name, icon, available = false, chipType }: ChipCardProps) {
  const [toggling, setToggling] = useState(false);

  const handlePress = async () => {
    if (!chipType || toggling) return;
    setToggling(true);
    try {
      if (available) {
        await deactivateChip(chipType);
      } else {
        await activateChip(chipType);
      }
    } catch {
      // chip toggle failed silently
    } finally {
      setToggling(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, toggling && styles.cardDisabled]}
      activeOpacity={0.7}
      onPress={handlePress}
      disabled={toggling}
    >
      <View style={styles.iconWrap}>
        {toggling ? (
          <ActivityIndicator size="small" color={Colors.yellow} />
        ) : (
          <Ionicons name={icon} size={20} color={Colors.yellow} />
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>{name}</Text>
      <View style={[styles.pill, available ? styles.pillAvailable : styles.pillUnavailable]}>
        <Text style={[styles.pillText, available ? styles.pillTextAvailable : styles.pillTextUnavailable]}>
          {available ? 'Play' : 'Unavailable'}
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
