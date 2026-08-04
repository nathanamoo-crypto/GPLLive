import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface PriceChangeIndicatorProps {
  /** In millions, same unit as Player.price. Positive = risen, negative = dropped. */
  priceChange?: number | null;
  size?: number;
  /** Show the actual delta (e.g. "0.1m") next to the arrow, not just the arrow. */
  showValue?: boolean;
}

// Small green-up/red-down arrow for a player's price movement since the
// admin's last price update. Renders nothing for null/undefined/0 (no prior
// price to compare against, or price hasn't moved) rather than an empty/
// neutral icon, so it only ever draws attention when there's something to see.
export default function PriceChangeIndicator({ priceChange, size = 12, showValue = false }: PriceChangeIndicatorProps) {
  const { colors } = useTheme();

  if (!priceChange) return null;

  const isUp = priceChange > 0;
  const color = isUp ? colors.green : colors.red;

  return (
    <View style={styles.row}>
      <Ionicons name={isUp ? 'caret-up' : 'caret-down'} size={size} color={color} />
      {showValue && (
        <Text style={[styles.text, { color, fontSize: size - 2 }]}>
          {Math.abs(priceChange).toFixed(1)}m
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  text: {
    fontWeight: '700',
  },
});
