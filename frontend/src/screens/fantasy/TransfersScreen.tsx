import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { fonts, radius, getScrollBottomPadding } from '../../constants/layout';
import * as fantasyService from '../../services/fantasyService';
import { getApiErrorMessage } from '../../services/api';
import { fetchClubsById, RealClub } from '../../services/clubService';
import PriceChangeIndicator from '../../components/shared/PriceChangeIndicator';
import type { GamesStackParamList } from '../../navigation/GamesStack';
import type { FantasyTeam, FantasyPlayer, Player, Gameweek } from '../../types';
import type { TransferHistoryItem } from '../../services/fantasyService';

type NavigationProp = NativeStackNavigationProp<GamesStackParamList>;
type ScreenTab = 'make' | 'history';

function formatTransferDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function TransfersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [team, setTeam] = useState<FantasyTeam | null>(null);
  const [gameweek, setGameweek] = useState<Gameweek | null>(null);
  const [clubsById, setClubsById] = useState<Record<number, RealClub>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [outgoing, setOutgoing] = useState<FantasyPlayer | null>(null);
  const [incoming, setIncoming] = useState<Player | null>(null);
  const [candidates, setCandidates] = useState<Player[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<ScreenTab>('make');
  const [history, setHistory] = useState<TransferHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const loadAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setLoadError(null);
    try {
      const [teamData, gw] = await Promise.all([
        fantasyService.getMyTeam(),
        fantasyService.getCurrentGameweek(),
      ]);
      setTeam(teamData);
      setGameweek(gw);
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load your team.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const loadHistory = useCallback(async (teamId: number) => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await fantasyService.getTransferHistory(teamId);
      setHistory(data);
      setHistoryLoaded(true);
    } catch (err) {
      setHistoryError(getApiErrorMessage(err, 'Failed to load transfer history.'));
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Lazy: only fetch once, the first time the History tab is actually opened.
  useEffect(() => {
    if (activeTab === 'history' && team && !historyLoaded && !historyLoading) {
      loadHistory(team.teamId);
    }
  }, [activeTab, team, historyLoaded, historyLoading, loadHistory]);

  useEffect(() => {
    const controller = new AbortController();
    fetchClubsById(controller.signal)
      .then(setClubsById)
      .catch(() => { /* badges fall back to a placeholder below */ });
    return () => controller.abort();
  }, []);

  // Same-position players only (backend enforces like-for-like), minus
  // whoever's already in the squad.
  useEffect(() => {
    if (!outgoing || !team) {
      setCandidates([]);
      return;
    }
    let cancelled = false;
    setCandidatesLoading(true);
    fantasyService.fetchPlayers(outgoing.position)
      .then((players) => {
        if (cancelled) return;
        const squadIds = new Set(team.players.map((p) => p.id));
        // Re-checks position client-side too, as a backstop - the backend
        // is the real enforcement (transfers must be like-for-like), this
        // just keeps the list honest even if that filter ever regresses.
        setCandidates(
          players.filter((p) => p.position === outgoing.position && !squadIds.has(p.id))
        );
      })
      .catch(() => { if (!cancelled) setCandidates([]); })
      .finally(() => { if (!cancelled) setCandidatesLoading(false); });
    return () => { cancelled = true; };
  }, [outgoing, team]);

  const visibleCandidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q ? candidates.filter((p) => p.name.toLowerCase().includes(q)) : candidates;
    return [...list].sort((a, b) => b.price - a.price);
  }, [candidates, search]);

  // Mirrors the backend's own deadline check (TransferService.makeTransfer)
  // so the screen visibly locks instead of just letting a request 400.
  const isLocked = gameweek ? new Date(gameweek.deadline).getTime() < Date.now() : false;

  const netCost = incoming && outgoing ? incoming.price - outgoing.price : 0;
  const budgetAfter = team ? team.budget - netCost : 0;
  const willBeFree = team ? team.freeTransfers > 0 : false;
  // The real "can I do this" signal is whether budgetAfter stays
  // non-negative - showing net cost alone in red for any transfer that
  // costs money (even one the budget easily covers) read as an error state
  // when it wasn't one.
  const canAfford = budgetAfter >= -0.001;

  const resetSelection = () => {
    setOutgoing(null);
    setIncoming(null);
    setSearch('');
  };

  const handleConfirm = async () => {
    if (!team || !outgoing || !incoming) return;
    if (!gameweek) {
      Alert.alert(
        'Transfers unavailable',
        'No active gameweek was found, so a transfer can\'t be submitted right now. Pull down to retry, or check back once a gameweek is live.'
      );
      return;
    }
    setSubmitting(true);
    try {
      const result = await fantasyService.makeTransfer(
        team.teamId, gameweek.gameweekId, outgoing.id, incoming.id
      );
      Alert.alert(
        'Transfer complete',
        `${result.playerOutName} → ${result.playerInName}\n${result.isFreeTransfer ? 'Free transfer' : '-4 points'}`
      );
      resetSelection();
      // A newly-made transfer should show up next time History is opened,
      // even if it was already fetched once this session.
      setHistoryLoaded(false);
      await loadAll();
    } catch (err) {
      Alert.alert('Transfer failed', getApiErrorMessage(err, 'Something went wrong. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transfers</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.yellow} />
        </View>
      ) : loadError || !team ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{loadError ?? 'No team found.'}</Text>
        </View>
      ) : (
        <>
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statLabel}>Budget</Text>
              <Text style={styles.statValue}>GH₵{team.budget.toFixed(1)}m</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statLabel}>Free Transfers</Text>
              <Text style={styles.statValue}>{team.freeTransfers}</Text>
            </View>
          </View>

          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'make' && styles.tabButtonActive]}
              onPress={() => setActiveTab('make')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'make' && styles.tabButtonTextActive]}>
                Make Transfer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
              onPress={() => setActiveTab('history')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'history' && styles.tabButtonTextActive]}>
                History
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'make' ? (
          <>
          {isLocked ? (
            <View style={styles.lockedBanner}>
              <Ionicons name="lock-closed" size={16} color={colors.textInverse} />
              <Text style={styles.lockedText}>Transfers are closed - this gameweek has started.</Text>
            </View>
          ) : !gameweek ? (
            <View style={styles.lockedBanner}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.textInverse} />
              <Text style={styles.lockedText}>No active gameweek right now - pull down to retry.</Text>
            </View>
          ) : null}

          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: getScrollBottomPadding(insets.bottom) }]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => loadAll(true)} tintColor={colors.yellow} />
            }
          >
            {!outgoing ? (
              <>
                <Text style={styles.sectionLabel}>Select a player to transfer out</Text>
                {team.players.map((p) => {
                  const club = clubsById[p.clubId];
                  return (
                    <View key={p.fantasyTeamPlayerId} style={[styles.playerRow, isLocked && styles.playerRowDisabled]}>
                      <TouchableOpacity
                        style={styles.playerRowMain}
                        disabled={isLocked}
                        onPress={() => setOutgoing(p)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.badgeWrap}>
                          {club?.badge ? (
                            <Image source={club.badge} style={styles.badgeImg} resizeMode="contain" />
                          ) : (
                            <Ionicons name="shield-outline" size={18} color={colors.textTertiary} />
                          )}
                        </View>
                        <View style={styles.playerInfo}>
                          <Text style={styles.playerName} numberOfLines={1}>{p.name}</Text>
                          <View style={styles.metaRow}>
                            <Text style={styles.playerMeta}>{p.position} · GH₵{p.price}m</Text>
                            <PriceChangeIndicator priceChange={p.priceChange} />
                          </View>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => navigation.navigate('PlayerDetails', { playerId: p.id })}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="information-circle-outline" size={18} color={colors.textTertiary} />
                      </TouchableOpacity>
                      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                    </View>
                  );
                })}
              </>
            ) : (
              <>
                <View style={styles.selectedCard}>
                  <View style={styles.selectedTopRow}>
                    <Text style={styles.selectedLabel}>Transferring out</Text>
                    <TouchableOpacity onPress={resetSelection}>
                      <Text style={styles.changeText}>Change</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.selectedRow}>
                    <Text style={styles.selectedName}>{outgoing.name}</Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.selectedPrice}>GH₵{outgoing.price}m</Text>
                      <PriceChangeIndicator priceChange={outgoing.priceChange} />
                    </View>
                  </View>
                </View>

                {!incoming ? (
                  <>
                    <Text style={styles.sectionLabel}>Choose a replacement ({outgoing.position})</Text>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search players..."
                      placeholderTextColor={colors.textTertiary}
                      value={search}
                      onChangeText={setSearch}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {candidatesLoading ? (
                      <ActivityIndicator color={colors.yellow} style={styles.candidatesLoading} />
                    ) : visibleCandidates.length === 0 ? (
                      <Text style={styles.emptyText}>No eligible players found.</Text>
                    ) : (
                      visibleCandidates.map((p) => {
                        const club = clubsById[p.clubId];
                        return (
                          <View key={p.id} style={styles.playerRow}>
                            <TouchableOpacity
                              style={styles.playerRowMain}
                              onPress={() => setIncoming(p)}
                              activeOpacity={0.7}
                            >
                              <View style={styles.badgeWrap}>
                                {club?.badge ? (
                                  <Image source={club.badge} style={styles.badgeImg} resizeMode="contain" />
                                ) : (
                                  <Ionicons name="shield-outline" size={18} color={colors.textTertiary} />
                                )}
                              </View>
                              <View style={styles.playerInfo}>
                                <Text style={styles.playerName} numberOfLines={1}>{p.name}</Text>
                                <View style={styles.metaRow}>
                                  <Text style={styles.playerMeta}>{p.position} · GH₵{p.price}m</Text>
                                  <PriceChangeIndicator priceChange={p.priceChange} />
                                </View>
                              </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => navigation.navigate('PlayerDetails', { playerId: p.id })}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                              <Ionicons name="information-circle-outline" size={18} color={colors.textTertiary} />
                            </TouchableOpacity>
                            <Ionicons name="add-circle-outline" size={22} color={colors.yellow} />
                          </View>
                        );
                      })
                    )}
                  </>
                ) : (
                  <View style={styles.confirmCard}>
                    <Text style={styles.sectionLabel}>Confirm transfer</Text>
                    <View style={styles.swapRow}>
                      <View style={styles.swapSide}>
                        <Text style={styles.swapLabel}>OUT</Text>
                        <Text style={styles.swapName} numberOfLines={1}>{outgoing.name}</Text>
                        <View style={styles.metaRow}>
                          <Text style={styles.swapPrice}>GH₵{outgoing.price}m</Text>
                          <PriceChangeIndicator priceChange={outgoing.priceChange} />
                        </View>
                      </View>
                      <Ionicons name="swap-horizontal" size={20} color={colors.textTertiary} />
                      <View style={styles.swapSide}>
                        <Text style={styles.swapLabel}>IN</Text>
                        <Text style={styles.swapName} numberOfLines={1}>{incoming.name}</Text>
                        <View style={styles.metaRow}>
                          <Text style={styles.swapPrice}>GH₵{incoming.price}m</Text>
                          <PriceChangeIndicator priceChange={incoming.priceChange} />
                        </View>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.costRow}>
                      <Text style={styles.costLabel}>Net transfer cost</Text>
                      <Text style={styles.costValue}>
                        {netCost > 0 ? '-' : netCost < 0 ? '+' : ''}GH₵{Math.abs(netCost).toFixed(1)}m
                      </Text>
                    </View>
                    {/* This is the real "can I afford it" answer - shown on
                        its own row and only turns red when it would go
                        negative, instead of the net cost line above looking
                        like an error just because a transfer costs money. */}
                    <View style={styles.costRow}>
                      <Text style={styles.costLabel}>Budget after transfer</Text>
                      <Text style={[styles.costValue, budgetAfter < 0 && styles.costNegative]}>
                        GH₵{budgetAfter.toFixed(1)}m
                      </Text>
                    </View>
                    <View style={styles.costRow}>
                      <Text style={styles.costLabel}>Points cost</Text>
                      <Text style={[styles.costValue, !willBeFree && styles.costNegative]}>
                        {willBeFree ? 'Free transfer' : '-4 points'}
                      </Text>
                    </View>
                    <Text style={styles.caveatText}>
                      An active Wildcard or Free Hit makes this free regardless of the above.
                    </Text>

                    {!canAfford ? (
                      <Text style={styles.warningText}>Not enough budget for this transfer.</Text>
                    ) : null}

                    <View style={styles.confirmButtonsRow}>
                      <TouchableOpacity style={styles.backChoiceButton} onPress={() => setIncoming(null)}>
                        <Text style={styles.backChoiceText}>Back</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.confirmButton, (!canAfford || submitting) && styles.confirmButtonDisabled]}
                        disabled={!canAfford || submitting}
                        onPress={handleConfirm}
                      >
                        {submitting ? (
                          <ActivityIndicator color={colors.textInverse} />
                        ) : (
                          <Text style={styles.confirmButtonText}>Confirm Transfer</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>
          </>
          ) : (
            <ScrollView
              contentContainerStyle={[styles.scrollContent, { paddingBottom: getScrollBottomPadding(insets.bottom) }]}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={historyLoading}
                  onRefresh={() => loadHistory(team.teamId)}
                  tintColor={colors.yellow}
                />
              }
            >
              {historyLoading && history.length === 0 ? (
                <ActivityIndicator color={colors.yellow} style={styles.candidatesLoading} />
              ) : historyError ? (
                <Text style={styles.errorText}>{historyError}</Text>
              ) : history.length === 0 ? (
                <Text style={styles.emptyText}>No transfers made yet.</Text>
              ) : (
                history.map((t) => (
                  <View key={t.id} style={styles.historyCard}>
                    <View style={styles.swapRow}>
                      <View style={styles.swapSide}>
                        <Text style={styles.swapLabel}>OUT</Text>
                        <Text style={styles.swapName} numberOfLines={1}>{t.playerOutName}</Text>
                        <Text style={styles.swapPrice}>GH₵{t.playerOutPrice.toFixed(1)}m</Text>
                      </View>
                      <Ionicons name="swap-horizontal" size={20} color={colors.textTertiary} />
                      <View style={styles.swapSide}>
                        <Text style={styles.swapLabel}>IN</Text>
                        <Text style={styles.swapName} numberOfLines={1}>{t.playerInName}</Text>
                        <Text style={styles.swapPrice}>GH₵{t.playerInPrice.toFixed(1)}m</Text>
                      </View>
                    </View>
                    <View style={styles.historyFooterRow}>
                      <Text style={styles.historyDate}>{formatTransferDate(t.transferredAt)}</Text>
                      <View style={[styles.historyTag, t.isFreeTransfer ? styles.historyTagFree : styles.historyTagPaid]}>
                        <Text style={[styles.historyTagText, t.isFreeTransfer ? styles.historyTagTextFree : styles.historyTagTextPaid]}>
                          {t.isFreeTransfer ? 'Free' : '-4 pts'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.black },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    backButton: { padding: 8 },
    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      fontFamily: fonts.display,
      color: colors.white,
      textTransform: 'uppercase',
    },
    headerSpacer: { width: 38 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    errorText: { fontSize: 14, color: colors.grey1, textAlign: 'center' },
    statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 12 },
    statPill: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 10,
      alignItems: 'center',
    },
    statLabel: { fontSize: 11, color: colors.textTertiary, fontWeight: '600', marginBottom: 2 },
    statValue: { fontSize: 16, fontWeight: '800', color: colors.yellow },
    lockedBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.live,
      marginHorizontal: 16,
      marginBottom: 12,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 10,
    },
    lockedText: { color: colors.textInverse, fontWeight: '700', fontSize: 13, flexShrink: 1 },
    tabRow: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tabButtonActive: { backgroundColor: colors.yellow, borderColor: colors.yellow },
    tabButtonText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
    tabButtonTextActive: { color: '#000000' },
    historyCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 10,
    },
    historyFooterRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    historyDate: { fontSize: 12, color: colors.textTertiary },
    historyTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    historyTagFree: { backgroundColor: 'rgba(34,197,94,0.15)' },
    historyTagPaid: { backgroundColor: 'rgba(239,68,68,0.15)' },
    historyTagText: { fontSize: 11, fontWeight: '700' },
    historyTagTextFree: { color: colors.win },
    historyTagTextPaid: { color: colors.loss },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 10,
      marginTop: 6,
    },
    playerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.card,
      padding: 12,
      marginBottom: 8,
      gap: 10,
    },
    playerRowDisabled: { opacity: 0.4 },
    // Wraps badge+name/meta as its own tappable area (select outgoing/incoming
    // player) separate from the row's trailing info button (view details) and
    // decorative chevron/add icon - avoids nesting one TouchableOpacity inside
    // another.
    playerRowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
    badgeWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeImg: { width: 22, height: 22 },
    playerInfo: { flex: 1, minWidth: 0 },
    playerName: { fontSize: 14, fontWeight: '700', color: colors.white },
    playerMeta: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    selectedCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 16,
    },
    selectedTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    selectedLabel: { fontSize: 11, fontWeight: '700', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
    changeText: { fontSize: 13, fontWeight: '700', color: colors.yellow },
    selectedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    selectedName: { fontSize: 16, fontWeight: '800', color: colors.white },
    selectedPrice: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
    searchInput: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      color: colors.white,
      fontSize: 14,
      marginBottom: 12,
    },
    candidatesLoading: { marginTop: 20 },
    emptyText: { fontSize: 14, color: colors.textTertiary, textAlign: 'center', marginTop: 20 },
    confirmCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
    },
    swapRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 4 },
    swapSide: { flex: 1, alignItems: 'center' },
    swapLabel: { fontSize: 10, fontWeight: '800', color: colors.textTertiary, letterSpacing: 0.5, marginBottom: 4 },
    swapName: { fontSize: 14, fontWeight: '800', color: colors.white, textAlign: 'center' },
    swapPrice: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
    costRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    costLabel: { fontSize: 13, color: colors.textSecondary },
    costValue: { fontSize: 14, fontWeight: '800', color: colors.win },
    costNegative: { color: colors.loss },
    caveatText: { fontSize: 11, color: colors.textTertiary, marginTop: 4, marginBottom: 4, lineHeight: 16 },
    warningText: { fontSize: 12, color: colors.loss, fontWeight: '700', marginTop: 8 },
    confirmButtonsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
    backChoiceButton: {
      flex: 1,
      paddingVertical: 13,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    backChoiceText: { color: colors.textSecondary, fontWeight: '700', fontSize: 14 },
    confirmButton: {
      flex: 2,
      paddingVertical: 13,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: colors.yellow,
    },
    confirmButtonDisabled: { opacity: 0.5 },
    confirmButtonText: { color: '#000000', fontWeight: '800', fontSize: 14 },
  });
}
