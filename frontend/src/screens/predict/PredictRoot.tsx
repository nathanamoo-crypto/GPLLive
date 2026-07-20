import React, { useState } from 'react';
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
import { usePredictionStore } from '../../store/predictionStore';
import type { Club, Match } from '../../types';

function requireClub(id: string): Club {
  const club = CLUB_BY_LEGACY_ID[id];
  if (!club) throw new Error(`CLUB_BY_LEGACY_ID missing key "${id}" — check GPL_CLUBS`);
  return club;
}

const MOCK_FIXTURES: Match[] = [
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

export default function PredictRoot() {
  const { predictions, setPrediction, setExactScore, submitAll } = usePredictionStore();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleScoreChange = (fixtureId: number, home: string, away: string) => {
    const h = parseInt(home) || 0;
    const a = parseInt(away) || 0;
    setExactScore(fixtureId, h, a);
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

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.infoBox}>
          Predict the exact score for each match. You get 5 points for exact score, 2 points for correct outcome.
        </Text>

        {MOCK_FIXTURES.map((fixture) => {
          const prediction = predictions[fixture.id] || {};
          const isLocked = prediction.locked;

          return (
            <View key={fixture.id} style={styles.matchCard}>
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
          <Ionicons name="checkmark-circle" size={20} color={Colors.textInverse} />
          <Text style={styles.successText}>Predictions locked in!</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.textInverse} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  headerSubtitle: { fontSize: 16, color: Colors.primary, fontWeight: '700', marginTop: 4 },
  content: { padding: 16 },
  infoBox: { backgroundColor: Colors.tagFE.bg, padding: 12, borderRadius: 12, color: Colors.primary, fontSize: 13, fontWeight: '600', marginBottom: 20 },
  matchCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  teamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  teamInfo: { flex: 1 },
  teamName: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  predictRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  scoreInput: { width: 40, height: 45, backgroundColor: Colors.background, borderRadius: 8, textAlign: 'center', fontSize: 20, fontWeight: '800', color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border },
  vsText: { fontSize: 18, fontWeight: '800', color: Colors.textTertiary },
  outcomeRow: { flexDirection: 'row', gap: 8 },
  outcomeButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  outcomeButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  outcomeLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  outcomeLabelActive: { color: Colors.textInverse },
  submitButton: { margin: 16, backgroundColor: Colors.primary, padding: 18, borderRadius: 16, alignItems: 'center' },
  submitButtonDisabled: { opacity: 0.6 },
  submitText: { color: Colors.textInverse, fontSize: 16, fontWeight: '800' },
  successBanner: { margin: 16, backgroundColor: '#2E7D32', padding: 18, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  successText: { color: Colors.textInverse, fontSize: 16, fontWeight: '800' },
  errorText: { marginHorizontal: 16, marginBottom: 8, color: Colors.live, fontSize: 13, textAlign: 'center' },
  disabledInput: { backgroundColor: Colors.border, color: Colors.textTertiary },
  disabledButton: { opacity: 0.6 },
});
