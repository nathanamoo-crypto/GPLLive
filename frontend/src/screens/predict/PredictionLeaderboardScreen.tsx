import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { getPredictionLeaderboard } from '../../services/predictionService';
import type { GamesStackParamList } from '../../navigation/GamesStack';
import type { PredictionLeaderboardEntry } from '../../types';

type NavProp = NativeStackNavigationProp<GamesStackParamList>;

export default function PredictionLeaderboardScreen() {
  const navigation = useNavigation<NavProp>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const username = useAuthStore((state) => state.user?.username);

  const [entries, setEntries] = useState<PredictionLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPredictionLeaderboard();
      setEntries(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load the leaderboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prediction Leaderboard</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading && entries.length === 0 ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.centerBox}>
          <Text style={styles.emptyText}>No one has made a prediction yet - be the first!</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => String(item.userId)}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
          renderItem={({ item }) => {
            const isMe = item.username === username;
            return (
              <View style={[styles.row, isMe && styles.rowActive]}>
                <Text style={[styles.rank, isMe && styles.textActive]}>#{item.rank}</Text>
                <Text style={[styles.username, isMe && styles.textActive]} numberOfLines={1}>
                  {item.username}
                  {isMe ? ' (You)' : ''}
                </Text>
                {item.predictionStreak >= 3 ? (
                  <Ionicons name="flame" size={14} color={isMe ? colors.textInverse : colors.primary} style={styles.streakIcon} />
                ) : null}
                <Text style={[styles.points, isMe && styles.textActive]}>{item.predictionPoints} pts</Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
    listContent: { padding: 16 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    rowActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    rank: { width: 40, fontSize: 14, fontWeight: '800', color: colors.textSecondary },
    username: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.textPrimary },
    streakIcon: { marginRight: 8 },
    points: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
    textActive: { color: colors.textInverse },
    centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    errorText: { color: colors.live, fontSize: 13, marginBottom: 8, textAlign: 'center' },
    retryText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
    emptyText: { color: colors.textSecondary, fontSize: 13, textAlign: 'center' },
  });
}
