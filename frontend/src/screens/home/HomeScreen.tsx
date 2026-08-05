import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image,
  ActivityIndicator,
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
import { getCurrentGameweek } from '../../services/fantasyService';
import { useTheme } from '../../context/ThemeContext';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import type { Match, Gameweek } from '../../types';

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
  // Fallback for when nothing's on today - the next handful of scheduled
  // fixtures (any future day), so the widget always has something useful to
  // show instead of reading as broken/empty. Live matches are already
  // covered by todaysMatches (a live match is, by definition, happening
  // today), so this only ever kicks in when today truly has nothing.
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [contentRefreshTrigger, setContentRefreshTrigger] = useState(0);
  // Only used to give the "no matches today" empty state something more
  // useful to say (e.g. the new season's actual kickoff date) - not used to
  // gate the fetch above, so a failure here never blocks the real matches
  // list from loading.
  const [currentGameweek, setCurrentGameweek] = useState<Gameweek | null>(null);

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

  // Next few scheduled fixtures, earliest first - only used when today has
  // nothing at all (see upcomingMatches above).
  const loadUpcomingMatches = useCallback(async (signal?: AbortSignal) => {
    const scheduled = await getMatches(undefined, 'scheduled', signal);
    return (scheduled ?? [])
      .slice()
      .sort((a, b) => new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime())
      .slice(0, 5);
  }, []);

  // Resolves BOTH lists before either is committed to state - the previous
  // version called setTodaysMatches(data) immediately, then (only when today
  // was empty) awaited loadUpcomingMatches() before calling
  // setUpcomingMatches(). That gap between the two state updates meant a
  // render could briefly happen with an emptied todaysMatches but a
  // not-yet-refreshed upcomingMatches, which is what showed up as the
  // widget visibly reordering/settling a beat after a refresh completed.
  // Fetching everything first and setting both states back-to-back (no
  // await in between) collapses that into a single, consistent update.
  const loadMatchesData = useCallback(async (signal?: AbortSignal) => {
    const today = await loadTodaysMatches(signal);
    let upcoming: Match[] = [];
    if (today.length === 0) {
      try {
        upcoming = await loadUpcomingMatches(signal);
      } catch {
        upcoming = [];
      }
    }
    return { today, upcoming };
  }, [loadTodaysMatches, loadUpcomingMatches]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setMatchesLoading(true);
    loadMatchesData(controller.signal)
      .then(({ today, upcoming }) => {
        if (cancelled) return;
        setTodaysMatches(today);
        setUpcomingMatches(upcoming);
      })
      .catch(() => {
        if (cancelled) return;
        setTodaysMatches([]);
        setUpcomingMatches([]);
      })
      .finally(() => { if (!cancelled) setMatchesLoading(false); });
    getCurrentGameweek(controller.signal)
      .then((gw) => { if (!cancelled) setCurrentGameweek(gw); })
      .catch(() => { if (!cancelled) setCurrentGameweek(null); });
    return () => { cancelled = true; controller.abort(); };
  }, [loadMatchesData]);

  // Only reachable when there were no matches today AND nothing scheduled
  // in the future either (e.g. before the season's fixtures are seeded) -
  // naming the actual kickoff date makes that read as expected, not broken.
  const todayEmptyMessage = useMemo(() => {
    if (!currentGameweek?.startDate) return undefined;
    const start = new Date(currentGameweek.startDate);
    if (Number.isNaN(start.getTime()) || start <= new Date()) return undefined;
    const formatted = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
    return `No matches today - the ${currentGameweek.season} season kicks off ${formatted}.`;
  }, [currentGameweek]);

  const displayMatches = todaysMatches.length > 0 ? todaysMatches : upcomingMatches;
  const matchesWidgetTitle = todaysMatches.length > 0 ? "Today's Matches" : upcomingMatches.length > 0 ? 'Upcoming Matches' : "Today's Matches";

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Bumping this tells LatestNewsWidget (re-fetch + reshuffle, same as the
    // News tab) and LeagueTableWidget (re-fetch) to update too - previously
    // this only reloaded live matches, leaving those widgets stuck on
    // whatever they first loaded.
    setContentRefreshTrigger((n) => n + 1);
    try {
      const { today, upcoming } = await loadMatchesData();
      setTodaysMatches(today);
      setUpcomingMatches(upcoming);
    } catch { /* keep current */ }
    setRefreshing(false);
  }, [loadMatchesData]);

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
            onPress={() => navigation.navigate('MyLeagues')}
          >
            <Ionicons name="people-outline" size={22} color={colors.grey1} />
          </TouchableOpacity>

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

      {/* Fixed under the header, above the ScrollView - a page-level "this
          is refreshing" cue for the whole Home screen (not just the matches
          widget), covering the rest of the time content is still settling
          after the native pull-to-refresh spinner retracts. */}
      {refreshing && (
        <View style={styles.refreshBar}>
          <ActivityIndicator size="large" color={colors.yellow} />
        </View>
      )}

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
      <TodayMatchesWidget matches={displayMatches} title={matchesWidgetTitle} emptyMessage={todayEmptyMessage} loading={matchesLoading} />
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
    refreshBar: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
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
