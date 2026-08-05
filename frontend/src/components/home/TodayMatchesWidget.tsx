import React, { useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import MatchCard from '../shared/MatchCard';
import { Colors } from '../../constants/colors';
import { Match } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import type { HomeStackParamList } from '../../navigation/HomeStack';

interface TodayMatchesWidgetProps {
  matches: Match[];
  /** Defaults to "Today's Matches" - HomeScreen swaps this to "Upcoming
   *  Matches" when falling back to future fixtures because nothing's on
   *  today, so the heading doesn't claim these are happening today. */
  title?: string;
  emptyMessage?: string;
  /** True while HomeScreen is (re)fetching matches - shows a small gray
   *  loading pill under the title instead of silently swapping the list out
   *  from under the user once the fetch resolves (which, combined with the
   *  fallback between today's/upcoming matches, could read as the widget
   *  randomly reordering itself). */
  loading?: boolean;
}

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export default function TodayMatchesWidget({ matches, title = "Today's Matches", emptyMessage, loading = false }: TodayMatchesWidgetProps) {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const renderItem = useCallback(
    ({ item }: { item: Match }) => (
      <View style={styles.matchCardWrapper}>
        <MatchCard
          match={item}
          testID={`match-card-${item.id}`}
          onPress={() => navigation.navigate('MatchDetails', { matchId: item.id })}
        />
      </View>
    ),
    [navigation]
  );

  const keyExtractor = useCallback((item: Match) => String(item.id), []);

  return (
    <View style={styles.widget}>
      <Text style={styles.widgetTitle}>{title}</Text>
      {loading && (
        <View style={styles.loadingBar}>
          <ActivityIndicator size="small" color={colors.grey2} />
          <Text style={styles.loadingBarText}>Updating matches...</Text>
        </View>
      )}
      {matches.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{emptyMessage ?? 'No matches today'}</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          horizontal
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          removeClippedSubviews
        />
      )}
    </View>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    widget: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      marginBottom: 16,
    },
    widgetTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
    // Gray, deliberately understated - this is a background refresh
    // indicator, not a full loading state, so it shouldn't fight for
    // attention with the actual content still visible below it.
    loadingBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.surface2,
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginBottom: 12,
      alignSelf: 'flex-start',
    },
    loadingBarText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
    horizontalList: { paddingVertical: 4 },
    matchCardWrapper: { marginRight: 14 },
    emptyState: {
      backgroundColor: colors.primaryLight,
      borderRadius: 14,
      padding: 20,
      alignItems: 'center',
    },
    emptyText: { color: colors.textSecondary, fontWeight: '600' },
  });
}
