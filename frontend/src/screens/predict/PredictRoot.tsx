import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
import { usePredictionStore } from '../../store/predictionStore';
import { CLUB_COLORS, CLUB_LOOKUP } from '../../constants/clubs';
import type { LeaderboardEntry, Match } from '../../types';

/**
 * TODO: Replace with API call — see APIDocs.md → GET /predictions/fixtures
 */
const MOCK_FIXTURES: Match[] = [
  {
    id: 'f1',
    homeClub: CLUB_LOOKUP['kotoko'],
    awayClub: CLUB_LOOKUP['hearts'],
    status: 'scheduled',
    kickoffTime: new Date().toISOString(),
    venue: 'Baba Yara Stadium',
    round: 24,
    gameweek: 24,
    homeScore: null,
    awayScore: null,
  } as Match,
  {
    id: 'f2',
    homeClub: CLUB_LOOKUP['medeama'],
    awayClub: CLUB_LOOKUP['dreams'],
    status: 'scheduled',
    kickoffTime: new Date().toISOString(),
    venue: 'Tarkwa Stadium',
    round: 24,
    gameweek: 24,
    homeScore: null,
    awayScore: null,
  } as Match,
  {
    id: 'f3',
    homeClub: CLUB_LOOKUP['bibiani'],
    awayClub: CLUB_LOOKUP['rtu'],
    status: 'scheduled',
    kickoffTime: new Date().toISOString(),
    venue: 'Bibiani Park',
    round: 24,
    gameweek: 24,
    homeScore: null,
    awayScore: null,
  } as Match,
];

/**
 * TODO: Replace with API call — see APIDocs.md → GET /predictions/leaderboard
 */
const MOCK_PREDICT_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, rankChange: 2, userId: 'u1', username: 'PredictPro', club: CLUB_LOOKUP['kotoko'], totalPoints: 124, weekPoints: 18, isCurrentUser: false },
  { rank: 2, rankChange: -1, userId: 'u2', username: 'ScoreMaster', club: CLUB_LOOKUP['hearts'], totalPoints: 118, weekPoints: 14, isCurrentUser: false },
  { rank: 3, rankChange: 0, userId: 'u3', username: 'ExactGuess', club: CLUB_LOOKUP['medeama'], totalPoints: 112, weekPoints: 20, isCurrentUser: false },
  { rank: 4, rankChange: 4, userId: 'u4', username: 'OutcomeKing', club: CLUB_LOOKUP['dreams'], totalPoints: 98, weekPoints: 22, isCurrentUser: false },
  { rank: 42, rankChange: -3, userId: 'user-1', username: 'GPL Fan', club: CLUB_LOOKUP['kotoko'], totalPoints: 64, weekPoints: 10, isCurrentUser: true },
];

type PredictTab = 'predictions' | 'leaderboard';

export default function PredictRoot() {
  const insets = useSafeAreaInsets();
  const { predictions, setPrediction, setExactScore, submitAll } = usePredictionStore();
  const [activeTab, setActiveTab] = useState<PredictTab>('predictions');

  const handleScoreChange = (fixtureId: string, home: string, away: string) => {
    const h = parseInt(home) || 0;
    const a = parseInt(away) || 0;
    setExactScore(fixtureId, h, a);
  };

  /**
   * API INTEGRATION PLACEHOLDER
   * ---------------------------
   * TODO: Submit predictions to backend.
   */
  const handleSubmit = async () => {
    const count = Object.keys(predictions).length;
    if (count === 0) {
      Alert.alert('Error', 'Make at least one prediction before submitting.');
      return;
    }

    try {
      await submitAll(24);
      Alert.alert('Success', 'Your predictions have been locked in!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit predictions.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Predict & Win</Text>
        <Text style={styles.headerSubtitle}>Gameweek 24</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['predictions', 'leaderboard'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Ionicons
              name={tab === 'predictions' ? 'football-outline' : 'trophy-outline'}
              size={16}
              color={activeTab === tab ? Colors.textInverse : Colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'predictions' ? 'Predictions' : 'Leaderboard'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'predictions' ? (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.infoBox}>
              Predict the exact score for each match. 5 pts for exact score, 2 pts for correct outcome.
            </Text>

            {MOCK_FIXTURES.map((fixture) => {
              const prediction = predictions[fixture.id] || {};
              const isLocked = prediction.locked;

              return (
                <View key={fixture.id} style={styles.matchCard}>
                  <View style={styles.teamsRow}>
                    <View style={styles.teamInfo}>
                      <View style={[styles.clubDot, { backgroundColor: CLUB_COLORS[fixture.homeClub?.id] || Colors.primary }]} />
                      <Text style={styles.teamName}>{fixture.homeClub?.shortName ?? 'Home'}</Text>
                    </View>

                    <View style={styles.predictRow}>
                      <TextInput
                        style={[styles.scoreInput, isLocked && styles.disabledInput]}
                        keyboardType="numeric"
                        maxLength={1}
                        value={prediction.exactHomeGoals?.toString() ?? ''}
                        onChangeText={(val) => handleScoreChange(fixture.id, val, prediction.exactAwayGoals?.toString() ?? '0')}
                        editable={!isLocked}
                        placeholder="0"
                        placeholderTextColor={Colors.textTertiary}
                      />
                      <Text style={styles.vsText}>-</Text>
                      <TextInput
                        style={[styles.scoreInput, isLocked && styles.disabledInput]}
                        keyboardType="numeric"
                        maxLength={1}
                        value={prediction.exactAwayGoals?.toString() ?? ''}
                        onChangeText={(val) => handleScoreChange(fixture.id, prediction.exactHomeGoals?.toString() ?? '0', val)}
                        editable={!isLocked}
                        placeholder="0"
                        placeholderTextColor={Colors.textTertiary}
                      />
                    </View>

                    <View style={[styles.teamInfo, styles.teamInfoRight]}>
                      <Text style={styles.teamName}>{fixture.awayClub?.shortName ?? 'Away'}</Text>
                      <View style={[styles.clubDot, { backgroundColor: CLUB_COLORS[fixture.awayClub?.id] || Colors.textTertiary }]} />
                    </View>
                  </View>

                  <View style={styles.outcomeRow}>
                    {(['home', 'draw', 'away'] as const).map((outcome) => (
                      <TouchableOpacity
                        key={outcome}
                        style={[
                          styles.outcomeButton,
                          prediction.outcome === outcome && styles.outcomeButtonActive,
                          isLocked && styles.disabledButton,
                        ]}
                        onPress={() => !isLocked && setPrediction(fixture.id, outcome)}
                        disabled={isLocked}
                      >
                        <Text style={[styles.outcomeLabel, prediction.outcome === outcome && styles.outcomeLabelActive]}>
                          {outcome === 'home' ? 'Home Win' : outcome === 'draw' ? 'Draw' : 'Away Win'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit Predictions</Text>
          </TouchableOpacity>
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionLabel}>Prediction League Standings</Text>
          {MOCK_PREDICT_LEADERBOARD.map((entry) => {
            const initials = entry.club?.shortName?.slice(0, 2).toUpperCase() ?? '??';
            const rankColor =
              entry.rankChange > 0 ? Colors.win :
              entry.rankChange < 0 ? Colors.live :
              Colors.textTertiary;
            const rankIcon =
              entry.rankChange > 0 ? 'arrow-up' :
              entry.rankChange < 0 ? 'arrow-down' :
              'remove';

            return (
              <View key={entry.userId} style={[styles.leaderboardRow, entry.isCurrentUser && styles.leaderboardRowCurrent]}>
                <Text style={styles.leaderboardRank}>#{entry.rank}</Text>
                <View style={[styles.leaderboardAvatar, { backgroundColor: entry.club ? (CLUB_COLORS[entry.club.id] || Colors.primary) : Colors.primary }]}>
                  <Text style={styles.leaderboardAvatarText}>{initials}</Text>
                </View>
                <View style={styles.leaderboardInfo}>
                  <Text style={styles.leaderboardName}>{entry.username}</Text>
                  {entry.club && <Text style={styles.leaderboardClub}>{entry.club.shortName}</Text>}
                </View>
                <View style={styles.leaderboardPointsWrap}>
                  <Text style={styles.leaderboardPoints}>{entry.totalPoints}</Text>
                  <Text style={styles.leaderboardPointsLabel}>pts</Text>
                </View>
                <View style={[styles.leaderboardChange, { backgroundColor: rankColor + '20' }]}>
                  <Ionicons name={rankIcon as any} size={12} color={rankColor} />
                  <Text style={[styles.leaderboardChangeText, { color: rankColor }]}>{Math.abs(entry.rankChange)}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  header: { padding: 20, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 24, fontWeight: '800', fontFamily: fonts.display, color: Colors.white, textTransform: 'uppercase' },
  headerSubtitle: { fontSize: 16, color: Colors.yellow, fontWeight: '700', marginTop: 4 },
  content: { padding: 16, paddingBottom: 40 },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.button,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.yellow, borderColor: Colors.yellow },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.grey1 },
  tabTextActive: { color: '#000000', fontWeight: '700' },

  sectionLabel: { fontSize: 16, fontWeight: '700', color: Colors.white, marginBottom: 14 },
  infoBox: { backgroundColor: Colors.tagFE.bg, padding: 12, borderRadius: radius.card, color: Colors.yellow, fontSize: 13, fontWeight: '600', marginBottom: 20 },
  matchCard: {
    backgroundColor: Colors.surface,
    borderRadius: radius.card,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  teamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  teamInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  teamInfoRight: { justifyContent: 'flex-end' },
  clubDot: { width: 8, height: 8, borderRadius: 4 },
  teamName: { fontSize: 13, fontWeight: '600', color: Colors.white },
  predictRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  scoreInput: {
    width: 28,
    height: 28,
    backgroundColor: Colors.surface2,
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  vsText: { fontSize: 18, fontWeight: '800', color: Colors.grey2 },
  outcomeRow: { flexDirection: 'row', gap: 8 },
  outcomeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  outcomeButtonActive: { backgroundColor: Colors.yellow, borderColor: Colors.yellow },
  outcomeLabel: { fontSize: 12, fontWeight: '700', color: Colors.grey1 },
  outcomeLabelActive: { color: '#000000' },
  submitButton: {
    margin: 16,
    backgroundColor: Colors.red,
    padding: 18,
    borderRadius: radius.button,
    alignItems: 'center',
  },
  submitText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
    fontFamily: fonts.display,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
  },
  disabledInput: { backgroundColor: Colors.border, color: Colors.grey2 },
  disabledButton: { opacity: 0.6 },

  // Leaderboard
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: radius.card,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  leaderboardRowCurrent: { borderColor: Colors.yellow },
  leaderboardRank: { width: 36, fontSize: 13, fontWeight: '700', color: Colors.grey2 },
  leaderboardAvatar: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  leaderboardAvatarText: { fontSize: 12, fontWeight: '800', color: Colors.white },
  leaderboardInfo: { flex: 1 },
  leaderboardName: { fontSize: 14, fontWeight: '700', color: Colors.white },
  leaderboardClub: { fontSize: 11, color: Colors.grey2, marginTop: 1 },
  leaderboardPointsWrap: { alignItems: 'center' },
  leaderboardPoints: { fontSize: 16, fontWeight: '800', color: Colors.white },
  leaderboardPointsLabel: { fontSize: 9, color: Colors.grey2 },
  leaderboardChange: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  leaderboardChangeText: { fontSize: 11, fontWeight: '700' },
});
