import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { GPL_CLUBS } from '../../constants/clubs';
import { fonts, getScrollBottomPadding } from '../../constants/layout';

type SortKey = 'pts' | 'gd' | 'w';

interface StandingRow {
  position: number;
  clubName: string;
  shortName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalDifference: number;
  points: number;
}

const MOCK_STANDINGS: StandingRow[] = GPL_CLUBS.map((club, i) => ({
  position: i + 1,
  clubName: club.name,
  shortName: club.shortName,
  played: 24 - Math.floor(i / 3),
  won: 14 - i + Math.floor(i / 4),
  drawn: 6 + Math.floor(i / 3) - Math.floor(i / 5),
  lost: 4 + Math.floor(i / 2) - Math.floor(i / 6),
  goalDifference: 12 - i * 2 + Math.floor(i / 4),
  points: 50 - i * 4 + Math.floor(i / 3),
})).sort((a, b) => b.points - a.points)
  .map((row, i) => ({ ...row, position: i + 1 }));

export default function LeagueTableScreen() {
  const insets = useSafeAreaInsets();
  const [sortBy, setSortBy] = useState<SortKey>('pts');

  const sorted = useMemo(() => {
    const data = [...MOCK_STANDINGS];
    if (sortBy === 'pts') data.sort((a, b) => b.points - a.points);
    else if (sortBy === 'gd') data.sort((a, b) => b.goalDifference - a.goalDifference);
    else data.sort((a, b) => b.won - a.won);
    return data.map((row, i) => ({ ...row, position: i + 1 }));
  }, [sortBy]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>League Table</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sortRow}
        contentContainerStyle={styles.sortContent}
      >
        {([
          { key: 'pts' as SortKey, label: 'Points' },
          { key: 'gd' as SortKey, label: 'Goal Diff' },
          { key: 'w' as SortKey, label: 'Wins' },
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

      <ScrollView
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: getScrollBottomPadding(insets.bottom) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {sorted.map((s, i) => {
          const isTop = i < 3;
          return (
            <View
              key={s.shortName}
              style={[styles.row, i % 2 === 0 && styles.rowAlt, isTop && styles.rowTop]}
            >
              <Text
                style={[
                  styles.cellPos,
                  { width: 28 },
                  isTop && { color: Colors.fantasyGold, fontWeight: '900' },
                ]}
              >
                {s.position}
              </Text>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.badgeSmall}>
                  <Text style={styles.badgeSmallText}>
                    {s.shortName.slice(0, 2)}
                  </Text>
                </View>
                <Text style={styles.cellClub} numberOfLines={1}>
                  {s.shortName}
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
                  s.goalDifference > 0 && { color: Colors.win },
                  s.goalDifference < 0 && { color: Colors.loss },
                ]}
              >
                {s.goalDifference > 0 ? '+' : ''}{s.goalDifference}
              </Text>
              <Text style={[styles.cellPts, { width: 32, textAlign: 'center' }]}>{s.points}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.black,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: fonts.display,
    color: Colors.white,
    textTransform: 'uppercase',
  },
  sortRow: { backgroundColor: Colors.black, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sortContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  sortChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  sortChipActive: { backgroundColor: Colors.yellow, borderColor: Colors.yellow },
  sortText: { fontSize: 13, fontWeight: '600', color: Colors.grey1 },
  sortTextActive: { color: '#000000', fontWeight: '700' },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  th: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: fonts.display,
    color: Colors.grey2,
    textTransform: 'uppercase',
    letterSpacing: 0.08,
  },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 12, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface2,
  },
  rowAlt: { backgroundColor: Colors.surface2 },
  rowTop: { borderLeftWidth: 3, borderLeftColor: Colors.yellow, paddingLeft: 8 },
  cell: { fontSize: 12, color: Colors.grey1, textAlign: 'center' },
  cellGd: { fontSize: 12, fontWeight: '700', color: Colors.grey2, textAlign: 'center' },
  cellPts: { fontSize: 16, fontWeight: '800', color: Colors.fantasyGold, fontFamily: fonts.display, textAlign: 'center' },
  cellPos: { fontSize: 12, fontWeight: '800', color: Colors.grey2, fontFamily: fonts.display },
  cellClub: { fontSize: 13, fontWeight: '600', color: Colors.white },
  badgeSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSmallText: { fontSize: 9, fontWeight: '800', color: Colors.yellow },
});
