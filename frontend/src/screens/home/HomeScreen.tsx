import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import TodayMatchesWidget from '../../components/home/TodayMatchesWidget';
import LatestNewsWidget from '../../components/home/LatestNewsWidget';
import LeagueTableWidget from '../../components/home/LeagueTableWidget';
import FantasySnapshotWidget from '../../components/home/FantasySnapshotWidget';
import MotmVoteSpotlight from '../../components/home/MotmVoteSpotlight';
import { Colors } from '../../constants/colors';
import { getScrollBottomPadding } from '../../constants/layout';
import { useAuthStore } from '../../store/authStore';
import { useNotifications } from '../../hooks/useNotifications';
import { getMatches } from '../../services/matchService';
import { useTheme } from '../../context/ThemeContext';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import type { Match } from '../../types';

type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeFeed'>;

// True if an ISO fixture date falls on the same LOCAL calendar day as now -
// comparing y/m/d directly (not a 24h-window check) so a match at 11pm
// today and one at 1am today are both "today", regardless of timezone.
function isSameLocalDay(isoDate: string, reference: Date): boolean {
  const d = new Date(isoDate);
  return (
    d.getFullYear() === reference.getFullYear() &&
    d.getMonth() === reference.getMonth() &&
    d.getDate() === reference.getDate()
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const user = useAuthStore((state) => state.user);
  const { unreadCount } = useNotifications();
  const [todaysMatches, setTodaysMatches] = useState<Match[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [contentRefreshTrigger, setContentRefreshTrigger] = useState(0);

  // Previously this only pulled status=live fixtures, which is only ever
  // non-empty in the narrow window a match is actually being played - a
  // match scheduled for later today, or one that finished this morning,
  // would both show as "no matches today" even though real fixtures exist
  // for today. Fetching everything and filtering by date (any status) is
  // what the widget's title actually promises.
  const loadTodaysMatches = useCallback(async (signal?: AbortSignal) => {
    const all = await getMatches(undefined, undefined, signal);
    const today = new Date();
    return (all ?? []).filter((m) => isSameLocalDay(m.kickoffTime, today));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setMatchesLoading(true);
    loadTodaysMatches(controller.signal)
      .then((data) => { if (!cancelled) setTodaysMatches(data); })
      .catch(() => { if (!cancelled) setTodaysMatches([]); })
      .finally(() => { if (!cancelled) setMatchesLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [loadTodaysMatches]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Bumping this tells LatestNewsWidget (re-fetch + reshuffle, same as the
    // News tab) and LeagueTableWidget (re-fetch) to update too - previously
    // this only reloaded live matches, leaving those widgets stuck on
    // whatever they first loaded.
    setContentRefreshTrigger((n) => n + 1);
    try {
      const data = await loadTodaysMatches();
      setTodaysMatches(data);
    } catch { /* keep current */ }
    setRefreshing(false);
  }, [loadTodaysMatches]);

  return (
    <View style={styles.container}>
      <View style={[styles.headerBar, { paddingTop: insets.top + 12 }]}>
        <Image
          source={require('../../../assets/GplLogo1.png')}
          style={styles.logoImage}
          resizeMode="contain"
          accessibilityLabel="GPL Live"
        />

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Ionicons name="search" size={22} color={colors.grey1} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('NotificationInbox')}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.grey1} />
            {unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unreadCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </View>

    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: getScrollBottomPadding(insets.bottom) },
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <TodayMatchesWidget matches={todaysMatches} />
      <LatestNewsWidget refreshTrigger={contentRefreshTrigger} />
      <LeagueTableWidget refreshTrigger={contentRefreshTrigger} />
      <FantasySnapshotWidget />
      <MotmVoteSpotlight />
    </ScrollView>
  </View>
);
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    logoImage: {
      width: 90,
      height: 38,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    iconButton: { padding: 6 },
    unreadBadge: {
      position: 'absolute',
      top: 2,
      right: 2,
      backgroundColor: colors.live,
      borderRadius: 8,
      paddingHorizontal: 5,
      minWidth: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    unreadText: { color: colors.textInverse, fontSize: 10, fontWeight: '700' },
    content: { padding: 16 },
    greeting: { fontSize: 16, color: colors.textSecondary, marginBottom: 16 },
  });
}
