import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { CLUB_BY_LEGACY_ID } from '../../constants/clubs';
import { isDerbyMatch } from '../../constants/derbies';
import { usePredictionStore } from '../../store/predictionStore';
import { useTheme } from '../../context/ThemeContext';
import { streakMultiplier } from '../../utils/predictionScoring';
import type { Club, Match } from '../../types';

function requireClub(id: string): Club {
  const club = CLUB_BY_LEGACY_ID[id];
  if (!club) throw new Error(`CLUB_BY_LEGACY_ID missing key "${id}" — check GPL_CLUBS`);
  return club;
}

const MOCK_FIXTURES: Match[] = [
  // The Super Clásico (Kotoko v Hearts) - auto-flagged as a derby.
  {
    id: 1,
    homeClub: requireClub('kotoko'),
    awayClub: requireClub('hearts'),
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    kickoffTime: new Date().toISOString(),
    venue: 'Baba Yara Stadium',
    round: 1,
    gameweek: 1,
    isDerby: true,
  },
  {
    id: 2,
    homeClub: requireClub('medeama'),
    awayClub: requireClub('dreams'),
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    kickoffTime: new Date().toISOString(),
    venue: 'CAA Park',
    round: 1,
    gameweek: 1,
  },
];

const RULES = [
  '7 pts — exact scoreline',
  '4 pts — correct outcome + goal difference (e.g. picked 2–1, actual 3–2)',
  '2 pts — correct outcome only',
  '0 pts — wrong outcome',
  '⚡ Banker pick doubles that fixture\u2019s points (win or lose)',
  '🏟️ Derby fixtures carry a flat +2 bonus',
  '🔥 3+ correct outcomes in a row = 1.25x points (1.5x from 6)',
  '⏰ Submitted 24h+ before kickoff earns +1',
];

export default function PredictRoot() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const {
    predictions,
    bankerFixtureId,
    streak,
    setPrediction,
    setExactScore,
    setBanker,
    submitAll,
  } = usePredictionStore();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const stage = streakMultiplier(streak);
  const streakBoostActive = stage > 1;

  const handleScoreChange = (fixtureId: number, home: string, away: string) => {
    const h = parseInt(home) || 0;
    const a = parseInt(away) || 0;
    setExactScore(fixtureId, h, a);
  };

  const handleBanker = (fixtureId: number, locked: boolean) => {
    if (locked) return;
    setBanker(fixtureId);
  };

  const handleSubmit = async () => {
    const count = Object.keys(predictions).length;
    if (count === 0) {
      setSubmitError('Make at least one prediction before submitting.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await submitAll();
      setSubmitSuccess(true);
    } catch (error: any) {
      setSubmitError(error?.message ?? 'Failed to submit predictions.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // No insets.top here - PredictRoot is always rendered nested below
    // GamesRoot's Fantasy/Predictions toggle bar, which already reserves
    // the safe-area space at the top of the screen (same fix as FantasyRoot).
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Predict & Win</Text>
        <Text style={styles.headerSubtitle}>Gameweek 24</Text>
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

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How scoring works</Text>
          {RULES.map((rule) => (
            <Text key={rule} style={styles.infoLine}>
              {'\u2022 '}
              {rule}
            </Text>
          ))}
        </View>

        {MOCK_FIXTURES.map((fixture) => {
          const prediction = predictions[fixture.id] || {};
          const isLocked = prediction.locked;
          const isBanker = bankerFixtureId === fixture.id;
          const derby = !!fixture.isDerby || isDerbyMatch(fixture.homeClub, fixture.awayClub);

          return (
            <View
              key={fixture.id}
              style={[styles.matchCard, isBanker && styles.matchCardBanker]}
            >
              <View style={styles.cardTopRow}>
                {derby ? (
                  <View style={styles.derbyBadge}>
                    <Ionicons name="shield" size={12} color={colors.live} />
                    <Text style={styles.derbyBadgeText}>Derby · +2</Text>
                  </View>
                ) : (
                  <View style={styles.placeholderBadge} />
                )}

                <TouchableOpacity
                  style={[styles.bankerButton, isBanker && styles.bankerButtonActive]}
                  onPress={() => handleBanker(fixture.id, isLocked)}
                  disabled={isLocked}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isBanker ? 'star' : 'star-outline'}
                    size={16}
                    color={isBanker ? colors.textInverse : colors.primary}
                  />
                  <Text style={[styles.bankerLabel, isBanker && styles.bankerLabelActive]}>
                    {isBanker ? 'Your Banker' : 'Banker'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.teamsRow}>
                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>{fixture.homeClub.shortName}</Text>
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

      {submitSuccess ? (
        <View style={styles.successBanner}>
          <Ionicons name="checkmark-circle" size={20} color={colors.textInverse} />
          <Text style={styles.successText}>Predictions locked in!</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.submitText}>Submit Predictions</Text>
          )}
        </TouchableOpacity>
      )}
      {submitError ? (
        <Text style={styles.errorText}>{submitError}</Text>
      ) : null}
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
    matchCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    matchCardBanker: { borderColor: colors.primary, borderWidth: 1.5 },
    cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    placeholderBadge: { flex: 1 },
    derbyBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(208,2,27,0.12)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
    },
    derbyBadgeText: { fontSize: 11, fontWeight: '800', color: colors.live },
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
    outcomeRow: { flexDirection: 'row', gap: 8 },
    outcomeButton: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 8,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    outcomeButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    outcomeLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
    outcomeLabelActive: { color: colors.textInverse },
    submitButton: { margin: 16, backgroundColor: colors.primary, padding: 18, borderRadius: 16, alignItems: 'center' },
    submitButtonDisabled: { opacity: 0.6 },
    submitText: { color: colors.textInverse, fontSize: 16, fontWeight: '800' },
    successBanner: {
      margin: 16,
      backgroundColor: '#2E7D32',
      padding: 18,
      borderRadius: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    successText: { color: colors.textInverse, fontSize: 16, fontWeight: '800' },
    errorText: { marginHorizontal: 16, marginBottom: 8, color: colors.live, fontSize: 13, textAlign: 'center' },
    disabledInput: { backgroundColor: colors.border, color: colors.textTertiary },
    disabledButton: { opacity: 0.6 },
  });
}