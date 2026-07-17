import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Colors } from '../../constants/colors';
import { DUMMY_STANDINGS } from '../../constants/homeDummyData';

export default function LeagueTableWidget() {
  return (
    <View style={styles.widget}>
      <Text style={styles.widgetTitle}>League Table</Text>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.positionCell]}>Pos</Text>
        <Text style={[styles.headerCell, styles.clubCell]}>Club</Text>
        <Text style={[styles.headerCell, styles.pointsCell]}>Pts</Text>
      </View>
      {DUMMY_STANDINGS.map((row) => (
        <View key={row.club.id} style={styles.row}>
          <Text style={[styles.cell, styles.positionCell]}>{row.position}</Text>
          <Text style={[styles.cell, styles.clubCell]} numberOfLines={1}>
            {row.club.name}
          </Text>
          <Text style={[styles.cell, styles.pointsCell, styles.pointsValue]}>{row.points}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  widget: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  widgetTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
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
