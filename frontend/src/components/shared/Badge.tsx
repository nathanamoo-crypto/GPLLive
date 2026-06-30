import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface BadgeProps {
  label: string;
  variant?: 'live' | 'current' | 'ft' | 'upcoming' | 'status' | 'form' | 'score';
  color?: string;
}

export default function Badge({ label, variant = 'status', color }: BadgeProps) {
  const bgColor =
    color ??
    (variant === 'live' || variant === 'current' ? Colors.red :
     variant === 'ft' ? Colors.surface2 :
     variant === 'upcoming' ? 'transparent' :
     variant === 'form' ? Colors.surface2 :
     variant === 'score' ? Colors.yellow :
     Colors.grey2);

  const txtColor =
    variant === 'upcoming' ? Colors.yellow :
    variant === 'ft' ? Colors.grey2 :
    variant === 'status' ? Colors.grey2 :
    Colors.white;

  const isUpcoming = variant === 'upcoming';

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, isUpcoming && styles.badgeUpcoming]}>
      <Text style={[styles.text, { color: txtColor }, isUpcoming && styles.textUpcoming]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeUpcoming: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.08,
  },
  textUpcoming: {
    fontSize: 12,
    fontWeight: '700',
  },
});
