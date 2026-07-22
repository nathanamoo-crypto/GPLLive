import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { fonts, getScrollBottomPadding } from '../../constants/layout';
import { useTheme } from '../../context/ThemeContext';
import type { Match, StandingRow } from '../../types';
import type { FixturesStackParamList } from '../../navigation/FixturesStack';
import FixtureRow from '../../components/shared/FixtureRow';
import { Logos } from '../../constants/logos';
import { getMatches } from '../../services/matchService';
import { fetchStandings } from '../../services/standingsService';

type FixturesNavProp = NativeStackNavigationProp<FixturesStackParamList, 'FixturesRoot'>;
type FixturesRootRouteProp = RouteProp<FixturesStackParamList, 'FixturesRoot'>;

const FILTER_OPTIONS = ['All', 'Live', 'Scheduled', 'Completed'] as const;

export default function FixturesRoot() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<FixturesNavProp>();
  const route = useRoute<FixturesRootRouteProp>();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [filter, setFilter] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'fixtures' | 'table'>(route.params?.defaultTab || 'fixtures');

  // Table used to be reached by tapping a separate bottom tab (which always
  // remounted this screen fresh); now it's also reachable by deep-linking
  // in here (e.g. from the Profile menu) while this screen may already be
  // mounted from the Fixtures tab - re-apply the param if it changes under
  // an already-mounted instance.
  useEffect(() => {
    if (route.params?.defaultTab) {
      setActiveTab(route.params.defaultTab);
    }
  }, [route.params?.defaultTab]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    getMatches()
      .then((data) => { if (!cancelled) setMatches(data ?? []); })
      .catch((err: any) => { if (!cancelled) setFetchError(err?.message ?? 'Failed to load fixtures.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const gameweeks = useMemo(() => {
    const gws = [...new Set(matches.map((m) => m.gameweek))].sort((a, b) => b - a);
    return gws.length > 0 ? gws : [];
  }, [matches]);

  const [currentGameweek, setCurrentGameweek] = useState<number | null>(null);

  useEffect(() => {
    if (gameweeks.length > 0 && currentGameweek === null) {
      setCurrentGameweek(gameweeks[0]);
    }
  }, [gameweeks, currentGameweek]);

  const goPrevGameweek = () => {
    if (currentGameweek === null) return;
    const idx = gameweeks.indexOf(currentGameweek);
    if (idx < gameweeks.length - 1) setCurrentGameweek(gameweeks[idx + 1]);
  };

  const goNextGameweek = () => {
    if (currentGameweek === null) return;
    const idx = gameweeks.indexOf(currentGameweek);
    if (idx > 0) setCurrentGameweek(gameweeks[idx - 1]);
  };

  const gwMatches = useMemo(
    () => matches.filter((m) => m.gameweek === currentGameweek),
    [currentGameweek, matches],
  );

  const filtered = useMemo(() => {
    if (filter === 'All') return gwMatches;
    if (filter === 'Live') return gwMatches.filter((m) => m.status === 'live');
    if (filter === 'Scheduled') return gwMatches.filter((m) => m.status === 'scheduled');
    return gwMatches.filter((m) => m.status === 'finished');
  }, [filter, gwMatches]);

  const gameweekDate = useMemo(() => {
    if (gwMatches.length === 0) return '';
    const dates = gwMatches.map((m) => new Date(m.kickoffTime));
    const min = new Date(Math.min(...dates.map(Number)));
    const max = new Date(Math.max(...dates.map(Number)));
    if (min.toDateString() === max.toDateString()) {
      return min.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    return `${min.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${max.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }, [gwMatches]);

  const isCurrentGw = currentGameweek === gameweeks[0];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.tableButton}
          onPress={goPrevGameweek}
          disabled={currentGameweek === gameweeks[gameweeks.length - 1]}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={currentGameweek === gameweeks[gameweeks.length - 1] ? colors.surface2 : colors.grey1}
          />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{currentGameweek != null ? `MATCHDAY ${currentGameweek}` : 'FIXTURES'}</Text>
          {isCurrentGw && currentGameweek != null && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>CURRENT</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.tableButton}
          onPress={goNextGameweek}
          disabled={currentGameweek === gameweeks[0]}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={currentGameweek === gameweeks[0] ? colors.surface2 : colors.grey1}
          />
        </TouchableOpacity>
      </View>
      {activeTab === 'fixtures' && gameweekDate ? (
        <Text style={styles.dateSubtitle}>{gameweekDate}</Text>
      ) : null}

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'fixtures' && styles.tabActive]}
          onPress={() => setActiveTab('fixtures')}
        >
          <Text style={[styles.tabText, activeTab === 'fixtures' && styles.tabTextActive]}>
            Fixtures
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'table' && styles.tabActive]}
          onPress={() => setActiveTab('table')}
        >
          <Text style={[styles.tabText, activeTab === 'table' && styles.tabTextActive]}>
            Table
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : fetchError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{fetchError}</Text>
        </View>
      ) : activeTab === 'fixtures' ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerStyle={styles.filterContent}
          >
            {FILTER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.filterChip, filter === opt && styles.filterChipActive]}
                onPress={() => setFilter(opt)}
              >
                <Text style={[styles.filterText, filter === opt && styles.filterTextActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView
            style={styles.list}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: getScrollBottomPadding(insets.bottom) },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={colors.textTertiary} />
                <Text style={styles.emptyText}>No matches found</Text>
              </View>
            ) : (
              filtered.map((match) => (
                <FixtureRow
                  key={match.id}
                  match={match}
                  onPress={() =>
                    navigation.navigate('MatchDetails', { matchId: match.id })
                  }
                />
              ))
            )}
          </ScrollView>
        </>
      ) : (
        <StandingsView />
      )}
    </View>
  );
}

type StandingsSortKey = 'pts' | 'gd' | 'w';

// This is now the app's only league table view (the standalone Table tab
// was folded into this Fixtures/Table toggle). Computed live by the backend
// from real recorded fixture results (StandingsService.java) - no
// hardcoded/generated rows - so it stays correct as results get entered,
// this season or a future one, with nothing to update here by hand.
function StandingsView() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [sortBy, setSortBy] = useState<StandingsSortKey>('pts');
  const [rows, setRows] = useState<StandingRow[]>([]);
  const [season, setSeason] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchStandings(undefined, controller.signal)
      .then((data) => {
        setRows(data.rows);
        setSeason(data.season);
        setError(null);
      })
      .catch((err: any) => setError(err?.message ?? 'Failed to load the league table.'))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const standings = useMemo(() => {
    const sorted = [...rows];
    if (sortBy === 'pts') sorted.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
    else if (sortBy === 'gd') sorted.sort((a, b) => b.goalDifference - a.goalDifference || b.points - a.points);
    else sorted.sort((a, b) => b.won - a.won || b.points - a.points);
    return sorted.map((row, i) => ({ ...row, position: i + 1 }));
  }, [rows, sortBy]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || standings.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? 'No results recorded yet for this season.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.list}
      contentContainerStyle={styles.standingsContent}
      showsVerticalScrollIndicator={false}
    >
      {season ? <Text style={styles.seasonLabel}>{season} Season</Text> : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sortScroll}
        contentContainerStyle={styles.sortContent}
      >
        {([
          { key: 'pts' as StandingsSortKey, label: 'Points' },
          { key: 'gd' as StandingsSortKey, label: 'Goal Diff' },
          { key: 'w' as StandingsSortKey, label: 'Wins' },
        ]).map((s) => (
          <TouchableOpacity
            key={s.key}
            style={[styles.sortChip, sortBy === s.key && styles.sortChipActive]}
            onPress={() => setSortBy(s.key)}
          >
            <Text style={[styles.sortText, sortBy === s.key && styles.sortTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.tableHead}>
        <Text style={[styles.th, { width: 28 }]}>#</Text>
        <Text style={[styles.th, { flex: 1 }]}>Club</Text>
        <Text style={[styles.th, { width: 24, textAlign: 'center' }]}>P</Text>
        <Text style={[styles.th, { width: 24, textAlign: 'center' }]}>W</Text>
        <Text style={[styles.th, { width: 24, textAlign: 'center' }]}>D</Text>
        <Text style={[styles.th, { width: 24, textAlign: 'center' }]}>L</Text>
        <Text style={[styles.th, { width: 32, textAlign: 'center' }]}>GD</Text>
        <Text style={[styles.th, { width: 32, textAlign: 'center' }]}>Pts</Text>
      </View>
      {standings.map((s, i) => (
        <View
          key={s.club.id || s.club.name}
          style={[styles.row, i % 2 === 0 && styles.rowAlt, i < 3 && styles.rowTop]}
        >
          <Text
            style={[
              styles.cellPos,
              { width: 28 },
              i < 3 && { color: colors.fantasyGold, fontWeight: '900' },
            ]}
          >
            {s.position}
          </Text>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image
            source={Logos[s.club.id]}
            style={styles.clubLogo}
            resizeMode="contain"
            />
            <Text style={styles.cellClub} numberOfLines={1}>
              {s.club.shortName}
            </Text>
          </View>
          <Text style={[styles.cell, { width: 24, textAlign: 'center' }]}>{s.played}</Text>
          <Text style={[styles.cell, { width: 24, textAlign: 'center' }]}>{s.won}</Text>
          <Text style={[styles.cell, { width: 24, textAlign: 'center' }]}>{s.drawn}</Text>
          <Text style={[styles.cell, { width: 24, textAlign: 'center' }]}>{s.lost}</Text>
          <Text
            style={[
              styles.cellGd,
              { width: 32, textAlign: 'center' },
              s.goalDifference > 0 && { color: colors.win },
              s.goalDifference < 0 && { color: colors.loss },
            ]}
          >
            {s.goalDifference > 0 ? '+' : ''}{s.goalDifference}
          </Text>
          <Text style={[styles.cellPts, { width: 32, textAlign: 'center' }]}>{s.points}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: colors.black,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: fonts.display,
    color: colors.white,
    textTransform: 'uppercase',
  },
  currentBadge: {
    backgroundColor: colors.red,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.white,
    textTransform: 'uppercase',
  },
  dateSubtitle: {
    color: colors.grey1,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 6,
  },
  tableButton: {
    padding: 8,
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 4,
    borderRadius: 8,
    backgroundColor: colors.surface2,
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.yellow,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: fonts.display,
    color: colors.grey1,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
  },
  tabTextActive: {
    color: '#000000',
  },
  filterRow: {
  height: 40,
  marginBottom: 0,
  backgroundColor: colors.black,
  borderBottomWidth: 0,
  },
  filterContent: {
  paddingHorizontal: 12,
  paddingVertical: 2,
  gap: 4,
  alignItems: 'center',
  },
  filterChip: {
  paddingHorizontal: 22,
  paddingVertical: 10,
  borderRadius: 20,
  backgroundColor: colors.surface2,
  marginRight: 6,
  },
  filterChipActive: { backgroundColor: colors.yellow },
  filterText: { fontSize: 12, fontWeight: '600', color: colors.grey1 },
  filterTextActive: { color: '#000000' },
  list: { flex: 1 },
  listContent: {
  paddingHorizontal: 12,
  paddingTop: 0,
  paddingBottom: 24,
  gap: 6,
  },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.grey2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: colors.live, textAlign: 'center', paddingHorizontal: 32 },
  standingsContent: { padding: 16, paddingBottom: 40 },
  seasonLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.grey2,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
    marginBottom: 10,
  },
  sortScroll: { flexGrow: 0, marginBottom: 12 },
  sortContent: { alignItems: 'center', gap: 4 },
  sortChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  sortChipActive: { backgroundColor: colors.yellow, borderColor: colors.yellow },
  sortText: { fontSize: 12, fontWeight: '600', color: colors.grey1 },
  sortTextActive: { color: '#000000', fontWeight: '700' },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 4,
  },
  th: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: fonts.display,
    color: colors.grey2,
    textTransform: 'uppercase',
    letterSpacing: 0.08,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  rowAlt: { backgroundColor: colors.surface2 },
  rowTop: { backgroundColor: 'rgba(245,197,24,0.06)' },
  cell: { fontSize: 13, color: colors.grey1 },
  cellPts: { fontSize: 15, fontWeight: '900', color: colors.fantasyGold },
  cellPos: { fontSize: 12, fontWeight: '800', color: colors.grey2, fontFamily: fonts.display },
  cellClub: { fontSize: 13, fontWeight: '600', color: colors.white },
  cellGd: { fontSize: 12, fontWeight: '700', color: colors.grey2 },
  clubLogo: {
  width: 24,
  height: 24,
},
  });
}
