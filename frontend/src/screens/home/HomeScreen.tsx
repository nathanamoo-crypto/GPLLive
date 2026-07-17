import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image,
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
import { fonts, getScrollBottomPadding } from '../../constants/layout';
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
      <View style={styles.logoRow}>
        <Image
          source={require('../../../assets/GplLogo1.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />

        <Text style={styles.logo}>
          GPL <Text style={styles.logoLIVE}>LIVE</Text>
        </Text>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search" size={22} color={Colors.grey1} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('NotificationInbox')}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={Colors.grey1}
          />
          {unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>
    </View>

    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: getScrollBottomPadding(insets.bottom) },
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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
  container: { flex: 1, backgroundColor: Colors.black },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.black,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  glBadge: {
    backgroundColor: Colors.yellow,
    borderRadius: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glBadgeText: {
    fontFamily: fonts.display,
    fontWeight: '800',
    fontSize: 14,
    color: '#000000',
  },
  logo: {
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
  },
  logoLIVE: {
    color: Colors.yellow,
  },

  logoImage: {
  width: 38,
  height: 38,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: { padding: 6 },
  unreadBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.red,
    borderRadius: 8,
    paddingHorizontal: 5,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  content: { paddingHorizontal: 16, paddingBottom: 80 },
});
