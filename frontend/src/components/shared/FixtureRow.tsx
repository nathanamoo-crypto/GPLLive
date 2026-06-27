import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Match } from '../../types';
import Badge from './Badge';

interface FixtureRowProps {
  match: Match;
  onPress?: () => void;
}

export default function FixtureRow({ match, onPress }: FixtureRowProps) {
  const matchDate = new Date(match.kickoffTime);
  const timeStr = matchDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isLive = match.status === 'live';
  const isFT = match.status === 'ft';
  const hasScore = match.homeScore !== null && match.awayScore !== null;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.teamRow}>
        <View style={styles.teamWrap}>
          <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.teamName} numberOfLines={1}>{match.homeClub.shortName}</Text>
        </View>

        <View style={styles.scoreWrap}>
          {isLive && (
            <View style={styles.liveRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveLabel}>LIVE</Text>
            </View>
          )}
          {isFT && !hasScore ? (
            <Badge label="FT" variant="status" />
          ) : null}
          <View style={styles.scoreRow}>
            <Text style={[styles.score, (isLive || isFT) && styles.scorePlayed]}>
              {hasScore ? match.homeScore : '-'}
            </Text>
            <Text style={styles.scoreSep}>:</Text>
            <Text style={[styles.score, (isLive || isFT) && styles.scorePlayed]}>
              {hasScore ? match.awayScore : '-'}
            </Text>
          </View>
        </View>

        <View style={[styles.teamWrap, styles.teamWrapRight]}>
          <Text style={styles.teamName} numberOfLines={1}>{match.awayClub.shortName}</Text>
          <View style={[styles.dot, { backgroundColor: Colors.textTertiary }]} />
        </View>
      </View>

      {!isLive && !isFT && (
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={12} color={Colors.textTertiary} />
          <Text style={styles.timeText}>{timeStr}</Text>
        </View>
      )}

      {isLive && match.liveMinute && (
        <View style={styles.timeRow}>
          <Text style={styles.liveMinute}>{match.liveMinute}'</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamWrapRight: {
    justifyContent: 'flex-end',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scoreWrap: {
    alignItems: 'center',
    minWidth: 80,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.live,
  },
  liveLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.live,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  score: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textTertiary,
  },
  scorePlayed: {
    color: Colors.textPrimary,
  },
  scoreSep: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
  },
  timeText: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  liveMinute: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.live,
  },
});
