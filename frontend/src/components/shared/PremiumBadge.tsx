import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { radius } from '../../constants/layout';

interface PremiumBadgeProps {
  /** 'full' shows "👑 PREMIUM" (profile header); 'compact' shows just the
   *  crown, sized to sit inline right after a username (comments, league
   *  tables, anywhere space is tight). */
  variant?: 'full' | 'compact';
}

// Single reusable badge so "Augustine 👑 PREMIUM" (per the spec) renders
// identically everywhere a premium user's name shows up - profile, comments,
// league tables. Renders nothing at all (not even a wrapper) when not
// premium, so callers can unconditionally render `{isPremium && <PremiumBadge/>}`
// without worrying about a stray empty element.
export default function PremiumBadge({ variant = 'compact' }: PremiumBadgeProps) {
  if (variant === 'full') {
    return (
      <View style={styles.fullBadge}>
        <Text style={styles.fullBadgeText}>👑 PREMIUM</Text>
      </View>
    );
  }
  return (
    <View style={styles.compactBadge}>
      <Text style={styles.compactBadgeText}>👑</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fullBadge: {
    backgroundColor: Colors.yellow,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  fullBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.black,
    letterSpacing: 0.4,
  },
  compactBadge: { marginLeft: 4 },
  compactBadgeText: { fontSize: 12 },
});
