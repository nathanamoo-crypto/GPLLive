import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { fonts, radius, getScrollBottomPadding } from '../../constants/layout';
import { CLUB_COLORS } from '../../constants/clubs';
import SubScreenHeader from '../../components/shared/SubScreenHeader';
import PrimaryButton from '../../components/shared/PrimaryButton';
import { getMotmVotes, submitMotmVote } from '../../services/motmService';
import { getFixtureLineups } from '../../services/lineupService';
import type { MotmResult } from '../../services/motmService';
import type { LineupPlayer } from '../../services/lineupService';
import type { HomeStackParamList } from '../../navigation/HomeStack';

type MotmVoteRouteProp = RouteProp<HomeStackParamList, 'MotmVote'>;

export default function MotmVoteScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<MotmVoteRouteProp>();
  const { matchId } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<MotmResult[]>([]);
  const [candidates, setCandidates] = useState<LineupPlayer[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedPlayerId, setVotedPlayerId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lineupsAvailable, setLineupsAvailable] = useState(true);

  const loadData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const votesData = await getMotmVotes(matchId, signal);
      if (signal?.aborted) return;
      if (votesData.results.length > 0) {
        setHasVoted(true);
        setResults(votesData.results);
        setLineupsAvailable(true);
      } else {
        setHasVoted(false);
        setResults([]);
        try {
          const lineups = await getFixtureLineups(matchId, signal);
          if (signal?.aborted) return;
          const allPlayers = [
            ...lineups.homeTeam.startingXI,
            ...lineups.awayTeam.startingXI,
          ];
          setCandidates(allPlayers);
          setLineupsAvailable(true);
        } catch {
          if (signal?.aborted) return;
          setLineupsAvailable(false);
          setCandidates([]);
        }
      }
    } catch {
      if (signal?.aborted) return;
      setError('Failed to load data. Check your connection and try again.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  const handleSubmitVote = async () => {
    if (!selectedPlayerId) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitMotmVote(matchId, selectedPlayerId);
      setHasVoted(true);
      setVotedPlayerId(selectedPlayerId);
      const votesData = await getMotmVotes(matchId);
      setResults(votesData.results);
    } catch {
      setError('Failed to submit vote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <SubScreenHeader title="Man of the Match" />

      {loading && (
        <View style={styles.centeredMessage}>
          <ActivityIndicator size="large" color={Colors.yellow} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.centeredMessage}>
          <Ionicons name="cloud-offline-outline" size={48} color={Colors.grey2} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadData()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && hasVoted && results.length > 0 && (
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={{ paddingBottom: getScrollBottomPadding(insets.bottom) }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultsHeader}>
            <Ionicons name="trophy" size={28} color={Colors.yellow} />
            <Text style={styles.resultsTitle}>Voting Results</Text>
            <Text style={styles.resultsSubtitle}>Here are the results</Text>
          </View>

          {results.map((result, index) => {
            const isVotedPlayer = result.playerId === votedPlayerId;
            return (
              <View
                key={result.playerId}
                style={[styles.resultRow, isVotedPlayer && styles.resultRowVoted]}
              >
                <View style={styles.resultRank}>
                  <Text style={styles.resultRankText}>{index + 1}</Text>
                </View>
                <View style={[styles.resultAccent, { backgroundColor: CLUB_COLORS[result.clubId] || Colors.grey1 }]} />
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultName, isVotedPlayer && styles.resultNameVoted]}>
                    {result.playerName}
                  </Text>
                  {isVotedPlayer && (
                    <Text style={styles.yourVoteLabel}>Your vote</Text>
                  )}
                </View>
                <View style={styles.resultStats}>
                  <Text style={styles.resultVotes}>{result.votes}</Text>
                  <Text style={styles.resultPercent}>{result.percentage.toFixed(0)}%</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {!loading && !error && !hasVoted && lineupsAvailable && (
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={{ paddingBottom: getScrollBottomPadding(insets.bottom) }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.promptText}>
            Who was the best player on the pitch?
          </Text>

          {candidates.map((candidate) => {
            const isSelected = candidate.playerId === selectedPlayerId;
            const clubColor = CLUB_COLORS[candidate.clubId] || Colors.grey1;
            return (
              <TouchableOpacity
                key={candidate.playerId}
                style={[styles.candidateCard, isSelected && styles.candidateCardSelected]}
                onPress={() => setSelectedPlayerId(candidate.playerId)}
                activeOpacity={0.7}
              >
                <View style={[styles.candidateAccent, { backgroundColor: clubColor }]} />
                <View style={styles.candidateInfo}>
                  <Text style={styles.candidateName}>{candidate.playerName}</Text>
                  <Text style={styles.candidatePosition}>{candidate.position}</Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color={Colors.yellow} />
                )}
              </TouchableOpacity>
            );
          })}

          <View style={styles.submitArea}>
            <PrimaryButton
              title="Submit Vote"
              icon="checkmark-circle"
              onPress={handleSubmitVote}
              loading={submitting}
              disabled={!selectedPlayerId}
            />
          </View>
        </ScrollView>
      )}

      {!loading && !error && !hasVoted && !lineupsAvailable && (
        <View style={styles.centeredMessage}>
          <Ionicons name="football-outline" size={48} color={Colors.grey2} />
          <Text style={styles.waitingTitle}>Voting Not Yet Available</Text>
          <Text style={styles.waitingText}>
            MOTM voting requires player lineup data from GET /fixtures/{'{id}'}/lineups (backend not yet built). Once the backend exposes this endpoint, voters will see all starting XI players here.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  scrollContent: { flex: 1 },

  centeredMessage: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { fontSize: 14, color: Colors.grey1, marginTop: 12 },
  errorText: { fontSize: 14, color: Colors.grey1, marginTop: 12, textAlign: 'center' },
  retryButton: { marginTop: 16, backgroundColor: Colors.yellow, paddingVertical: 12, paddingHorizontal: 28, borderRadius: radius.button },
  retryButtonText: { fontSize: 14, fontWeight: '800', color: '#000000', fontFamily: fonts.display, textTransform: 'uppercase' },

  waitingTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: fonts.display,
    color: Colors.white,
    textAlign: 'center',
    marginTop: 16,
  },
  waitingText: {
    fontSize: 14,
    color: Colors.grey1,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginTop: 8,
    lineHeight: 20,
  },

  resultsHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: fonts.display,
    color: Colors.white,
    textTransform: 'uppercase',
    marginTop: 12,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: Colors.grey1,
    marginTop: 4,
  },

  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  resultRowVoted: {
    borderColor: Colors.yellow,
    backgroundColor: 'rgba(245,197,24,0.08)',
  },
  resultRank: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultRankText: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: fonts.display,
    color: Colors.grey1,
  },
  resultAccent: {
    width: 3,
    alignSelf: 'stretch',
  },
  resultInfo: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: fonts.bodySemiBold,
  },
  resultNameVoted: {
    color: Colors.yellow,
  },
  yourVoteLabel: {
    fontSize: 11,
    color: Colors.yellow,
    fontWeight: '600',
    marginTop: 2,
  },
  resultStats: {
    alignItems: 'flex-end',
    paddingRight: 14,
  },
  resultVotes: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: fonts.display,
    color: Colors.white,
  },
  resultPercent: {
    fontSize: 12,
    color: Colors.grey1,
    marginTop: 2,
  },

  promptText: {
    fontSize: 15,
    color: Colors.grey1,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  candidateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  candidateCardSelected: {
    borderColor: Colors.yellow,
    backgroundColor: 'rgba(245,197,24,0.08)',
  },
  candidateAccent: {
    width: 4,
    alignSelf: 'stretch',
  },
  candidateInfo: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  candidateName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: fonts.bodySemiBold,
  },
  candidatePosition: {
    fontSize: 12,
    color: Colors.grey1,
    marginTop: 2,
  },

  submitArea: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
});
