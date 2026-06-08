import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Colors } from '../../constants/colors';
import { DUMMY_LEADERBOARD } from '../../constants/homeDummyData';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function PredictionLeaderboardTeaser() {
  return (
    <View style={styles.widget}>
      <Text style={styles.widgetTitle}>Prediction Leaderboard</Text>
      <Text style={styles.subtitle}>This week&apos;s top predictors</Text>
      {DUMMY_LEADERBOARD.map((entry) => (
        <View key={entry.userId} style={styles.row}>
          <Text style={styles.medal}>{MEDALS[entry.rank - 1] ?? `#${entry.rank}`}</Text>
          <Text style={styles.username}>{entry.username}</Text>
          <Text style={styles.points}>{entry.weekPoints} pts</Text>
        </View>
      ))}
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
  widgetTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  medal: { width: 32, fontSize: 18 },
  username: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '600' },
  points: { fontSize: 14, fontWeight: '700', color: Colors.win },
});
