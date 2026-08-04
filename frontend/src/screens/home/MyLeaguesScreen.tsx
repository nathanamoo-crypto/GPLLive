import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { radius } from '../../constants/layout';
import { useTheme } from '../../context/ThemeContext';
import { getApiErrorMessage } from '../../services/api';
import { getMyLeagues } from '../../services/leagueService';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import type { League } from '../../types';

type NavProp = NativeStackNavigationProp<HomeStackParamList, 'MyLeagues'>;

// Direct entry point into the leagues a user owns or has joined - previously
// this was only reachable by opening Search and scrolling past the "My
// Leagues" section there. This screen is just that list, front and center,
// plus the same "+" create shortcut and a link into Search for finding more.
export default function MyLeaguesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getMyLeagues();
      setLeagues(data);
      setError(null);
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Could not load your leagues.'));
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  // Membership can change elsewhere (accepted request, left a league) -
  // refresh whenever this screen regains focus, same pattern as Search.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const renderLeagueCard = ({ item }: { item: League }) => (
    <TouchableOpacity
      style={styles.resultCard}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('LeagueDetail', { leagueId: item.id })}
    >
      <View style={[styles.resultIcon, { backgroundColor: colors.yellow + '18' }]}>
        <Ionicons name={item.isPublic ? 'earth-outline' : 'lock-closed-outline'} size={18} color={colors.yellow} />
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultLabel} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.resultSub}>
          {item.activeMemberCount}/{item.memberLimit} members · by {item.creatorUsername}
        </Text>
      </View>
      <Text style={styles.tag}>{item.callerStatus === 'OWNER' ? 'Owner' : 'Joined'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Leagues</Text>
        <TouchableOpacity
          style={styles.createIconButton}
          onPress={() => navigation.navigate('CreateLeague')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="add" size={24} color={colors.black} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          data={leagues}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderLeagueCard}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={colors.grey2} />
              <Text style={styles.emptyText}>You haven't joined or created a league yet.</Text>
              <TouchableOpacity style={styles.findButton} onPress={() => navigation.navigate('Search')}>
                <Text style={styles.findButtonText}>Find a league</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.black },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: { padding: 4 },
    headerTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: colors.white, textTransform: 'uppercase', letterSpacing: 0.05 },
    createIconButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.yellow,
      alignItems: 'center',
      justifyContent: 'center',
    },
    list: { flex: 1 },
    listContent: { padding: 16, gap: 8 },
    resultCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: radius.card,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
    },
    resultIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    resultInfo: { flex: 1 },
    resultLabel: { fontSize: 15, fontWeight: '700', color: colors.white },
    resultSub: { fontSize: 12, color: colors.grey2, marginTop: 2 },
    tag: { fontSize: 11, fontWeight: '700', color: colors.win },
    emptyState: { alignItems: 'center', paddingTop: 80, gap: 12, paddingHorizontal: 24 },
    emptyText: { fontSize: 14, color: colors.grey2, textAlign: 'center' },
    findButton: {
      marginTop: 8,
      backgroundColor: colors.yellow,
      borderRadius: radius.card,
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    findButtonText: { fontSize: 13, fontWeight: '800', color: colors.black },
  });
}
