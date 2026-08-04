import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
import { activateChip, cancelChip } from '../../services/fantasyService';
import { getApiErrorMessage } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import type { ChipType } from '../../types';

interface ChipCardProps {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  /** True once this chip has already been used this season - chips can't be undone once permanently spent. */
  used?: boolean;
  /**
   * True when a *different* chip is already active for the current
   * gameweek - only one chip can be played per gameweek, so this one is
   * temporarily unavailable even though it hasn't been used yet.
   */
  locked?: boolean;
  /** True when THIS chip is the one active for the current Gameweek. */
  active?: boolean;
  /**
   * True when `active` and this is a chip type + deadline situation that
   * allows cancelling it - Bench Boost/Triple Captain only, before the
   * Gameweek deadline, same rule the real FPL uses (Wildcard/Free Hit are
   * tied to a transfer transaction and can't be undone once confirmed).
   */
  cancellable?: boolean;
  chipType: ChipType;
  fantasyTeamId: number;
  gameweekId: number | null;
  onActivated?: () => void;
  onCancelled?: () => void;
}

export default function ChipCard({
  name, icon, used = false, locked = false, active = false, cancellable = false,
  chipType, fantasyTeamId, gameweekId, onActivated, onCancelled,
}: ChipCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [busy, setBusy] = useState(false);

  const handleActivate = async () => {
    setBusy(true);
    try {
      await activateChip(chipType, fantasyTeamId, gameweekId!);
      onActivated?.();
    } catch (err) {
      // Surface the real reason (e.g. "You have already used a chip for
      // this Gameweek") instead of silently doing nothing - previously this
      // swallowed every error, so a rejected activation looked identical to
      // a successful no-op.
      Alert.alert('Could not activate chip', getApiErrorMessage(err, 'Something went wrong. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      `Cancel ${name}?`,
      `This undoes ${name} for this Gameweek. You can play it again any time before the deadline.`,
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Cancel Chip',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await cancelChip(fantasyTeamId, gameweekId!);
              onCancelled?.();
            } catch (err) {
              Alert.alert('Could not cancel', getApiErrorMessage(err, 'Something went wrong. Please try again.'));
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  };

  const handlePress = () => {
    if (busy || !gameweekId) return;
    if (active) {
      if (cancellable) handleCancel();
      else Alert.alert(`${name} can't be cancelled`, 'This chip is locked in for this Gameweek and can\'t be undone once played.');
      return;
    }
    if (used || locked) return;
    handleActivate();
  };

  // Active-and-cancellable stays tappable (to cancel); active-but-not (used
  // Wildcard/Free Hit this GW) is tappable too, just to explain why via the
  // alert above - only genuinely unavailable states (used elsewhere/locked)
  // get visually and functionally disabled.
  const disabled = busy || !gameweekId || (!active && (used || locked));
  const pillLabel = active ? (cancellable ? 'Active' : 'Used') : used ? 'Used' : locked ? 'Locked' : 'Play';
  // Lock icon reads as "can't tap this" - reserve it for truly unavailable
  // states, not for an active chip you can still tap to cancel or inspect.
  const showLock = (used || locked) && !active && !busy;
  const iconColor = showLock ? colors.grey2 : active ? colors.win : colors.yellow;

  return (
    <TouchableOpacity
      style={[styles.card, disabled && styles.cardDisabled]}
      activeOpacity={0.7}
      onPress={handlePress}
      disabled={disabled}
    >
      <View style={[styles.iconWrap, showLock && styles.iconWrapLocked, active && styles.iconWrapActive]}>
        {busy ? (
          <ActivityIndicator size="small" color={colors.yellow} />
        ) : (
          <Ionicons name={showLock ? 'lock-closed-outline' : icon} size={20} color={iconColor} />
        )}
      </View>
      <Text style={[styles.name, showLock && styles.nameLocked]} numberOfLines={1}>{name}</Text>
      <View style={[
        styles.pill,
        pillLabel === 'Play' ? styles.pillAvailable : pillLabel === 'Active' ? styles.pillActive : styles.pillUnavailable,
      ]}>
        <Text style={[
          styles.pillText,
          pillLabel === 'Play' ? styles.pillTextAvailable : pillLabel === 'Active' ? styles.pillTextActive : styles.pillTextUnavailable,
        ]}>
          {pillLabel}
        </Text>
      </View>
      {cancellable ? <Text style={styles.cancelHint}>Tap to cancel</Text> : null}
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
    iconWrapActive: {
      backgroundColor: colors.win + '22',
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
    pillActive: {
      borderColor: colors.win,
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
    pillTextActive: {
      color: colors.win,
    },
    pillTextUnavailable: {
      color: colors.grey2,
    },
    cancelHint: {
      fontSize: 8,
      color: colors.grey2,
      marginTop: -2,
    },
  });
}
