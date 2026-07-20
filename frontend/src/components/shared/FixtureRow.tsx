import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../../constants/colors';
import { fonts } from '../../constants/layout';
import { Match } from '../../types';
import { Logos } from '../../constants/logos';
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
  const isFT = match.status === 'finished';
  const hasScore = match.homeScore !== null && match.awayScore !== null;

  return (
    <TouchableOpacity
      style={[styles.row, isLive && styles.rowLive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.teamRow}>
        <View style={styles.teamWrap}>
          {Logos[match.homeClub.id] ? (
            <Image source={Logos[match.homeClub.id]} style={styles.badge} resizeMode="contain" />
          ) : (
            <View style={styles.badgePlaceholder} />
          )}
          <Text style={styles.teamName} numberOfLines={1}>{match.homeClub.shortName}</Text>
        </View>

        <View style={styles.scoreWrap}>
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
          {Logos[match.awayClub.id] ? (
            <Image source={Logos[match.awayClub.id]} style={styles.badge} resizeMode="contain" />
          ) : (
            <View style={styles.badgePlaceholder} />
          )}
        </View>
      </View>

      {!isLive && !isFT && (
        <View style={styles.timeRow}>
          <Badge label={timeStr} variant="upcoming" />
        </View>
      )}

      {isFT && (
        <View style={styles.timeRow}>
          <Badge label="FT" variant="ft" />
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
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowLive: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.red,
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
  teamName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
    flexShrink: 1,
  },
  badge: {
    width: 20,
    height: 20,
  },
  badgePlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.surface2,
  },
  scoreWrap: {
    alignItems: 'center',
    minWidth: 80,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  score: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: fonts.display,
    color: Colors.grey2,
  },
  scorePlayed: {
    color: Colors.white,
  },
  scoreSep: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.grey2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 6,
  },
  liveMinute: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.red,
  },
});
