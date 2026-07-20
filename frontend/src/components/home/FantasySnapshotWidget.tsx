import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { getMyTeam } from '../../services/fantasyService';
import type { FantasyTeam } from '../../types';

export default function FantasySnapshotWidget() {
  // Cross-tab navigation (Home -> Games), same pattern ProfileScreen's "My
  // Team" link uses - FantasyRoot does its own fresh check of whether a
  // squad exists and shows the Squad Builder or the pitch view accordingly,
  // so this widget doesn't need to know which one applies.
  const navigation = useNavigation<any>();
  const [team, setTeam] = useState<FantasyTeam | null>(null);
  // Only ever set to false (see below) - after the first successful fetch
  // it stays false permanently, so later re-fetches on refocus update the
  // widget's content quietly instead of flashing it back to a spinner,
  // which would read as janky rather than smooth.
  const [loading, setLoading] = useState(true);

  // Bottom-tab screens stay mounted when you switch away from them, so a
  // plain mount-only fetch never re-ran after creating a team elsewhere and
  // coming back to Home - this widget kept showing "Create your fantasy
  // team" until a full app reload. useFocusEffect re-fetches every time the
  // Home tab actually comes into view instead.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getMyTeam()
        .then((data) => { if (!cancelled) setTeam(data); })
        .catch(() => { if (!cancelled) setTeam(null); })
        .finally(() => { if (!cancelled) setLoading(false); });
      return () => { cancelled = true; };
    }, [])
  );

  const goToFantasy = () => {
    navigation.navigate('Games', { screen: 'GamesRoot', params: { defaultTab: 'fantasy' } });
  };

  if (loading) {
    return (
      <View style={styles.widget}>
        <Text style={styles.widgetTitle}>Fantasy Snapshot</Text>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.widget} activeOpacity={0.7} onPress={goToFantasy}>
      <View style={styles.titleRow}>
        <Text style={styles.widgetTitle}>Fantasy Snapshot</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      </View>
      {team ? (
        <>
          <Text style={styles.teamName}>{team.teamName}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Budget Left</Text>
              <Text
                style={styles.statValue}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                GH₵{team.budget.toFixed(1)}m
              </Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Squad</Text>
              <Text
                style={styles.statValue}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {team.players.length}/15
              </Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Free Transfers</Text>
              <Text
                style={styles.statValue}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {team.freeTransfers}
              </Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.cta}>
          <Text style={styles.ctaText}>Create your fantasy team</Text>
        </View>
      )}
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
  teamName: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBlock: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  cta: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: { color: Colors.textInverse, fontWeight: '700' },
});
