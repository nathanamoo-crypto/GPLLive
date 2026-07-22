import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { useTheme } from '../../context/ThemeContext';
import { CLUB_COLORS } from '../../constants/clubs';
import SubScreenHeader from '../../components/shared/SubScreenHeader';
import PrimaryButton from '../../components/shared/PrimaryButton';
import { getMotmVotes, submitMotmVote } from '../../services/motmService';
import { getMatchDetails, getFixtureClubNames } from '../../services/matchService';
import { fetchClubs, backendClubIdToLocalClub, fetchClubsById, RealClub } from '../../services/clubService';
import { fetchPlayersByClub } from '../../services/fantasyService';
import { getApiErrorMessage } from '../../services/api';
import type { MotmResult } from '../../services/motmService';
import type { Player } from '../../types';
import type { HomeStackParamList } from '../../navigation/HomeStack';

type MotmVoteRouteProp = RouteProp<HomeStackParamList, 'MotmVote'>;

export default function MotmVoteScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<MotmVoteRouteProp>();
  const { matchId } = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [votingOpen, setVotingOpen] = useState(false);
  const [results, setResults] = useState<MotmResult[]>([]);
  const [candidates, setCandidates] = useState<Player[]>([]);
  const [clubsById, setClubsById] = useState<Record<number, RealClub>>({});
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [myVotePlayerId, setMyVotePlayerId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const localClubId = useCallback((backendClubId: number): number => {
    // CLUB_COLORS is keyed by this app's LOCAL club ids, but every clubId
    // coming off the backend (Player.clubId, MotmResult.clubId) is the
    // BACKEND club id - the two id spaces don't match (see clubService.ts).
    return backendClubIdToLocalClub(backendClubId, clubsById)?.id ?? 0;
  }, [clubsById]);

  const loadData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const [match, votesData, byId] = await Promise.all([
        getMatchDetails(matchId, signal),
        getMotmVotes(matchId, signal),
        fetchClubsById(signal),
      ]);
      if (signal?.aborted) return;

      setClubsById(byId);
      setResults(votesData.results);
      setMyVotePlayerId(votesData.myVotePlayerId);
      setVotingOpen(votesData.votingOpen);
      setIsFinished(match?.status === 'finished');

      // Only bother loading candidates when there's actually a ballot to
      // show - not needed once the user has voted, and not while voting is
      // closed (either the match hasn't finished yet, or the 24h window
      // after kickoff has passed).
      if (votesData.votingOpen && votesData.myVotePlayerId == null) {
        const names = await getFixtureClubNames(matchId, signal);
        if (signal?.aborted) return;
        if (names) {
          const realClubs = await fetchClubs(signal);
          if (signal?.aborted) return;
          const homeClub = realClubs.find((c) => c.fullName === names.homeClubName);
          const awayClub = realClubs.find((c) => c.fullName === names.awayClubName);
          const clubIds = [homeClub?.id, awayClub?.id].filter((id): id is number => id != null);
          const squads = await Promise.all(clubIds.map((id) => fetchPlayersByClub(id, signal)));
          if (signal?.aborted) return;
          setCandidates(squads.flat());
        } else {
          setCandidates([]);
        }
      } else {
        setCandidates([]);
      }
    } catch (err) {
      if (signal?.aborted) return;
      setError(getApiErrorMessage(err, 'Failed to load data. Check your connection and try again.'));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  const hasVoted = myVotePlayerId != null;

  const handleSubmitVote = async () => {
    if (!selectedPlayerId) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitMotmVote(matchId, selectedPlayerId);
      setMyVotePlayerId(selectedPlayerId);
      const votesData = await getMotmVotes(matchId);
      setResults(votesData.results);
      setVotingOpen(votesData.votingOpen);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to submit vote. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <SubScreenHeader title="Man of the Match" />

      {loading && (
        <View style={styles.centeredMessage}>
          <ActivityIndicator size="large" color={colors.yellow} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.centeredMessage}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.grey2} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadData()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && (hasVoted || (!votingOpen && isFinished && results.length > 0)) && (
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={{ paddingBottom: getScrollBottomPadding(insets.bottom) }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultsHeader}>
            <Ionicons name="trophy" size={28} color={colors.yellow} />
            <Text style={styles.resultsTitle}>{votingOpen ? 'Voting Results' : 'Final Results'}</Text>
            <Text style={styles.resultsSubtitle}>
              {votingOpen ? 'Here are the results so far' : 'Voting has closed for this match'}
            </Text>
          </View>

          {results.map((result, index) => {
            const isVotedPlayer = result.playerId === myVotePlayerId;
            return (
              <View
                key={result.playerId}
                style={[styles.resultRow, isVotedPlayer && styles.resultRowVoted]}
              >
                <View style={styles.resultRank}>
                  <Text style={styles.resultRankText}>{index + 1}</Text>
                </View>
                <View style={[styles.resultAccent, { backgroundColor: CLUB_COLORS[localClubId(result.clubId)] || colors.grey1 }]} />
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

      {!loading && !error && !hasVoted && votingOpen && (
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={{ paddingBottom: getScrollBottomPadding(insets.bottom) }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.promptText}>
            Who was the best player on the pitch?
          </Text>

          {candidates.map((candidate) => {
            const isSelected = candidate.id === selectedPlayerId;
            const clubColor = CLUB_COLORS[localClubId(candidate.clubId)] || colors.grey1;
            return (
              <TouchableOpacity
                key={candidate.id}
                style={[styles.candidateCard, isSelected && styles.candidateCardSelected]}
                onPress={() => setSelectedPlayerId(candidate.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.candidateAccent, { backgroundColor: clubColor }]} />
                <View style={styles.candidateInfo}>
                  <Text style={styles.candidateName}>{candidate.name}</Text>
                  <Text style={styles.candidatePosition}>{candidate.position}</Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.yellow} />
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

      {!loading && !error && !hasVoted && !isFinished && (
        <View style={styles.centeredMessage}>
          <Ionicons name="hourglass-outline" size={48} color={colors.grey2} />
          <Text style={styles.waitingTitle}>Voting Not Yet Open</Text>
          <Text style={styles.waitingText}>
            MOTM voting opens once this match has finished. Check back after full time.
          </Text>
        </View>
      )}

      {!loading && !error && !hasVoted && isFinished && !votingOpen && results.length === 0 && (
        <View style={styles.centeredMessage}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.grey2} />
          <Text style={styles.waitingTitle}>Voting Has Closed</Text>
          <Text style={styles.waitingText}>
            The 24-hour voting window for this match has ended, and no votes were cast.
          </Text>
        </View>
      )}
    </View>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  scrollContent: { flex: 1 },

  centeredMessage: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { fontSize: 14, color: colors.grey1, marginTop: 12 },
  errorText: { fontSize: 14, color: colors.grey1, marginTop: 12, textAlign: 'center' },
  retryButton: { marginTop: 16, backgroundColor: colors.yellow, paddingVertical: 12, paddingHorizontal: 28, borderRadius: radius.button },
  retryButtonText: { fontSize: 14, fontWeight: '800', color: '#000000', fontFamily: fonts.display, textTransform: 'uppercase' },

  waitingTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: fonts.display,
    color: colors.white,
    textAlign: 'center',
    marginTop: 16,
  },
  waitingText: {
    fontSize: 14,
    color: colors.grey1,
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
    color: colors.white,
    textTransform: 'uppercase',
    marginTop: 12,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: colors.grey1,
    marginTop: 4,
  },

  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  resultRowVoted: {
    borderColor: colors.yellow,
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
    color: colors.grey1,
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
    color: colors.white,
    fontFamily: fonts.bodySemiBold,
  },
  resultNameVoted: {
    color: colors.yellow,
  },
  yourVoteLabel: {
    fontSize: 11,
    color: colors.yellow,
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
    color: colors.white,
  },
  resultPercent: {
    fontSize: 12,
    color: colors.grey1,
    marginTop: 2,
  },

  promptText: {
    fontSize: 15,
    color: colors.grey1,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  candidateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  candidateCardSelected: {
    borderColor: colors.yellow,
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
    color: colors.white,
    fontFamily: fonts.bodySemiBold,
  },
  candidatePosition: {
    fontSize: 12,
    color: colors.grey1,
    marginTop: 2,
  },

  submitArea: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  });
}
