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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { GPL_CLUBS } from '../../constants/clubs';
import { fonts, getScrollBottomPadding } from '../../constants/layout';
import type { Match } from '../../types';
import type { FixturesStackParamList } from '../../navigation/FixturesStack';
import FixtureRow from '../../components/shared/FixtureRow';
import { Logos } from '../../constants/logos';
import { getMatches } from '../../services/matchService';

type FixturesNavProp = NativeStackNavigationProp<FixturesStackParamList, 'FixturesRoot'>;

const FILTER_OPTIONS = ['All', 'Live', 'Scheduled', 'FT'] as const;

export default function FixturesRoot() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<FixturesNavProp>();
  const [filter, setFilter] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'fixtures' | 'table'>('fixtures');
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
            color={currentGameweek === gameweeks[gameweeks.length - 1] ? Colors.surface2 : Colors.grey1}
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
            color={currentGameweek === gameweeks[0] ? Colors.surface2 : Colors.grey1}
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
          <ActivityIndicator size="large" color={Colors.primary} />
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
                <Ionicons name="calendar-outline" size={48} color={Colors.textTertiary} />
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

function StandingsView() {
  const standings = useMemo(() => {
    const clubs = GPL_CLUBS;
    return clubs.map((club, i) => ({
      position: i + 1,
      club,
      played: 24 - i,
      won: 15 - i,
      drawn: 5 + Math.floor(i / 2),
      lost: 4 + Math.floor(i / 3),
      goalDifference: 12 - i * 2,
      points: 50 - i * 4,
      form: (['W', 'W', 'D', 'L', 'W'] as const).map((f) =>
        Math.random() > 0.3 ? f : f === 'W' ? 'L' : 'W'
      ),
    }));
  }, []);

  return (
    <ScrollView
      style={styles.list}
      contentContainerStyle={styles.standingsContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.tableHead}>
        <Text style={[styles.th, { width: 28 }]}>#</Text>
        <Text style={[styles.th, { flex: 1 }]}>Club</Text>
        <Text style={[styles.th, { width: 24, textAlign: 'center' }]}>P</Text>
        <Text style={[styles.th, { width: 24, textAlign: 'center' }]}>W</Text>
        <Text style={[styles.th, { width: 24, textAlign: 'center' }]}>D</Text>
        <Text style={[styles.th, { width: 24, textAlign: 'center' }]}>L</Text>
        <Text style={[styles.th, { width: 32, textAlign: 'center' }]}>Pts</Text>
      </View>
      {standings.map((s, i) => (
        <View
          key={s.club.id}
          style={[styles.row, i % 2 === 0 && styles.rowAlt, i < 3 && styles.rowTop]}
        >
          <Text
            style={[
              styles.cellPos,
              { width: 28 },
              i < 3 && { color: Colors.fantasyGold, fontWeight: '900' },
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
          <Text style={[styles.cellPts, { width: 32, textAlign: 'center' }]}>{s.points}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: Colors.black,
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
    color: Colors.white,
    textTransform: 'uppercase',
  },
  currentBadge: {
    backgroundColor: Colors.red,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.white,
    textTransform: 'uppercase',
  },
  dateSubtitle: {
    color: Colors.grey1,
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
    backgroundColor: Colors.surface2,
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
    backgroundColor: Colors.yellow,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: fonts.display,
    color: Colors.grey1,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
  },
  tabTextActive: {
    color: '#000000',
  },
  filterRow: {
  height: 40,
  marginBottom: 0,
  backgroundColor: Colors.black,
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
  backgroundColor: Colors.surface2,
  marginRight: 6,
  },
  filterChipActive: { backgroundColor: Colors.yellow },
  filterText: { fontSize: 12, fontWeight: '600', color: Colors.grey1 },
  filterTextActive: { color: '#000000' },
  list: { flex: 1 },
  listContent: {
  paddingHorizontal: 12,
  paddingTop: 0,
  paddingBottom: 24,
  gap: 6,
  },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.grey2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: Colors.live, textAlign: 'center', paddingHorizontal: 32 },
  standingsContent: { padding: 16, paddingBottom: 40 },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 4,
  },
  th: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: fonts.display,
    color: Colors.grey2,
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
  rowAlt: { backgroundColor: Colors.surface2 },
  rowTop: { backgroundColor: 'rgba(245,197,24,0.06)' },
  cell: { fontSize: 13, color: Colors.grey1 },
  cellPts: { fontSize: 15, fontWeight: '900', color: Colors.fantasyGold },
  cellPos: { fontSize: 12, fontWeight: '800', color: Colors.grey2, fontFamily: fonts.display },
  cellClub: { fontSize: 13, fontWeight: '600', color: Colors.white },
  clubLogo: {
  width: 24,
  height: 24,
},
});
