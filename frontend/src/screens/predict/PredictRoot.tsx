import React from 'react';
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
import { usePredictionStore } from '../../store/predictionStore';
import type { Match } from '../../types';

/**
 * MOCK DATA SECTION
 * -----------------
 * This data will be replaced by an API call once the backend is ready.
 */
const MOCK_FIXTURES: Match[] = [
  {
    id: 'f1',
    homeClub: { id: 'kotoko', name: 'Asante Kotoko', shortName: 'Kotoko' },
    awayClub: { id: 'hearts', name: 'Hearts of Oak', shortName: 'Hearts' },
    status: 'scheduled',
    kickoffTime: new Date().toISOString(),
    venue: 'Baba Yara Stadium',
  } as Match,
  {
    id: 'f2',
    homeClub: { id: 'bechem', name: 'Bechem United', shortName: 'Bechem' },
    awayClub: { id: 'aduana', name: 'Aduana Stars', shortName: 'Aduana' },
    status: 'scheduled',
    kickoffTime: new Date().toISOString(),
    venue: 'Bechem Park',
  } as Match,
];

export default function PredictRoot() {
  const insets = useSafeAreaInsets();
  const { predictions, setPrediction, setExactScore, submitAll } = usePredictionStore();

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
      await submitAll(24); // Gameweek 24
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

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Predictions</Text>
      </TouchableOpacity>
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
  submitText: { color: Colors.textInverse, fontSize: 16, fontWeight: '800' },
  disabledInput: { backgroundColor: Colors.border, color: Colors.textTertiary },
  disabledButton: { opacity: 0.6 },
});
