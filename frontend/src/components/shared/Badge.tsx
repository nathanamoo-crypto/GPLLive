import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';

interface BadgeProps {
  label: string;
  variant?: 'live' | 'current' | 'ft' | 'upcoming' | 'status' | 'form' | 'score';
  color?: string;
}

export default function Badge({ label, variant = 'status', color }: BadgeProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const bgColor =
    color ??
    (variant === 'live' || variant === 'current' ? colors.red :
     variant === 'ft' ? colors.surface2 :
     variant === 'upcoming' ? 'transparent' :
     variant === 'form' ? colors.surface2 :
     variant === 'score' ? colors.yellow :
     colors.grey2);

  const txtColor =
    variant === 'upcoming' ? colors.yellow :
    variant === 'ft' ? colors.grey2 :
    variant === 'status' ? colors.grey2 :
    colors.white;

  const isUpcoming = variant === 'upcoming';

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, isUpcoming && styles.badgeUpcoming]}>
      <Text style={[styles.text, { color: txtColor }, isUpcoming && styles.textUpcoming]}>{label}</Text>
    </View>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
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
      color: colors.white,
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
}
