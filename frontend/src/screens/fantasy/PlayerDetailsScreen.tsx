import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import { useTheme } from '../../context/ThemeContext';
import type { GamesStackParamList } from '../../navigation/GamesStack';
import type { PlayerAnalysis } from '../../types';

const badgeImage = require('../../assets/badge/badge.jpeg');

type PlayerDetailsRouteProp = RouteProp<GamesStackParamList, 'PlayerDetails'>;
type PlayerDetailsNavProp = NativeStackNavigationProp<GamesStackParamList, 'PlayerDetails'>;

function getPositionColors(colors: typeof Colors): Record<string, string> {
  return {
    GK: colors.roleGk,
    DEF: colors.roleDef,
    MID: colors.roleMid,
    FWD: colors.roleFwd,
  };
}

function getTrendMeta(colors: typeof Colors): Record<string, { icon: keyof typeof Ionicons.glyphMap; label: string; color: string }> {
  return {
    IMPROVING: { icon: 'trending-up', label: 'Improving', color: colors.success },
    DECLINING: { icon: 'trending-down', label: 'Declining', color: colors.danger },
    STABLE: { icon: 'remove', label: 'Stable', color: colors.grey1 },
  };
}

export default function PlayerDetailsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<PlayerDetailsNavProp>();
  const route = useRoute<PlayerDetailsRouteProp>();
  const { playerId } = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const POSITION_COLORS = useMemo(() => getPositionColors(colors), [colors]);
  const TREND_META = useMemo(() => getTrendMeta(colors), [colors]);

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

  const posColor = player ? POSITION_COLORS[player.position] || colors.grey1 : colors.grey1;
  const initials = player
    ? player.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.grey1} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Player Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={colors.primary} />
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
                <Ionicons name="analytics" size={18} color={colors.yellow} />
                <Text style={styles.sectionTitle}>Fantasy Analysis</Text>
                <View style={styles.premiumChip}>
                  <Image source={badgeImage} style={styles.premiumChipImage} contentFit="contain" />
                  <Text style={styles.premiumChipText}>PREMIUM</Text>
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
                        color={TREND_META[player.trend]?.color || colors.grey1}
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

              {(!player.recentForm || player.recentForm.length === 0) &&
                (!player.insights || player.insights.length === 0) && (
                <View style={styles.noDataRow}>
                  <Ionicons name="information-circle-outline" size={16} color={colors.grey1} />
                  <Text style={styles.noDataText}>
                    No match data yet - form and insights will appear once {player.fullName.split(' ')[0]} has played a recorded gameweek.
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.lockedSection}>
              <View style={styles.lockedIconWrap}>
                <Ionicons name="lock-closed" size={22} color={colors.yellow} />
              </View>
              <Text style={styles.lockedTitle}>Unlock Fantasy Analysis</Text>
              <Text style={styles.lockedSub}>
                Get average points, recent form, performance trend, and AI-style insights for every player.
              </Text>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => navigation.getParent()?.navigate('Home', { screen: 'Subscribe' } as never)}
              >
                <Image source={badgeImage} style={styles.upgradeButtonImage} contentFit="contain" />
                <Text style={styles.upgradeButtonText}>UPGRADE TO PREMIUM</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
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
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
    },
    backButton: { padding: spacing.xs },
    headerTitle: {
      fontSize: fontSize.lg,
      fontWeight: '800',
      fontFamily: fonts.display,
      color: colors.white,
      textTransform: 'uppercase',
      letterSpacing: 0.06,
    },
    headerSpacer: { width: 38 },
    centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
    errorText: { color: colors.grey1, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.md },
    retryButton: {
      backgroundColor: colors.surface2,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.sm,
      borderRadius: radius.button,
      borderWidth: 1,
      borderColor: colors.border,
    },
    retryText: { color: colors.white, fontWeight: '600' },
    profileSection: { alignItems: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.base },
    avatarWrap: {
      width: 96,
      height: 96,
      borderRadius: 48,
      borderWidth: 3,
      backgroundColor: colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
      overflow: 'hidden',
    },
    avatarImage: { width: '100%', height: '100%' },
    avatarInitials: { fontSize: 28, fontWeight: '800', color: colors.white, fontFamily: fonts.display },
    playerName: {
      fontSize: fontSize.xxl,
      fontWeight: '800',
      fontFamily: fonts.display,
      color: colors.white,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    posTag: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.pill },
    posTagText: { fontSize: fontSize.xs, fontWeight: '800', color: colors.white },
    clubName: { fontSize: fontSize.md, color: colors.grey1 },
    statsGrid: {
      flexDirection: 'row',
      paddingHorizontal: spacing.base,
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    statValue: { fontSize: fontSize.lg, fontWeight: '800', color: colors.white, fontFamily: fonts.displayBold },
    statLabel: { fontSize: fontSize.xs, color: colors.grey1, marginTop: 4, textTransform: 'uppercase' },
    premiumSection: {
      marginHorizontal: spacing.base,
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.base,
    },
    sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.base },
    sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.white, flex: 1 },
    premiumChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.yellow,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.pill,
    },
    premiumChipImage: { width: 12, height: 12 },
    premiumChipText: { fontSize: fontSize.xs, fontWeight: '800', color: colors.black },
    analysisRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.base },
    analysisCard: {
      flex: 1,
      backgroundColor: colors.surface2,
      borderRadius: radius.card,
      padding: spacing.md,
    },
    analysisLabel: { fontSize: fontSize.xs, color: colors.grey1, textTransform: 'uppercase', marginBottom: 6 },
    analysisValue: { fontSize: fontSize.xl, fontWeight: '800', color: colors.white },
    trendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    formSection: { marginBottom: spacing.base },
    subHeading: { fontSize: fontSize.base, fontWeight: '700', color: colors.white, marginBottom: spacing.sm },
    formRow: { flexDirection: 'row', gap: spacing.sm },
    formPill: {
      flex: 1,
      backgroundColor: colors.surface2,
      borderRadius: radius.card,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    formPoints: { fontSize: fontSize.lg, fontWeight: '800', color: colors.yellow },
    formGw: { fontSize: fontSize.xs, color: colors.grey1, marginTop: 2 },
    insightsSection: { gap: spacing.sm },
    noDataRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.xs,
      backgroundColor: colors.surface2,
      borderRadius: radius.card,
      padding: spacing.md,
    },
    noDataText: { flex: 1, fontSize: fontSize.base, color: colors.grey1, lineHeight: 18 },
    insightRow: {
      backgroundColor: colors.surface2,
      borderRadius: radius.card,
      padding: spacing.md,
    },
    insightText: { fontSize: fontSize.base, color: colors.white, lineHeight: 19 },
    lockedSection: {
      marginHorizontal: spacing.base,
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.xl,
      alignItems: 'center',
    },
    lockedIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    lockedTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.white, marginBottom: spacing.xs },
    lockedSub: {
      fontSize: fontSize.base,
      color: colors.grey1,
      textAlign: 'center',
      marginBottom: spacing.lg,
      lineHeight: 19,
    },
    upgradeButton: {
      flexDirection: 'row',
      backgroundColor: colors.yellow,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: radius.button,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
    },
    upgradeButtonImage: { width: 16, height: 16 },
    upgradeButtonText: {
      color: colors.black,
      fontSize: fontSize.md,
      fontWeight: '800',
      fontFamily: fonts.display,
      textTransform: 'uppercase',
      letterSpacing: 0.06,
    },
  });
}
