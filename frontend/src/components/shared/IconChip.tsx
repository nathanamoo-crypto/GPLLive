import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';

interface IconChipProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color?: string;
  size?: number;
}

export default function IconChip({ icon, label, color, size = 14 }: IconChipProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const resolvedColor = color ?? colors.yellow;

  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={size} color={resolvedColor} />
      <Text style={[styles.label, { color: resolvedColor }]}>{label}</Text>
    </View>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: colors.surface2,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.white,
    },
  });
}
