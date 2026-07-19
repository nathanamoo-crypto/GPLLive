import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors } from '../../constants/colors';
import { Logos } from '../../constants/logos';
import { getScrollBottomPadding } from '../../constants/layout';
import type { Match } from '../../types';
import { getMatchDetails } from '../../services/matchService';
import type { HomeStackParamList } from '../../navigation/HomeStack';

type MatchDetailsRouteProp = RouteProp<HomeStackParamList, 'MatchDetails'>;

export default function MatchDetailsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const route = useRoute<MatchDetailsRouteProp>();
  const { matchId } = route.params;

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'lineups' | 'stats'>('events');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getMatchDetails(matchId)
      .then((data) => {
        if (cancelled) return;
        setMatch(data);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setError(err?.message ?? 'Failed to load match details.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [matchId]);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Match Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (error || !match) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Match Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error ?? 'Match not found.'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Match Details</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: getScrollBottomPadding(insets.bottom) }}
      >
        <View style={styles.scoreboard}>
          <View style={styles.teamContainer}>
            <Image source={Logos[match.homeClub.id] as ImageSourcePropType} style={styles.badgeImage} resizeMode="contain" />
            <Text style={styles.teamName}>{match.homeClub.name}</Text>
          </View>

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>
              {match.homeScore ?? '-'} - {match.awayScore ?? '-'}
            </Text>
            {match.status === 'live' && (
              <View style={styles.liveBadge}>
                <Text style={styles.liveText}>{match.liveMinute ?? ''}'</Text>
              </View>
            )}
          </View>

          <View style={styles.teamContainer}>
            <Image source={Logos[match.awayClub.id] as ImageSourcePropType} style={styles.badgeImage} resizeMode="contain" />
            <Text style={styles.teamName}>{match.awayClub.name}</Text>
          </View>
        </View>

        <View style={styles.venueInfo}>
          <Text style={styles.venueText}>{match.venue}</Text>
          <Text style={styles.gameweekText}>Round {match.round}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('MotmVote', { matchId })}
          >
            <Ionicons name="trophy" size={18} color={Colors.yellow} />
            <Text style={styles.actionLabel}>Vote MOTM</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Discussion', { matchId })}
          >
            <Ionicons name="chatbubbles" size={18} color={Colors.yellow} />
            <Text style={styles.actionLabel}>Discussion</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          {(['events', 'lineups', 'stats'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.content}>
          {activeTab === 'events' && (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Match events will appear here.</Text>
            </View>
          )}

          {activeTab === 'lineups' && (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Lineups will be available 1 hour before kickoff.</Text>
            </View>
          )}

          {activeTab === 'stats' && (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Match statistics will update in real-time.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  scoreboard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  teamContainer: { alignItems: 'center', width: '35%' },
  badgeImage: { width: 64, height: 64, borderRadius: 32, marginBottom: 8 },
  teamName: { fontSize: 14, fontWeight: '700', textAlign: 'center', color: Colors.textPrimary },
  scoreContainer: { alignItems: 'center' },
  scoreText: { fontSize: 36, fontWeight: '800', color: Colors.textPrimary },
  liveBadge: {
    backgroundColor: Colors.live,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 8,
  },
  liveText: { color: Colors.textInverse, fontSize: 12, fontWeight: '700' },
  venueInfo: { padding: 16, alignItems: 'center' },
  venueText: { fontSize: 14, color: Colors.textSecondary },
  gameweekText: { fontSize: 12, color: Colors.textTertiary, marginTop: 4 },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  actionLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  tabBar: { flexDirection: 'row', backgroundColor: Colors.surface, paddingHorizontal: 16 },
  tabItem: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: Colors.primary },
  tabLabel: { fontSize: 12, fontWeight: '700', color: Colors.textTertiary },
  tabLabelActive: { color: Colors.primary },
  content: { padding: 16 },
  eventRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  eventMinute: { width: 40, fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  eventIcon: { width: 30, alignItems: 'center' },
  eventPlayer: { fontSize: 14, color: Colors.textPrimary },
  placeholderContainer: { paddingVertical: 40, alignItems: 'center' },
  placeholderText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: Colors.live, textAlign: 'center', paddingHorizontal: 32 },
});
