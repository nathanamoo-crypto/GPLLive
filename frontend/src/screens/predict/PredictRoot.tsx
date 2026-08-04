import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors } from '../../constants/colors';
import { streakMultiplier } from '../../utils/predictionScoring';
import { usePredictionStore } from '../../store/predictionStore';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../context/ThemeContext';
import { getCurrentGameweek } from '../../services/fantasyService';
import { getMatches } from '../../services/matchService';
import { getPredictionLeaderboard } from '../../services/predictionService';
import type { GamesStackParamList } from '../../navigation/GamesStack';
import type { Match, PredictionLeaderboardEntry } from '../../types';

type NavProp = NativeStackNavigationProp<GamesStackParamList>;

const RULES = [
  '7 pts — exact scoreline',
  '4 pts — correct outcome + goal difference (e.g. picked 2–1, actual 3–2)',
  '2 pts — correct outcome only',
  '0 pts — wrong outcome',
  "⚡ Banker pick doubles that fixture's points (win or lose)",
  '🔥 3+ correct outcomes in a row = 1.25x points (1.5x from 6)',
  '⏰ Submitted 24h+ before kickoff earns +1',
];

function isFixtureLocked(match: Match, backendLocked: boolean | undefined): boolean {
  if (backendLocked) return true;
  if (match.status !== 'scheduled') return true;
  const kickoff = Date.parse(match.kickoffTime);
  return !Number.isNaN(kickoff) && kickoff <= Date.now();
}

export default function PredictRoot() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const navigation = useNavigation<NavProp>();
  const username = useAuthStore((state) => state.user?.username);
  const {
    predictions, loading, loadPredictions, setExactScore, setBanker, submitPrediction,
  } = usePredictionStore();

  const [fixtures, setFixtures] = useState<Match[]>([]);
  const [gameweekNumber, setGameweekNumber] = useState<number | null>(null);
  const [fixturesLoading, setFixturesLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingFixtureId, setSavingFixtureId] = useState<number | null>(null);
  const [rowError, setRowError] = useState<Record<number, string>>({});
  const [leaderboard, setLeaderboard] = useState<PredictionLeaderboardEntry[]>([]);

  const loadEverything = useCallback(async () => {
    setFixturesLoading(true);
    setLoadError(null);
    try {
      const gameweek = await getCurrentGameweek();
      if (!gameweek) {
        setFixtures([]);
        setGameweekNumber(null);
        return;
      }
      setGameweekNumber(gameweek.gameweekNumber);

      const [matches] = await Promise.all([
        getMatches(gameweek.gameweekId),
        loadPredictions(gameweek.gameweekId),
      ]);
      setFixtures(matches);

      getPredictionLeaderboard().then(setLeaderboard).catch(() => {});
    } catch (error: any) {
      setLoadError(error?.message ?? 'Failed to load fixtures.');
    } finally {
      setFixturesLoading(false);
    }
  }, [loadPredictions]);

  useEffect(() => {
    loadEverything();
  }, [loadEverything]);

  const handleScoreChange = (fixtureId: number, home: string, away: string) => {
    const h = parseInt(home, 10);
    const a = parseInt(away, 10);
    setExactScore(fixtureId, Number.isNaN(h) ? 0 : h, Number.isNaN(a) ? 0 : a);
  };

  const handleSave = async (fixtureId: number) => {
    setSavingFixtureId(fixtureId);
    setRowError((prev) => ({ ...prev, [fixtureId]: '' }));
    try {
      await submitPrediction(fixtureId);
    } catch (error: any) {
      setRowError((prev) => ({ ...prev, [fixtureId]: error?.message ?? 'Failed to save pick.' }));
    } finally {
      setSavingFixtureId(null);
    }
  };

  const myEntry = leaderboard.find((entry) => entry.username === username);
  const streak = myEntry?.predictionStreak ?? 0;
  const stage = streakMultiplier(streak);
  const streakBoostActive = stage > 1;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Predict & Win</Text>
        <Text style={styles.headerSubtitle}>
          {gameweekNumber != null ? `Gameweek ${gameweekNumber}` : 'No active gameweek'}
        </Text>
      </View>

      <View style={styles.streakBanner}>
        <Ionicons
          name={streakBoostActive ? 'flame' : 'flame-outline'}
          size={18}
          color={streakBoostActive ? colors.primary : colors.textTertiary}
        />
        <Text style={[styles.streakText, streakBoostActive && styles.streakTextActive]}>
          {streakBoostActive
            ? `${streak}-game correct streak — ${stage}x points active`
            : streak > 0
              ? `${streak} correct in a row — hit 3 to unlock a bonus multiplier`
              : 'No active streak — hit 3 correct in a row to unlock a 1.25x multiplier'}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={fixturesLoading} onRefresh={loadEverything} tintColor={colors.primary} />}
      >
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How scoring works</Text>
          {RULES.map((rule) => (
            <Text key={rule} style={styles.infoLine}>
              {'• '}
              {rule}
            </Text>
          ))}
        </View>

        {myEntry ? (
          <View style={styles.myStatsRow}>
            <View style={styles.myStatBox}>
              <Text style={styles.myStatValue}>{myEntry.predictionPoints}</Text>
              <Text style={styles.myStatLabel}>Your points</Text>
            </View>
            <View style={styles.myStatBox}>
              <Text style={styles.myStatValue}>#{myEntry.rank}</Text>
              <Text style={styles.myStatLabel}>Leaderboard rank</Text>
            </View>
            <View style={styles.myStatBox}>
              <Text style={styles.myStatValue}>{myEntry.predictionStreak}</Text>
              <Text style={styles.myStatLabel}>Current streak</Text>
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.leaderboardLink}
          onPress={() => navigation.navigate('PredictionLeaderboard')}
        >
          <Ionicons name="trophy-outline" size={16} color={colors.primary} />
          <Text style={styles.leaderboardLinkText}>View full leaderboard</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>

        {loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}

        {fixturesLoading && fixtures.length === 0 ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        ) : null}

        {!fixturesLoading && fixtures.length === 0 && !loadError ? (
          <Text style={styles.infoLine}>No fixtures scheduled for the current gameweek yet.</Text>
        ) : null}

        {fixtures.map((fixture) => {
          const prediction = predictions[String(fixture.id)] || {};
          const locked = isFixtureLocked(fixture, prediction.locked);
          const isDirty = prediction.exactHomeGoals != null && prediction.exactAwayGoals != null;
          const saving = savingFixtureId === fixture.id;

          return (
            <View key={fixture.id} style={[styles.matchCard, prediction.isBanker && styles.matchCardBanker]}>
              <View style={styles.cardTopRow}>
                <View style={styles.placeholderBadge} />

                <TouchableOpacity
                  style={[styles.bankerButton, prediction.isBanker && styles.bankerButtonActive, locked && styles.disabledButton]}
                  onPress={() => !locked && setBanker(fixture.id)}
                  disabled={locked}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={prediction.isBanker ? 'star' : 'star-outline'}
                    size={16}
                    color={prediction.isBanker ? colors.textInverse : colors.primary}
                  />
                  <Text style={[styles.bankerLabel, prediction.isBanker && styles.bankerLabelActive]}>
                    {prediction.isBanker ? 'Your Banker' : 'Banker'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.teamsRow}>
                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>{fixture.homeClub.shortName}</Text>
                </View>

                <View style={styles.predictRow}>
                  <TextInput
                    style={[styles.scoreInput, locked && styles.disabledInput]}
                    keyboardType="numeric"
                    maxLength={2}
                    selectTextOnFocus
                    value={prediction.exactHomeGoals?.toString() ?? ''}
                    onChangeText={(val) => handleScoreChange(fixture.id, val, prediction.exactAwayGoals?.toString() ?? '0')}
                    editable={!locked}
                    placeholder="0"
                  />
                  <Text style={styles.vsText}>-</Text>
                  <TextInput
                    style={[styles.scoreInput, locked && styles.disabledInput]}
                    keyboardType="numeric"
                    maxLength={2}
                    selectTextOnFocus
                    value={prediction.exactAwayGoals?.toString() ?? ''}
                    onChangeText={(val) => handleScoreChange(fixture.id, prediction.exactHomeGoals?.toString() ?? '0', val)}
                    editable={!locked}
                    placeholder="0"
                  />
                </View>

                <View style={[styles.teamInfo, { alignItems: 'flex-end' }]}>
                  <Text style={styles.teamName}>{fixture.awayClub.shortName}</Text>
                </View>
              </View>

              <View style={styles.outcomeReadout}>
                <Text style={styles.outcomeReadoutText}>
                  {prediction.outcome === 'home'
                    ? `${fixture.homeClub.shortName} to win`
                    : prediction.outcome === 'away'
                      ? `${fixture.awayClub.shortName} to win`
                      : prediction.outcome === 'draw'
                        ? 'Draw'
                        : 'Enter a scoreline to set your pick'}
                </Text>
              </View>

              <View style={styles.footerRow}>
                {locked ? (
                  <View style={styles.lockedTag}>
                    <Ionicons name="lock-closed-outline" size={14} color={colors.textTertiary} />
                    <Text style={styles.lockedText}>
                      {prediction.scored && prediction.pointsEarned != null
                        ? `+${prediction.pointsEarned} pts`
                        : 'Locked'}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.saveButton, !isDirty && styles.saveButtonDisabled]}
                    onPress={() => handleSave(fixture.id)}
                    disabled={!isDirty || saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color={colors.textInverse} />
                    ) : (
                      <Text style={styles.saveButtonText}>{prediction.submitted ? 'Update Pick' : 'Save Pick'}</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {rowError[fixture.id] ? <Text style={styles.errorText}>{rowError[fixture.id]}</Text> : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { padding: 20, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
    headerTitle: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },
    headerSubtitle: { fontSize: 16, color: colors.primary, fontWeight: '700', marginTop: 4 },
    streakBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.surface,
    },
    streakText: { flex: 1, fontSize: 12, fontWeight: '700', color: colors.textSecondary },
    streakTextActive: { color: colors.primary },
    content: { padding: 16 },
    infoBox: { backgroundColor: colors.tagFE.bg, padding: 14, borderRadius: 12, marginBottom: 20 },
    infoTitle: { fontSize: 13, fontWeight: '800', color: colors.primary, marginBottom: 6 },
    infoLine: { fontSize: 12.5, fontWeight: '600', color: colors.textSecondary, marginBottom: 3, lineHeight: 18 },
    myStatsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    myStatBox: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    myStatValue: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
    myStatLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
    leaderboardLink: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      marginBottom: 20,
    },
    leaderboardLinkText: { fontSize: 13, fontWeight: '700', color: colors.primary },
    matchCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    matchCardBanker: { borderColor: colors.primary, borderWidth: 1.5 },
    cardTopRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 16 },
    placeholderBadge: { flex: 1 },
    bankerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    bankerButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    bankerLabel: { fontSize: 11, fontWeight: '800', color: colors.primary },
    bankerLabelActive: { color: colors.textInverse },
    teamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    teamInfo: { flex: 1 },
    teamName: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
    predictRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    scoreInput: {
      width: 40,
      height: 45,
      backgroundColor: colors.background,
      borderRadius: 8,
      textAlign: 'center',
      fontSize: 20,
      fontWeight: '800',
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    vsText: { fontSize: 18, fontWeight: '800', color: colors.textTertiary },
    outcomeReadout: { alignItems: 'center', marginBottom: 12 },
    outcomeReadoutText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
    footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
    saveButton: { backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, minWidth: 100, alignItems: 'center' },
    saveButtonDisabled: { opacity: 0.4 },
    saveButtonText: { color: colors.textInverse, fontSize: 12, fontWeight: '800' },
    lockedTag: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    lockedText: { fontSize: 12, fontWeight: '700', color: colors.textTertiary },
    errorText: { marginTop: 8, color: colors.live, fontSize: 12 },
    disabledInput: { backgroundColor: colors.border, color: colors.textTertiary },
    disabledButton: { opacity: 0.6 },
  });
}
