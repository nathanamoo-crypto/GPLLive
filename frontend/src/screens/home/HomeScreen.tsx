import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import TodayMatchesWidget from '../../components/home/TodayMatchesWidget';
import LatestNewsWidget from '../../components/home/LatestNewsWidget';
import LeagueTableWidget from '../../components/home/LeagueTableWidget';
import FantasySnapshotWidget from '../../components/home/FantasySnapshotWidget';
import PredictionLeaderboardTeaser from '../../components/home/PredictionLeaderboardTeaser';
import { DUMMY_MATCHES } from '../../constants/homeDummyData';
import { Colors } from '../../constants/colors';
import { getScrollBottomPadding } from '../../constants/layout';
import { useAuthStore } from '../../store/authStore';
import { useNotifications } from '../../hooks/useNotifications';
import type { HomeStackParamList } from '../../navigation/HomeStack';

type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeFeed'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const { unreadCount } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setRefreshing(false);
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.headerBar, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.logo}>GPL Live</Text>
        <TouchableOpacity
          style={styles.bellButton}
          onPress={() => navigation.navigate('NotificationInbox')}
        >
          <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
          {unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: getScrollBottomPadding(insets.bottom) },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.greeting}>Hello, {user?.username ?? 'Fan'} 👋</Text>

        <TodayMatchesWidget matches={DUMMY_MATCHES} />
        <LatestNewsWidget />
        <LeagueTableWidget />
        <FantasySnapshotWidget />
        <PredictionLeaderboardTeaser />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logo: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  bellButton: { padding: 8 },
  unreadBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.live,
    borderRadius: 8,
    paddingHorizontal: 5,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: { color: Colors.textInverse, fontSize: 10, fontWeight: '700' },
  content: { padding: 16 },
  greeting: { fontSize: 16, color: Colors.textSecondary, marginBottom: 16 },
});
