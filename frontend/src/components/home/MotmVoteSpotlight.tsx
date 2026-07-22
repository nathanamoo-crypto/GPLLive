import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
import { Logos } from '../../constants/logos';
import { getMatches } from '../../services/matchService';
import { getMotmVotes } from '../../services/motmService';
import { useTheme } from '../../context/ThemeContext';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import type { Match } from '../../types';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

// How many of the most recently finished fixtures to check for an open MOTM
// vote. Voting closes 24h after kickoff (see backend MotmService), so this
// only ever needs to look back a handful of matches, not the whole history.
const CHECK_LIMIT = 6;

export default function MotmVoteSpotlight() {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      try {
        const finished = await getMatches(undefined, 'finished', controller.signal);
        // Most recently kicked-off first - the open voting window (if any)
        // will always be among the very latest results, not buried in
        // season history.
        const recent = [...finished]
          .sort((a, b) => new Date(b.kickoffTime).getTime() - new Date(a.kickoffTime).getTime())
          .slice(0, CHECK_LIMIT);

        for (const fixture of recent) {
          if (cancelled) return;
          try {
            const votes = await getMotmVotes(fixture.id, controller.signal);
            // Only spotlight it if voting is open AND this user hasn't
            // voted yet - once they've voted (or the window closes) there's
            // nothing actionable left for this widget to prompt them to do.
            if (votes.votingOpen && votes.myVotePlayerId == null) {
              if (!cancelled) setMatch(fixture);
              return;
            }
          } catch {
            // Skip this fixture and keep checking the next-most-recent one.
          }
        }
        if (!cancelled) setMatch(null);
      } catch {
        if (!cancelled) setMatch(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; controller.abort(); };
  }, []);

  // Nothing actionable right now - stay out of the way rather than showing
  // an empty/loading widget on every Home visit.
  if (loading || !match) return null;

  const homeBadge = Logos[match.homeClub.id];
  const awayBadge = Logos[match.awayClub.id];

  return (
    <TouchableOpacity
      style={styles.widget}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('MotmVote', { matchId: match.id })}
    >
      <View style={styles.titleRow}>
        <Ionicons name="star" size={16} color={colors.yellow} />
        <Text style={styles.widgetTitle}>Man of the Match</Text>
      </View>
      <Text style={styles.subtitle}>Voting is open - who was the standout player?</Text>

      <View style={styles.matchRow}>
        <View style={styles.clubBlock}>
          {homeBadge ? <Image source={homeBadge} style={styles.badge} resizeMode="contain" /> : null}
          <Text style={styles.clubName} numberOfLines={1}>{match.homeClub.shortName}</Text>
        </View>

        <View style={styles.scoreBlock}>
          <Text style={styles.score}>{match.homeScore} - {match.awayScore}</Text>
          <Text style={styles.ft}>FT</Text>
        </View>

        <View style={styles.clubBlock}>
          {awayBadge ? <Image source={awayBadge} style={styles.badge} resizeMode="contain" /> : null}
          <Text style={styles.clubName} numberOfLines={1}>{match.awayClub.shortName}</Text>
        </View>
      </View>

      <View style={styles.voteButton}>
        <Text style={styles.voteButtonText}>Vote Now</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textInverse} />
      </View>
    </TouchableOpacity>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    widget: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      marginBottom: 16,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    widgetTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
    subtitle: { fontSize: 13, color: colors.textSecondary, marginBottom: 14 },
    matchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    clubBlock: { flex: 1, alignItems: 'center', gap: 6 },
    badge: { width: 40, height: 40 },
    clubName: {
      fontSize: 12,
      fontFamily: fonts.bodySemiBold,
      color: colors.textPrimary,
      textAlign: 'center',
    },
    scoreBlock: { alignItems: 'center', paddingHorizontal: 12 },
    score: { fontSize: 18, fontWeight: '800', color: colors.white },
    ft: { fontSize: 10, color: colors.textTertiary, fontWeight: '700', marginTop: 2 },
    voteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      backgroundColor: colors.primary,
      borderRadius: radius.pill,
      paddingVertical: 12,
    },
    voteButtonText: { color: colors.textInverse, fontWeight: '700', fontSize: 14 },
  });
}
