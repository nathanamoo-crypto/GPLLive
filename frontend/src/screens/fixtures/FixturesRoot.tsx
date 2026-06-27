import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { GPL_CLUBS } from '../../constants/clubs';
import { getScrollBottomPadding } from '../../constants/layout';
import type { Match } from '../../types';
import type { FixturesStackParamList } from '../../navigation/FixturesStack';

type FixturesNavProp = NativeStackNavigationProp<FixturesStackParamList, 'FixturesRoot'>;

/**
 * TODO: Replace with API call — see APIDocs.md → GET /matches
 */
const MOCK_MATCHES: Match[] = [
  {
    id: 'f1',
    homeClub: GPL_CLUBS[0],
    awayClub: GPL_CLUBS[1],
    homeScore: 2,
    awayScore: 1,
    status: 'live',
    kickoffTime: new Date().toISOString(),
    liveMinute: 67,
    venue: 'Baba Yara Stadium',
    round: 24,
    gameweek: 24,
  },
  {
    id: 'f2',
    homeClub: GPL_CLUBS[2],
    awayClub: GPL_CLUBS[3],
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    kickoffTime: new Date(Date.now() + 7200000).toISOString(),
    venue: 'TNA Park',
    round: 24,
    gameweek: 24,
  },
  {
    id: 'f3',
    homeClub: GPL_CLUBS[4],
    awayClub: GPL_CLUBS[5],
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    kickoffTime: new Date(Date.now() + 14400000).toISOString(),
    venue: 'Agyeman Badu Stadium',
    round: 24,
    gameweek: 24,
  },
  {
    id: 'f4',
    homeClub: GPL_CLUBS[6],
    awayClub: GPL_CLUBS[7],
    homeScore: 3,
    awayScore: 0,
    status: 'ft',
    kickoffTime: new Date(Date.now() - 86400000).toISOString(),
    venue: 'Accra Sports Stadium',
    round: 23,
    gameweek: 23,
  },
  {
    id: 'f5',
    homeClub: GPL_CLUBS[8],
    awayClub: GPL_CLUBS[9],
    homeScore: 1,
    awayScore: 1,
    status: 'ft',
    kickoffTime: new Date(Date.now() - 86400000).toISOString(),
    venue: 'Tamale Stadium',
    round: 23,
    gameweek: 23,
  },
  {
    id: 'f6',
    homeClub: GPL_CLUBS[10],
    awayClub: GPL_CLUBS[11],
    homeScore: 0,
    awayScore: 2,
    status: 'ft',
    kickoffTime: new Date(Date.now() - 172800000).toISOString(),
    venue: 'Obuasi Stadium',
    round: 22,
    gameweek: 22,
  },
];

const FILTER_OPTIONS = ['All', 'Live', 'Scheduled', 'FT'] as const;

export default function FixturesRoot() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<FixturesNavProp>();
  const [filter, setFilter] = useState<string>('All');
  const [showStandings, setShowStandings] = useState(false);

  const filtered = useMemo(() => {
    if (filter === 'All') return MOCK_MATCHES;
    if (filter === 'Live') return MOCK_MATCHES.filter((m) => m.status === 'live');
    if (filter === 'Scheduled') return MOCK_MATCHES.filter((m) => m.status === 'scheduled');
    return MOCK_MATCHES.filter((m) => m.status === 'ft');
  }, [filter]);

  const formatKickoff = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fixtures</Text>
        <TouchableOpacity
          style={styles.tableButton}
          onPress={() => setShowStandings(!showStandings)}
        >
          <Ionicons
            name={showStandings ? 'calendar' : 'trophy'}
            size={18}
            color={Colors.textPrimary}
          />
          <Text style={styles.tableButtonText}>
            {showStandings ? 'Fixtures' : 'Table'}
          </Text>
        </TouchableOpacity>
      </View>

      {showStandings ? (
        <StandingsView />
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterRow}
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
                <TouchableOpacity
                  key={match.id}
                  style={[
                    styles.matchCard,
                    match.status === 'live' && styles.matchCardLive,
                  ]}
                  onPress={() =>
                    navigation.navigate('MatchDetails', { matchId: match.id })
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.matchHeader}>
                    <View style={styles.dateRow}>
                      <Text style={styles.dateText}>{formatDate(match.kickoffTime)}</Text>
                      <Text style={styles.dot}>·</Text>
                      <Text style={styles.venueText}>{match.venue}</Text>
                    </View>
                    {match.status === 'live' && (
                      <View style={styles.liveBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE {match.liveMinute}'</Text>
                      </View>
                    )}
                    {match.status === 'ft' && (
                      <Text style={styles.ftText}>FT</Text>
                    )}
                  </View>

                  <View style={styles.scoreRow}>
                    <View style={styles.teamBlock}>
                      <View style={styles.badge}>
                        <Text style={styles.badgeLabel}>
                          {match.homeClub.shortName.slice(0, 2)}
                        </Text>
                      </View>
                      <Text style={styles.teamName} numberOfLines={1}>
                        {match.homeClub.shortName}
                      </Text>
                    </View>

                    <View style={styles.scoreBlock}>
                      {match.homeScore !== null ? (
                        <Text style={styles.scoreText}>
                          {match.homeScore} - {match.awayScore}
                        </Text>
                      ) : (
                        <Text style={styles.timeText}>{formatKickoff(match.kickoffTime)}</Text>
                      )}
                    </View>

                    <View style={styles.teamBlock}>
                      <View style={styles.badge}>
                        <Text style={styles.badgeLabel}>
                          {match.awayClub.shortName.slice(0, 2)}
                        </Text>
                      </View>
                      <Text style={styles.teamName} numberOfLines={1}>
                        {match.awayClub.shortName}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
}

function StandingsView() {
  const standings = useMemo(() => {
    const clubs = GPL_CLUBS.slice(0, 10);
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
            <View style={styles.badgeSmall}>
              <Text style={styles.badgeSmallText}>
                {s.club.shortName.slice(0, 2)}
              </Text>
            </View>
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
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  tableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 20,
  },
  tableButtonText: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  filterRow: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 6 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.surfaceAlt,
    marginRight: 6,
  },
  filterChipActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: Colors.textInverse },
  list: { flex: 1 },
  listContent: { padding: 12, gap: 8 },
  matchCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  matchCardLive: { borderColor: Colors.live },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 12, color: Colors.textTertiary, fontWeight: '600' },
  dot: { color: Colors.textTertiary },
  venueText: { fontSize: 12, color: Colors.textTertiary, flexShrink: 1 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.live,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.textInverse },
  liveText: { fontSize: 11, fontWeight: '700', color: Colors.textInverse },
  ftText: { fontSize: 11, fontWeight: '700', color: Colors.textTertiary },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teamBlock: { flex: 1, alignItems: 'center' },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  badgeLabel: { fontSize: 11, fontWeight: '800', color: Colors.primary },
  teamName: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },
  scoreBlock: { paddingHorizontal: 8, alignItems: 'center', minWidth: 60 },
  scoreText: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  timeText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textTertiary },
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
  th: { fontSize: 11, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  rowAlt: { backgroundColor: Colors.surfaceAlt },
  rowTop: { backgroundColor: 'rgba(255,215,0,0.06)' },
  cell: { fontSize: 13, color: Colors.textSecondary },
  cellPts: { fontSize: 15, fontWeight: '900', color: Colors.fantasyGold },
  cellPos: { fontSize: 12, fontWeight: '800', color: Colors.textTertiary, fontFamily: 'monospace' },
  cellClub: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  badgeSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSmallText: { fontSize: 9, fontWeight: '800', color: Colors.primary },
});
