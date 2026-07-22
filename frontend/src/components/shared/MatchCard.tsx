import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

import { Colors } from '../../constants/colors';
import { fonts } from '../../constants/layout';
import { Logos } from '../../constants/logos';
import { Match } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface MatchCardProps {
  match: Match;
  onPress?: () => void;
  testID?: string;
}

export default function MatchCard({ match, onPress, testID }: MatchCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const matchDate = new Date(match.kickoffTime);
  const timeStr = matchDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const statusColor =
    match.status === 'live'
      ? colors.red
      : match.status === 'finished'
        ? colors.grey2
        : colors.yellow;

  const statusText =
    match.status === 'live'
      ? 'LIVE'
      : match.status === 'finished'
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
            <Image source={Logos[match.homeClub.id]} style={styles.badgeImage} resizeMode="contain" />
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
            <Image source={Logos[match.awayClub.id]} style={styles.badgeImage} resizeMode="contain" />
          </View>
          <Text style={styles.clubName} numberOfLines={2}>
            {match.awayClub.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      width: 280,
    },
    statusChip: {
      alignSelf: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      marginBottom: 12,
    },
    statusText: {
      color: colors.white,
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
      backgroundColor: colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      overflow: 'hidden',
    },
    badgeImage: {
      width: 24,
      height: 24,
    },
    clubName: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.white,
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
      color: colors.white,
    },
    vs: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.grey1,
    },
  });
}
