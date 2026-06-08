import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Colors } from '../../constants/colors';
import { DUMMY_FANTASY } from '../../constants/homeDummyData';

export default function FantasySnapshotWidget() {
  return (
    <View style={styles.widget}>
      <Text style={styles.widgetTitle}>Fantasy Snapshot</Text>
      {DUMMY_FANTASY.hasSquad ? (
        <>
          <Text style={styles.teamName}>{DUMMY_FANTASY.teamName}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>This GW</Text>
              <Text style={styles.statValue}>{DUMMY_FANTASY.weekPoints}</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Overall Rank</Text>
              <Text style={styles.statValue}>#{DUMMY_FANTASY.overallRank}</Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.cta}>
          <Text style={styles.ctaText}>Create your fantasy team</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  widget: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  widgetTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  teamName: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBlock: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
  },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  cta: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: { color: Colors.textInverse, fontWeight: '700' },
});
