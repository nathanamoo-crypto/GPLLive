import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { Colors } from '../../constants/colors';
import { fonts } from '../../constants/layout';
import { Match } from '../../types';

interface MatchCardProps {
  match: Match;
  onPress?: () => void;
  testID?: string;
}

export default function MatchCard({ match, onPress, testID }: MatchCardProps) {
  const matchDate = new Date(match.kickoffTime);
  const timeStr = matchDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const statusColor =
    match.status === 'live'
      ? Colors.red
      : match.status === 'ft'
        ? Colors.grey2
        : Colors.yellow;

  const statusText =
    match.status === 'live'
      ? 'LIVE'
      : match.status === 'ft'
        ? 'FT'
        : timeStr;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}
    >
      <View style={[styles.statusChip, { backgroundColor: statusColor }]}>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.clubBlock}>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>{match.homeClub.shortName.slice(0, 2)}</Text>
          </View>
          <Text style={styles.clubName} numberOfLines={2}>
            {match.homeClub.name}
          </Text>
        </View>

        <View style={styles.scoreBlock}>
          {match.homeScore !== null && match.awayScore !== null ? (
            <Text style={styles.score}>
              {match.homeScore} - {match.awayScore}
            </Text>
          ) : (
            <Text style={styles.vs}>vs</Text>
          )}
        </View>

        <View style={styles.clubBlock}>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>{match.awayClub.shortName.slice(0, 2)}</Text>
          </View>
          <Text style={styles.clubName} numberOfLines={2}>
            {match.awayClub.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    width: 280,
  },
  statusChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 12,
  },
  statusText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clubBlock: {
    flex: 1,
    alignItems: 'center',
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeLabel: {
    color: Colors.yellow,
    fontSize: 11,
    fontWeight: '800',
  },
  clubName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
  },
  scoreBlock: {
    paddingHorizontal: 8,
    minWidth: 56,
    alignItems: 'center',
  },
  score: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: fonts.display,
    color: Colors.white,
  },
  vs: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.grey1,
  },
});
