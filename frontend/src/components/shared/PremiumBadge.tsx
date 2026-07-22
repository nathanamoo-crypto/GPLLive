import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { radius } from '../../constants/layout';
import { useTheme } from '../../context/ThemeContext';

const badgeImage = require('../../assets/badge/badge.jpeg');

interface PremiumBadgeProps {
  /** 'full' shows the badge image + "PREMIUM" text (profile header);
   *  'compact' shows just the badge image, sized to sit inline right after
   *  a username (comments, league tables, anywhere space is tight). */
  variant?: 'full' | 'compact';
}

// Single reusable badge so "Augustine [badge] PREMIUM" renders identically
// everywhere a premium user's name shows up - profile, comments, league
// tables. Renders nothing at all (not even a wrapper) when not premium, so
// callers can unconditionally render `{isPremium && <PremiumBadge/>}`
// without worrying about a stray empty element.
export default function PremiumBadge({ variant = 'compact' }: PremiumBadgeProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  if (variant === 'full') {
    return (
      <View style={styles.fullBadge}>
        <Image source={badgeImage} style={styles.fullBadgeImage} resizeMode="contain" />
        <Text style={styles.fullBadgeText}>PREMIUM</Text>
      </View>
    );
  }
  return (
    <View style={styles.compactBadge}>
      <Image source={badgeImage} style={styles.compactBadgeImage} resizeMode="contain" />
    </View>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    fullBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.yellow,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radius.pill,
      alignSelf: 'flex-start',
    },
    fullBadgeImage: { width: 14, height: 14 },
    fullBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.black,
      letterSpacing: 0.4,
    },
    compactBadge: { marginLeft: 4 },
    compactBadgeImage: { width: 16, height: 16 },
  });
}
