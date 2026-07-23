import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { Player } from '../../types';

interface JerseyChipProps {
  player: Pick<Player, 'name' | 'clubId'>;
  color?: string;
  size?: 'sm' | 'md';
}

export default function JerseyChip({ player, color, size = 'sm' }: JerseyChipProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const resolvedColor = color ?? colors.yellow;
  const lastName = player.name.split(' ').pop() || player.name;
  return (
    <View style={[styles.chip, { backgroundColor: resolvedColor }, size === 'md' && styles.chipMd]}>
      <Text style={[styles.text, size === 'md' && styles.textMd]} numberOfLines={1}>
        {lastName}
      </Text>
    </View>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      minWidth: 50,
      alignItems: 'center',
    },
    chipMd: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 24,
    },
    text: {
      color: colors.white,
      fontSize: 11,
      fontWeight: '700',
    },
    textMd: {
      fontSize: 13,
    },
  });
}
