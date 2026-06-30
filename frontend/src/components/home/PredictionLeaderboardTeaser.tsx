import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
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
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 16,
  },
  widgetTitle: { fontSize: 16, fontFamily: fonts.bodyBold, color: Colors.white, marginBottom: 4 },
  subtitle: { fontSize: 13, fontFamily: fonts.body, color: Colors.grey1, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  medal: { width: 32, fontSize: 18 },
  username: { flex: 1, fontSize: 14, fontFamily: fonts.body, color: Colors.white },
  points: { fontSize: 14, fontFamily: fonts.bodyBold, color: Colors.yellow },
});
