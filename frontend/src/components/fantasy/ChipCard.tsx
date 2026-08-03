import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
import { activateChip } from '../../services/fantasyService';
import { getApiErrorMessage } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import type { ChipType } from '../../types';

interface ChipCardProps {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  /** True once this chip has already been used this season - chips can't be undone. */
  used?: boolean;
  /**
   * True when a *different* chip is already active for the current
   * gameweek - only one chip can be played per gameweek, so this one is
   * temporarily unavailable even though it hasn't been used yet.
   */
  locked?: boolean;
  chipType: ChipType;
  fantasyTeamId: number;
  gameweekId: number | null;
  onActivated?: () => void;
}

export default function ChipCard({ name, icon, used = false, locked = false, chipType, fantasyTeamId, gameweekId, onActivated }: ChipCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [activating, setActivating] = useState(false);

  const handlePress = async () => {
    if (used || locked || activating || !gameweekId) return;
    setActivating(true);
    try {
      await activateChip(chipType, fantasyTeamId, gameweekId);
      onActivated?.();
    } catch (err) {
      // Surface the real reason (e.g. "You have already used a chip for
      // this Gameweek") instead of silently doing nothing - previously this
      // swallowed every error, so a rejected activation looked identical to
      // a successful no-op.
      Alert.alert('Could not activate chip', getApiErrorMessage(err, 'Something went wrong. Please try again.'));
    } finally {
      setActivating(false);
    }
  };

  const disabled = used || locked || activating || !gameweekId;
  const pillLabel = used ? 'Used' : locked ? 'Locked' : 'Play';
  // Once a chip is used (permanently, for the season) or locked (a
  // different chip is already active this gameweek), swap in a lock icon
  // and gray it out so it visibly reads as "can't tap this" at a glance,
  // rather than just looking slightly dimmer than an active chip.
  const showLock = (used || locked) && !activating;
  const iconColor = showLock ? colors.grey2 : colors.yellow;

  return (
    <TouchableOpacity
      style={[styles.card, disabled && styles.cardDisabled]}
      activeOpacity={0.7}
      onPress={handlePress}
      disabled={disabled}
    >
      <View style={[styles.iconWrap, showLock && styles.iconWrapLocked]}>
        {activating ? (
          <ActivityIndicator size="small" color={colors.yellow} />
        ) : (
          <Ionicons name={showLock ? 'lock-closed-outline' : icon} size={20} color={iconColor} />
        )}
      </View>
      <Text style={[styles.name, showLock && styles.nameLocked]} numberOfLines={1}>{name}</Text>
      <View style={[styles.pill, pillLabel === 'Play' ? styles.pillAvailable : styles.pillUnavailable]}>
        <Text style={[styles.pillText, pillLabel === 'Play' ? styles.pillTextAvailable : styles.pillTextUnavailable]}>
          {pillLabel}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    cardDisabled: { opacity: 0.5 },
    card: {
      width: 80,
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 12,
      paddingHorizontal: 6,
      alignItems: 'center',
      gap: 6,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconWrapLocked: {
      backgroundColor: colors.border,
    },
    name: {
      fontSize: 10,
      fontFamily: fonts.bodySemiBold,
      color: colors.white,
      textAlign: 'center',
    },
    nameLocked: {
      color: colors.grey1,
    },
    pill: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: radius.pill,
      borderWidth: 1,
    },
    pillAvailable: {
      borderColor: colors.yellow,
    },
    pillUnavailable: {
      borderColor: colors.grey2,
    },
    pillText: {
      fontSize: 9,
      fontWeight: '700',
      fontFamily: fonts.bodySemiBold,
    },
    pillTextAvailable: {
      color: colors.yellow,
    },
    pillTextUnavailable: {
      color: colors.grey2,
    },
  });
}
