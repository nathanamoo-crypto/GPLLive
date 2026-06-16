import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';

import { Colors } from '../../constants/colors';
import { getScrollBottomPadding } from '../../constants/layout';
import type { Match, MatchEvent } from '../../types';
import { getMatchDetails, getMatchEvents } from '../../services/matchService';

/*
TEMP FIX: Service Layer Abstraction
This ensures the UI is ready for API integration.
TO REVERT: Direct import from constants or local mock arrays.
*/

/**
 * MOCK DATA SECTION
 * -----------------
 * This data will be replaced by an API call once the backend is ready.
 */
const MOCK_MATCH: Match = {
  id: 'match-1',
  homeClub: { id: 'kotoko', name: 'Asante Kotoko', shortName: 'Kotoko', badgeUrl: '', city: 'Kumasi' },
  awayClub: { id: 'hearts', name: 'Hearts of Oak', shortName: 'Hearts', badgeUrl: '', city: 'Accra' },
  homeScore: 2,
  awayScore: 1,
  status: 'live',
  kickoffTime: new Date().toISOString(),
  liveMinute: 67,
  venue: 'Baba Yara Stadium',
  round: 24,
  gameweek: 24,
};

const MOCK_EVENTS: MatchEvent[] = [
  { id: 'e1', matchId: 'match-1', type: 'goal', minute: 12, playerName: 'Frank Etouga', side: 'home' },
  { id: 'e2', matchId: 'match-1', type: 'yellow_card', minute: 34, playerName: 'Awako', side: 'away' },
  { id: 'e3', matchId: 'match-1', type: 'goal', minute: 45, playerName: 'Barnieh', side: 'away' },
  { id: 'e4', matchId: 'match-1', type: 'goal', minute: 58, playerName: 'Mbella', side: 'home' },
];

export default function MatchDetailsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  // @ts-ignore
  const { matchId } = route.params || {};

  const [activeTab, setActiveTab] = useState<'events' | 'lineups' | 'stats'>('events');

  /**
   * API INTEGRATION PLACEHOLDER
   * ---------------------------
   * TODO: Implement data fetching here.
   * useEffect(() => {
   *   fetchMatchDetails(matchId);
   * }, [matchId]);
   */

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
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
        {/* Match Scoreboard */}
        <View style={styles.scoreboard}>
          <View style={styles.teamContainer}>
            <View style={styles.badgePlaceholder} />
            <Text style={styles.teamName}>{MOCK_MATCH.homeClub.name}</Text>
          </View>

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>
              {MOCK_MATCH.homeScore} - {MOCK_MATCH.awayScore}
            </Text>
            {MOCK_MATCH.status === 'live' && (
              <View style={styles.liveBadge}>
                <Text style={styles.liveText}>{MOCK_MATCH.liveMinute}'</Text>
              </View>
            )}
          </View>

          <View style={styles.teamContainer}>
            <View style={styles.badgePlaceholder} />
            <Text style={styles.teamName}>{MOCK_MATCH.awayClub.name}</Text>
          </View>
        </View>

        <View style={styles.venueInfo}>
          <Text style={styles.venueText}>{MOCK_MATCH.venue}</Text>
          <Text style={styles.gameweekText}>Round {MOCK_MATCH.round}</Text>
        </View>

        {/* Tabs */}
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

        {/* Tab Content */}
        <View style={styles.content}>
          {activeTab === 'events' && (
            <View>
              {MOCK_EVENTS.map((event) => (
                <View key={event.id} style={styles.eventRow}>
                  <Text style={styles.eventMinute}>{event.minute}'</Text>
                  <View style={styles.eventIcon}>
                    <Ionicons
                      name={event.type === 'goal' ? 'football' : 'square'}
                      size={16}
                      color={event.type === 'goal' ? Colors.textPrimary : '#FFD700'}
                    />
                  </View>
                  <Text style={[styles.eventPlayer, { textAlign: event.side === 'home' ? 'left' : 'right', flex: 1 }]}>
                    {event.playerName}
                  </Text>
                </View>
              ))}
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
  badgePlaceholder: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.border, marginBottom: 8 },
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
});
