import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { getApiErrorMessage } from '../../services/api';
import {
  getLeague,
  getLeagueMembers,
  getPendingRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  joinLeagueById,
  leaveLeague,
  deleteLeague,
  getLeaguePredictionLeaderboard,
  getLeagueFantasyLeaderboard,
} from '../../services/leagueService';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import type { League, LeagueMember, LeagueLeaderboardEntry } from '../../types';

type NavProp = NativeStackNavigationProp<HomeStackParamList, 'LeagueDetail'>;
type RouteProps = RouteProp<HomeStackParamList, 'LeagueDetail'>;

type LeaderboardKind = 'predictions' | 'fantasy';

export default function LeagueDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { leagueId } = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const username = useAuthStore((state) => state.user?.username);

  const [league, setLeague] = useState<League | null>(null);
  const [members, setMembers] = useState<LeagueMember[]>([]);
  const [pending, setPending] = useState<LeagueMember[]>([]);
  const [leaderboardKind, setLeaderboardKind] = useState<LeaderboardKind>('predictions');
  const [leaderboard, setLeaderboard] = useState<LeagueLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await getLeague(leagueId);
      setLeague(data);
      const isMemberish = data.callerStatus === 'OWNER' || data.callerStatus === 'ACTIVE' || data.callerStatus === 'PENDING';
      if (isMemberish) {
        const memberList = await getLeagueMembers(leagueId).catch(() => []);
        setMembers(memberList);
        if (data.callerStatus === 'OWNER') {
          const requests = await getPendingRequests(leagueId).catch(() => []);
          setPending(requests);
        }
      }
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Could not load this league.'));
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  // Pending requests can change from another device/session - refresh
  // whenever this screen comes back into focus (e.g. after leaving and
  // returning), same pattern as the notification bell badge.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const loadLeaderboard = useCallback(async (kind: LeaderboardKind) => {
    setLeaderboardLoading(true);
    try {
      const data = kind === 'predictions'
        ? await getLeaguePredictionLeaderboard(leagueId)
        : await getLeagueFantasyLeaderboard(leagueId);
      setLeaderboard(data);
    } catch {
      setLeaderboard([]);
    } finally {
      setLeaderboardLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    const canSeeLeaderboard = league?.callerStatus === 'OWNER' || league?.callerStatus === 'ACTIVE' || league?.callerStatus === 'PENDING';
    if (canSeeLeaderboard) loadLeaderboard(leaderboardKind);
  }, [league?.callerStatus, leaderboardKind, loadLeaderboard]);

  const handleJoin = async () => {
    setActionBusy(true);
    try {
      const updated = await joinLeagueById(leagueId);
      setLeague(updated);
    } catch (err: any) {
      Alert.alert('Could not join', getApiErrorMessage(err, 'Please try again.'));
    } finally {
      setActionBusy(false);
    }
  };

  const handleLeave = () => {
    Alert.alert('Leave league?', `You'll need to rejoin to be part of "${league?.name}" again.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          setActionBusy(true);
          try {
            await leaveLeague(leagueId);
            navigation.goBack();
          } catch (err: any) {
            Alert.alert('Could not leave', getApiErrorMessage(err, 'Please try again.'));
          } finally {
            setActionBusy(false);
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Delete league?', 'This removes it for every member - this cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setActionBusy(true);
          try {
            await deleteLeague(leagueId);
            navigation.goBack();
          } catch (err: any) {
            Alert.alert('Could not delete', getApiErrorMessage(err, 'Please try again.'));
          } finally {
            setActionBusy(false);
          }
        },
      },
    ]);
  };

  const handleAccept = async (userId: number) => {
    setActionBusy(true);
    try {
      await acceptJoinRequest(leagueId, userId);
      await load();
    } catch (err: any) {
      Alert.alert('Could not accept', getApiErrorMessage(err, 'Please try again.'));
    } finally {
      setActionBusy(false);
    }
  };

  const handleReject = async (userId: number) => {
    setActionBusy(true);
    try {
      await rejectJoinRequest(leagueId, userId);
      await load();
    } catch (err: any) {
      Alert.alert('Could not decline', getApiErrorMessage(err, 'Please try again.'));
    } finally {
      setActionBusy(false);
    }
  };

  const handleShare = () => {
    if (!league?.inviteCode) return;
    Share.share({
      message: `Join my GPL Live league "${league.name}" - use invite code ${league.inviteCode} in the app.`,
    }).catch(() => {});
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error || !league) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>League</Text>
          <View style={{ width: 30 }} />
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error ?? 'League not found.'}</Text>
        </View>
      </View>
    );
  }

  const isOwner = league.callerStatus === 'OWNER';
  const isActiveMember = league.callerStatus === 'ACTIVE';
  const isPendingRequester = league.callerStatus === 'PENDING';
  const canView = isOwner || isActiveMember || isPendingRequester;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{league.name}</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Ionicons name={league.isPublic ? 'earth-outline' : 'lock-closed-outline'} size={16} color={colors.grey1} />
            <Text style={styles.summaryText}>{league.isPublic ? 'Public league' : 'Private league'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="people-outline" size={16} color={colors.grey1} />
            <Text style={styles.summaryText}>{league.activeMemberCount} / {league.memberLimit} members</Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="person-outline" size={16} color={colors.grey1} />
            <Text style={styles.summaryText}>Created by {league.creatorUsername}</Text>
          </View>

          {league.inviteCode ? (
            <View style={styles.codeRow}>
              <View style={styles.codeBox}>
                <Text style={styles.codeLabel}>Invite code</Text>
                <Text style={styles.codeText}>{league.inviteCode}</Text>
              </View>
              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <Ionicons name="share-social-outline" size={16} color={colors.black} />
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {league.callerStatus === 'NONE' ? (
          <TouchableOpacity style={styles.primaryButton} onPress={handleJoin} disabled={actionBusy}>
            {actionBusy ? <ActivityIndicator color={colors.black} /> : <Text style={styles.primaryButtonText}>Join League</Text>}
          </TouchableOpacity>
        ) : null}

        {isPendingRequester ? (
          <View style={styles.pendingBanner}>
            <Ionicons name="time-outline" size={16} color={colors.yellow} />
            <Text style={styles.pendingBannerText}>Your request is waiting on {league.creatorUsername}'s approval.</Text>
          </View>
        ) : null}

        {isOwner && pending.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending requests ({pending.length})</Text>
            {pending.map((p) => (
              <View key={p.userId} style={styles.requestRow}>
                <Text style={styles.requestName}>{p.username}</Text>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.requestButton, styles.acceptButton]}
                    onPress={() => handleAccept(p.userId)}
                    disabled={actionBusy}
                  >
                    <Ionicons name="checkmark" size={16} color={colors.black} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.requestButton, styles.rejectButton]}
                    onPress={() => handleReject(p.userId)}
                    disabled={actionBusy}
                  >
                    <Ionicons name="close" size={16} color={colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {canView ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Members ({members.length})</Text>
              {members.map((m) => (
                <View key={m.userId} style={styles.memberRow}>
                  <Ionicons name="person-circle-outline" size={18} color={colors.grey2} />
                  <Text style={styles.memberName}>
                    {m.username}{m.username === username ? ' (You)' : ''}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Leaderboard</Text>
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.toggleChip, leaderboardKind === 'predictions' && styles.toggleChipActive]}
                  onPress={() => setLeaderboardKind('predictions')}
                >
                  <Text style={[styles.toggleText, leaderboardKind === 'predictions' && styles.toggleTextActive]}>Predictions</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleChip, leaderboardKind === 'fantasy' && styles.toggleChipActive]}
                  onPress={() => setLeaderboardKind('fantasy')}
                >
                  <Text style={[styles.toggleText, leaderboardKind === 'fantasy' && styles.toggleTextActive]}>Fantasy</Text>
                </TouchableOpacity>
              </View>

              {leaderboardLoading ? (
                <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
              ) : leaderboard.length === 0 ? (
                <Text style={styles.emptyText}>No one on the leaderboard yet.</Text>
              ) : (
                <FlatList
                  data={leaderboard}
                  keyExtractor={(item) => String(item.userId)}
                  scrollEnabled={false}
                  renderItem={({ item }) => {
                    const isMe = item.username === username;
                    return (
                      <View style={[styles.lbRow, isMe && styles.lbRowActive]}>
                        <Text style={[styles.lbRank, isMe && styles.lbTextActive]}>#{item.rank}</Text>
                        <Text style={[styles.lbName, isMe && styles.lbTextActive]} numberOfLines={1}>
                          {item.username}{isMe ? ' (You)' : ''}
                        </Text>
                        {item.streak != null && item.streak >= 3 ? (
                          <Ionicons name="flame" size={14} color={isMe ? colors.textInverse : colors.primary} style={{ marginRight: 8 }} />
                        ) : null}
                        <Text style={[styles.lbPoints, isMe && styles.lbTextActive]}>{item.points} pts</Text>
                      </View>
                    );
                  }}
                />
              )}
            </View>
          </>
        ) : null}

        {isActiveMember ? (
          <TouchableOpacity style={styles.leaveButton} onPress={handleLeave} disabled={actionBusy}>
            <Text style={styles.leaveButtonText}>Leave League</Text>
          </TouchableOpacity>
        ) : null}

        {isOwner ? (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={actionBusy}>
            <Text style={styles.deleteButtonText}>Delete League</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.black },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: { padding: 4, width: 30 },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '800', color: colors.white, fontFamily: fonts.display, textTransform: 'uppercase' },
    errorText: { color: colors.live, fontSize: 14, textAlign: 'center', paddingHorizontal: 24 },
    summaryCard: {
      margin: 16,
      padding: 16,
      borderRadius: radius.card,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    summaryText: { fontSize: 13, color: colors.grey1, fontWeight: '600' },
    codeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
    codeBox: { flex: 1, backgroundColor: colors.surface2, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 },
    codeLabel: { fontSize: 10, color: colors.grey2, textTransform: 'uppercase', letterSpacing: 0.05 },
    codeText: { fontSize: 20, color: colors.yellow, fontWeight: '800', letterSpacing: 2, marginTop: 2 },
    shareButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.yellow,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    shareButtonText: { fontSize: 13, fontWeight: '700', color: colors.black },
    primaryButton: {
      marginHorizontal: 16,
      backgroundColor: colors.yellow,
      borderRadius: radius.card,
      paddingVertical: 14,
      alignItems: 'center',
    },
    primaryButtonText: { fontSize: 15, fontWeight: '800', color: colors.black },
    pendingBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginHorizontal: 16,
      padding: 12,
      borderRadius: radius.card,
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderColor: colors.yellow,
    },
    pendingBannerText: { flex: 1, fontSize: 12, color: colors.grey1, fontWeight: '600' },
    section: { marginTop: 20, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 13, fontWeight: '800', color: colors.white, textTransform: 'uppercase', letterSpacing: 0.05, marginBottom: 10 },
    requestRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    requestName: { fontSize: 13, fontWeight: '700', color: colors.white },
    requestActions: { flexDirection: 'row', gap: 8 },
    requestButton: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
    acceptButton: { backgroundColor: colors.yellow },
    rejectButton: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border },
    memberRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7 },
    memberName: { fontSize: 13, color: colors.grey1, fontWeight: '600' },
    toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    toggleChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: colors.surface2 },
    toggleChipActive: { backgroundColor: colors.yellow },
    toggleText: { fontSize: 12, fontWeight: '700', color: colors.grey1 },
    toggleTextActive: { color: colors.black },
    emptyText: { color: colors.grey2, fontSize: 13, marginTop: 8 },
    lbRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      marginBottom: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    lbRowActive: { backgroundColor: colors.yellow, borderColor: colors.yellow },
    lbRank: { width: 34, fontSize: 13, fontWeight: '800', color: colors.grey1 },
    lbName: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.white },
    lbPoints: { fontSize: 13, fontWeight: '800', color: colors.white },
    lbTextActive: { color: colors.black },
    leaveButton: { marginTop: 24, marginHorizontal: 16, alignItems: 'center', paddingVertical: 12 },
    leaveButtonText: { color: colors.live, fontSize: 13, fontWeight: '700' },
    deleteButton: { marginTop: 24, marginHorizontal: 16, alignItems: 'center', paddingVertical: 12 },
    deleteButtonText: { color: colors.live, fontSize: 13, fontWeight: '700' },
  });
}
