import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface IconChipProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color?: string;
  size?: number;
}

export default function IconChip({ icon, label, color = Colors.yellow, size = 14 }: IconChipProps) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={size} color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
});
