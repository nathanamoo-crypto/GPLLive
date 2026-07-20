import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { fetchStandings } from '../../services/standingsService';
import type { StandingRow } from '../../types';

const WIDGET_ROW_COUNT = 5;

interface Props {
  // Bumped by HomeScreen's pull-to-refresh so this widget re-fetches
  // instead of only ever showing whatever it loaded on first mount.
  refreshTrigger?: number;
}

export default function LeagueTableWidget({ refreshTrigger = 0 }: Props) {
  // Cross-tab navigation (Home -> Fixtures), same pattern ProfileScreen
  // uses for its own "League Table" link - typed loosely since it's
  // reaching into a sibling tab's nested stack, not this tab's own.
  const navigation = useNavigation<any>();
  const [rows, setRows] = useState<StandingRow[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchStandings(undefined, controller.signal)
      .then((data) => setRows(data.rows.slice(0, WIDGET_ROW_COUNT)))
      .catch(() => { /* widget just stays empty - Fixtures tab has the full table */ });
    return () => controller.abort();
  }, [refreshTrigger]);

  if (rows.length === 0) return null;

  const goToFullTable = () => {
    navigation.navigate('Fixtures', { screen: 'FixturesRoot', params: { defaultTab: 'table' } });
  };

  return (
    <TouchableOpacity style={styles.widget} activeOpacity={0.7} onPress={goToFullTable}>
      <View style={styles.titleRow}>
        <Text style={styles.widgetTitle}>League Table</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      </View>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.positionCell]}>Pos</Text>
        <Text style={[styles.headerCell, styles.clubCell]}>Club</Text>
        <Text style={[styles.headerCell, styles.pointsCell]}>Pts</Text>
      </View>
      {rows.map((row) => (
        <View key={row.club.id || row.club.name} style={styles.row}>
          <Text style={[styles.cell, styles.positionCell]}>{row.position}</Text>
          <Text style={[styles.cell, styles.clubCell]} numberOfLines={1}>
            {row.club.name}
          </Text>
          <Text style={[styles.cell, styles.pointsCell, styles.pointsValue]}>{row.points}</Text>
        </View>
      ))}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  widget: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  widgetTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerCell: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  cell: { fontSize: 13, color: Colors.textPrimary },
  positionCell: { width: 36 },
  clubCell: { flex: 1, paddingRight: 8 },
  pointsCell: { width: 40, textAlign: 'right' },
  pointsValue: { fontWeight: '700' },
});
