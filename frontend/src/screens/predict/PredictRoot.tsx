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

import { Colors } from '../../constants/colors';
import { usePredictionStore } from '../../store/predictionStore';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../context/ThemeContext';
import { getCurrentGameweek } from '../../services/fantasyService';
import { getMatches } from '../../services/matchService';
import { getPredictionLeaderboard } from '../../services/predictionService';
import type { Match, PredictionLeaderboardEntry } from '../../types';

function isFixtureLocked(match: Match, backendLocked: boolean | undefined): boolean {
  if (backendLocked) return true;
  if (match.status !== 'scheduled') return true;
  const kickoff = Date.parse(match.kickoffTime);
  return !Number.isNaN(kickoff) && kickoff <= Date.now();
}

export default function PredictRoot() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const username = useAuthStore((state) => state.user?.username);
  const {
    predictions, loading, loadPredictions, setPrediction, setExactScore, setBanker, submitPrediction,
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Predict & Win</Text>
        <Text style={styles.headerSubtitle}>
          {gameweekNumber != null ? `Gameweek ${gameweekNumber}` : 'No active gameweek'}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={fixturesLoading} onRefresh={loadEverything} tintColor={colors.primary} />}
      >
        <Text style={styles.infoBox}>
          7 pts exact score · 4 pts correct outcome + goal difference · 2 pts correct outcome.{'\n'}
          Banker doubles a fixture's points. Derby fixtures (🔥) carry a +2 bonus. 3+ correct in a row earns a
          streak multiplier, and picks in 24h+ before kickoff earn +1.
        </Text>

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

        {loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}

        {fixturesLoading && fixtures.length === 0 ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        ) : null}

        {!fixturesLoading && fixtures.length === 0 && !loadError ? (
          <Text style={styles.infoBox}>No fixtures scheduled for the current gameweek yet.</Text>
        ) : null}

        {fixtures.map((fixture) => {
          const prediction = predictions[String(fixture.id)] || {};
          const locked = isFixtureLocked(fixture, prediction.locked);
          const isDirty = prediction.outcome != null && prediction.exactHomeGoals != null && prediction.exactAwayGoals != null;
          const saving = savingFixtureId === fixture.id;

          return (
            <View key={fixture.id} style={styles.matchCard}>
              {fixture.isDerby ? (
                <View style={styles.derbyBadge}>
                  <Text style={styles.derbyBadgeText}>🔥 Derby +2</Text>
                </View>
              ) : null}

              <View style={styles.teamsRow}>
                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>{fixture.homeClub.shortName}</Text>
                </View>

                <View style={styles.predictRow}>
                  <TextInput
                    style={[styles.scoreInput, locked && styles.disabledInput]}
                    keyboardType="numeric"
                    maxLength={1}
                    value={prediction.exactHomeGoals?.toString() ?? ''}
                    onChangeText={(val) => handleScoreChange(fixture.id, val, prediction.exactAwayGoals?.toString() ?? '0')}
                    editable={!locked}
                    placeholder="0"
                  />
                  <Text style={styles.vsText}>-</Text>
                  <TextInput
                    style={[styles.scoreInput, locked && styles.disabledInput]}
                    keyboardType="numeric"
                    maxLength={1}
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

              <View style={styles.outcomeRow}>
                {(['home', 'draw', 'away'] as const).map((outcome) => (
                  <TouchableOpacity
                    key={outcome}
                    style={[
                      styles.outcomeButton,
                      prediction.outcome === outcome && styles.outcomeButtonActive,
                      locked && styles.disabledButton,
                    ]}
                    onPress={() => !locked && setPrediction(fixture.id, outcome)}
                    disabled={locked}
                  >
                    <Text style={[styles.outcomeLabel, prediction.outcome === outcome && styles.outcomeLabelActive]}>
                      {outcome === 'home' ? 'Home Win' : outcome === 'draw' ? 'Draw' : 'Away Win'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.footerRow}>
                <TouchableOpacity
                  style={[styles.bankerButton, prediction.isBanker && styles.bankerButtonActive, locked && styles.disabledButton]}
                  onPress={() => !locked && setBanker(fixture.id)}
                  disabled={locked}
                >
                  <Ionicons
                    name={prediction.isBanker ? 'star' : 'star-outline'}
                    size={14}
                    color={prediction.isBanker ? colors.textInverse : colors.textSecondary}
                  />
                  <Text style={[styles.bankerLabel, prediction.isBanker && styles.bankerLabelActive]}>Banker</Text>
                </TouchableOpacity>

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
    content: { padding: 16 },
    infoBox: { backgroundColor: colors.tagFE.bg, padding: 12, borderRadius: 12, color: colors.primary, fontSize: 12, fontWeight: '600', marginBottom: 16, lineHeight: 18 },
    myStatsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    myStatBox: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    myStatValue: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
    myStatLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
    matchCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
    derbyBadge: { alignSelf: 'flex-start', backgroundColor: colors.tagFE.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 10 },
    derbyBadgeText: { fontSize: 11, fontWeight: '700', color: colors.primary },
    teamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    teamInfo: { flex: 1 },
    teamName: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
    predictRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    scoreInput: { width: 40, height: 45, backgroundColor: colors.background, borderRadius: 8, textAlign: 'center', fontSize: 20, fontWeight: '800', color: colors.textPrimary, borderWidth: 1, borderColor: colors.border },
    vsText: { fontSize: 18, fontWeight: '800', color: colors.textTertiary },
    outcomeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    outcomeButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
    outcomeButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    outcomeLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
    outcomeLabelActive: { color: colors.textInverse },
    footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    bankerButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 7, paddingHorizontal: 10, borderRadius: 8, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
    bankerButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    bankerLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
    bankerLabelActive: { color: colors.textInverse },
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
