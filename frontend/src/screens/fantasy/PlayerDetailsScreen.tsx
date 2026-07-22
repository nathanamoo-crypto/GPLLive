import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors } from '../../constants/colors';
import { fonts, radius, spacing, fontSize, getScrollBottomPadding } from '../../constants/layout';
import { fetchPlayerAnalysis } from '../../services/fantasyService';
import { getApiErrorMessage } from '../../services/api';
import type { GamesStackParamList } from '../../navigation/GamesStack';
import type { PlayerAnalysis } from '../../types';

type PlayerDetailsRouteProp = RouteProp<GamesStackParamList, 'PlayerDetails'>;
type PlayerDetailsNavProp = NativeStackNavigationProp<GamesStackParamList, 'PlayerDetails'>;

const POSITION_COLORS: Record<string, string> = {
  GK: Colors.roleGk,
  DEF: Colors.roleDef,
  MID: Colors.roleMid,
  FWD: Colors.roleFwd,
};

const TREND_META: Record<string, { icon: keyof typeof Ionicons.glyphMap; label: string; color: string }> = {
  IMPROVING: { icon: 'trending-up', label: 'Improving', color: Colors.success },
  DECLINING: { icon: 'trending-down', label: 'Declining', color: Colors.danger },
  STABLE: { icon: 'remove', label: 'Stable', color: Colors.grey1 },
};

export default function PlayerDetailsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<PlayerDetailsNavProp>();
  const route = useRoute<PlayerDetailsRouteProp>();
  const { playerId } = route.params;

  const [player, setPlayer] = useState<PlayerAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPlayerAnalysis(playerId, signal);
      setPlayer(data);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Failed to load player details'));
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const posColor = player ? POSITION_COLORS[player.position] || Colors.grey1 : Colors.grey1;
  const initials = player
    ? player.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={Colors.grey1} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Player Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error || !player ? (
        <View style={styles.centerFill}>
          <Text style={styles.errorText}>{error || 'Player not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => load()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: getScrollBottomPadding(insets.bottom) }}
        >
          <View style={styles.profileSection}>
            <View style={[styles.avatarWrap, { borderColor: posColor }]}>
              {player.photoUrl ? (
                <Image source={{ uri: player.photoUrl }} style={styles.avatarImage} contentFit="cover" transition={150} />
              ) : (
                <Text style={styles.avatarInitials}>{initials}</Text>
              )}
            </View>
            <Text style={styles.playerName}>{player.fullName}</Text>
            <View style={styles.metaRow}>
              <View style={[styles.posTag, { backgroundColor: posColor }]}>
                <Text style={styles.posTagText}>{player.position}</Text>
              </View>
              <Text style={styles.clubName}>{player.clubName}</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {player.currentPrice != null ? `GH₵${player.currentPrice.toFixed(1)}m` : '—'}
              </Text>
              <Text style={styles.statLabel}>Price</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{player.totalPoints}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{player.totalGoals}</Text>
              <Text style={styles.statLabel}>Goals</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{player.totalAssists}</Text>
              <Text style={styles.statLabel}>Assists</Text>
            </View>
          </View>

          {player.premium ? (
            <View style={styles.premiumSection}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="analytics" size={18} color={Colors.yellow} />
                <Text style={styles.sectionTitle}>Fantasy Analysis</Text>
                <View style={styles.premiumChip}>
                  <Text style={styles.premiumChipText}>👑 PREMIUM</Text>
                </View>
              </View>

              <View style={styles.analysisRow}>
                <View style={styles.analysisCard}>
                  <Text style={styles.analysisLabel}>Average Points</Text>
                  <Text style={styles.analysisValue}>
                    {player.averagePoints != null ? player.averagePoints.toFixed(1) : '—'}
                  </Text>
                </View>
                <View style={styles.analysisCard}>
                  <Text style={styles.analysisLabel}>Trend</Text>
                  {player.trend ? (
                    <View style={styles.trendRow}>
                      <Ionicons
                        name={TREND_META[player.trend]?.icon || 'remove'}
                        size={18}
                        color={TREND_META[player.trend]?.color || Colors.grey1}
                      />
                      <Text style={[styles.analysisValue, { fontSize: fontSize.md, color: TREND_META[player.trend]?.color }]}>
                        {TREND_META[player.trend]?.label || player.trend}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.analysisValue}>—</Text>
                  )}
                </View>
              </View>

              {player.recentForm && player.recentForm.length > 0 && (
                <View style={styles.formSection}>
                  <Text style={styles.subHeading}>Recent Form</Text>
                  <View style={styles.formRow}>
                    {player.recentForm.map((f, i) => (
                      <View key={i} style={styles.formPill}>
                        <Text style={styles.formPoints}>{f.points}</Text>
                        <Text style={styles.formGw}>{f.gameweek != null ? `GW${f.gameweek}` : '-'}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {player.insights && player.insights.length > 0 && (
                <View style={styles.insightsSection}>
                  <Text style={styles.subHeading}>Insights</Text>
                  {player.insights.map((insight, i) => (
                    <View key={i} style={styles.insightRow}>
                      <Text style={styles.insightText}>{insight}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.lockedSection}>
              <View style={styles.lockedIconWrap}>
                <Ionicons name="lock-closed" size={22} color={Colors.yellow} />
              </View>
              <Text style={styles.lockedTitle}>Unlock Fantasy Analysis</Text>
              <Text style={styles.lockedSub}>
                Get average points, recent form, performance trend, and AI-style insights for every player.
              </Text>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => navigation.getParent()?.navigate('Home', { screen: 'Subscribe' } as never)}
              >
                <Text style={styles.upgradeButtonText}>👑 UPGRADE TO PREMIUM</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  backButton: { padding: spacing.xs },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    fontFamily: fonts.display,
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
  },
  headerSpacer: { width: 38 },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: Colors.grey1, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.md },
  retryButton: {
    backgroundColor: Colors.surface2,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  retryText: { color: Colors.white, fontWeight: '600' },
  profileSection: { alignItems: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.base },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarInitials: { fontSize: 28, fontWeight: '800', color: Colors.white, fontFamily: fonts.display },
  playerName: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    fontFamily: fonts.display,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  posTag: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.pill },
  posTagText: { fontSize: fontSize.xs, fontWeight: '800', color: Colors.white },
  clubName: { fontSize: fontSize.md, color: Colors.grey1 },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  statValue: { fontSize: fontSize.lg, fontWeight: '800', color: Colors.white, fontFamily: fonts.displayBold },
  statLabel: { fontSize: fontSize.xs, color: Colors.grey1, marginTop: 4, textTransform: 'uppercase' },
  premiumSection: {
    marginHorizontal: spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: spacing.base,
  },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.base },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: Colors.white, flex: 1 },
  premiumChip: {
    backgroundColor: Colors.yellow,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  premiumChipText: { fontSize: fontSize.xs, fontWeight: '800', color: Colors.black },
  analysisRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.base },
  analysisCard: {
    flex: 1,
    backgroundColor: Colors.surface2,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  analysisLabel: { fontSize: fontSize.xs, color: Colors.grey1, textTransform: 'uppercase', marginBottom: 6 },
  analysisValue: { fontSize: fontSize.xl, fontWeight: '800', color: Colors.white },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  formSection: { marginBottom: spacing.base },
  subHeading: { fontSize: fontSize.base, fontWeight: '700', color: Colors.white, marginBottom: spacing.sm },
  formRow: { flexDirection: 'row', gap: spacing.sm },
  formPill: {
    flex: 1,
    backgroundColor: Colors.surface2,
    borderRadius: radius.card,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  formPoints: { fontSize: fontSize.lg, fontWeight: '800', color: Colors.yellow },
  formGw: { fontSize: fontSize.xs, color: Colors.grey1, marginTop: 2 },
  insightsSection: { gap: spacing.sm },
  insightRow: {
    backgroundColor: Colors.surface2,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  insightText: { fontSize: fontSize.base, color: Colors.white, lineHeight: 19 },
  lockedSection: {
    marginHorizontal: spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: spacing.xl,
    alignItems: 'center',
  },
  lockedIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  lockedTitle: { fontSize: fontSize.lg, fontWeight: '700', color: Colors.white, marginBottom: spacing.xs },
  lockedSub: {
    fontSize: fontSize.base,
    color: Colors.grey1,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 19,
  },
  upgradeButton: {
    backgroundColor: Colors.yellow,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    width: '100%',
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: Colors.black,
    fontSize: fontSize.md,
    fontWeight: '800',
    fontFamily: fonts.display,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
  },
});
