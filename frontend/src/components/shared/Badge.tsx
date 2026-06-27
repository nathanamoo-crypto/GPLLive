import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface BadgeProps {
  label: string;
  variant?: 'status' | 'form' | 'live' | 'score';
  color?: string;
}

export default function Badge({ label, variant = 'status', color }: BadgeProps) {
  const bgColor =
    color ??
    (variant === 'live' ? Colors.live :
     variant === 'form' ? Colors.surfaceAlt :
     variant === 'score' ? Colors.primary :
     Colors.textTertiary);

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  text: {
    color: Colors.textInverse,
    fontSize: 11,
    fontWeight: '700',
  },
});
