import React, { useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import MatchCard from '../shared/MatchCard';
import { Colors } from '../../constants/colors';
import { Match } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import type { HomeStackParamList } from '../../navigation/HomeStack';

interface TodayMatchesWidgetProps {
  matches: Match[];
}

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export default function TodayMatchesWidget({ matches }: TodayMatchesWidgetProps) {
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
      <Text style={styles.widgetTitle}>Today&apos;s Matches</Text>
      {matches.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No matches today</Text>
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
