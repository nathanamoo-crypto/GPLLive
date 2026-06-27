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
import { getScrollBottomPadding } from '../../constants/layout';

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
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  sortRow: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sortContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  sortChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    marginRight: 8,
  },
  sortChipActive: { backgroundColor: Colors.primary },
  sortText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  sortTextActive: { color: Colors.textInverse },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  th: { fontSize: 11, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase' },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 12, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  rowAlt: { backgroundColor: Colors.surfaceAlt },
  rowTop: { backgroundColor: 'rgba(255,215,0,0.06)' },
  cell: { fontSize: 13, color: Colors.textSecondary },
  cellGd: { fontSize: 13, fontWeight: '700', color: Colors.textTertiary },
  cellPts: { fontSize: 16, fontWeight: '900', color: Colors.fantasyGold },
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
