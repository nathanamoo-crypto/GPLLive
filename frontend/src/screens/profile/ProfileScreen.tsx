import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
import { getScrollBottomPadding } from '../../constants/layout';
import { useAuthStore } from '../../store/authStore';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  accent?: boolean;
}

function MenuGroup({ title, items }: { title?: string; items: MenuItem[] }) {
  return (
    <View style={styles.section}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      <View style={styles.sectionContent}>
        {items.map((item, idx) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.option, idx === items.length - 1 && styles.optionLast]}
            onPress={item.onPress}
          >
            <View style={styles.optionLeft}>
              <Ionicons name={item.icon} size={18} color={item.accent ? Colors.yellow : Colors.grey1} />
              <Text style={[styles.optionText, item.accent && styles.optionTextAccent]}>
                {item.label}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.grey2} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const resetOnboarding = useAuthStore((state) => state.resetOnboarding);
  // "My Team" used to push straight into the pitch-view screen, which just
  // shows a dead-end "No Squad Yet" message for anyone who hasn't built a
  // squad yet (and the store's hasSquad flag can be stale right after a
  // fresh app launch, before anything has fetched it). Route to the Games >
  // Fantasy tab instead - FantasyRoot does its own fresh check of whether a
  // squad exists and shows the Squad Builder or the pitch view accordingly.
  const handleMyTeamPress = useCallback(() => {
    navigation.navigate('Games', { screen: 'GamesRoot', params: { defaultTab: 'fantasy' } });
  }, [navigation]);

  const handleLogOut = useCallback(() => {
    Alert.alert('Log out?', 'You will return to the login screen.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => { void logout(); } },
    ]);
  }, [logout]);

  const handleReplayOnboarding = useCallback(() => {
    Alert.alert('Replay onboarding?', 'This will show the splash and onboarding slides again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Replay', onPress: () => { void logout(); resetOnboarding(); } },
    ]);
  }, [logout, resetOnboarding]);

  const handleShare = useCallback(() => {
    void Share.share({ message: 'Join me on GPL Live — the ultimate Ghana Premier League companion app!' });
  }, []);

  const showComingSoon = useCallback((feature: string) => {
    Alert.alert('Coming Soon', `${feature} will be available in an upcoming update.`);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 24,
          paddingBottom: getScrollBottomPadding(insets.bottom),
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>Profile</Text>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.username ?? 'GL').slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.cardText}>
          <Text style={styles.name}>{user?.username ?? 'GPL Fan'}</Text>
          <Text style={styles.subtext}>
            {user?.favouriteClub?.name ?? 'No club selected'}
          </Text>
        </View>
      </View>

      <MenuGroup
        title="GPL Live Pro"
        items={[
          { icon: 'diamond-outline', label: 'Subscribe', onPress: () => navigation.navigate('Home', { screen: 'Subscribe' }) },
          { icon: 'card-outline', label: 'Payment Methods', onPress: () => navigation.navigate('Home', { screen: 'Payment' }) },
        ]}
      />

      <MenuGroup
        title="Football"
        items={[
          { icon: 'calendar-outline', label: 'Fixtures', onPress: () => navigation.navigate('Fixtures') },
          {
            icon: 'trophy-outline',
            label: 'League Table',
            onPress: () =>
              navigation.navigate('Fixtures', { screen: 'FixturesRoot', params: { defaultTab: 'table' } }),
          },
          { icon: 'newspaper-outline', label: 'All News', onPress: () => navigation.navigate('News') },
          { icon: 'search-outline', label: 'News Search', onPress: () => navigation.navigate('Home', { screen: 'Search' }) },
        ]}
      />

      <MenuGroup
        title="Games"
        items={[
          { icon: 'game-controller-outline', label: 'Fantasy League', onPress: () => navigation.navigate('Games') },
          { icon: 'people-outline', label: 'My Team', onPress: handleMyTeamPress, accent: true },
          { icon: 'bulb-outline', label: 'Predictions', onPress: () => navigation.navigate('Games', { screen: 'GamesRoot', params: { defaultTab: 'predictions' } }) },
        ]}
      />

      <MenuGroup
        title="App"
        items={[
          { icon: 'notifications-outline', label: 'Notifications', onPress: () => navigation.navigate('Home', { screen: 'NotificationInbox' }) },
          { icon: 'share-outline', label: 'Share GPL Live', onPress: handleShare },
          { icon: 'refresh-outline', label: 'Replay Onboarding', onPress: handleReplayOnboarding },
          { icon: 'log-out-outline', label: 'Log Out', onPress: handleLogOut },
        ]}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  content: { paddingHorizontal: 24 },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: fonts.display,
    marginBottom: 24,
    color: Colors.white,
    textTransform: 'uppercase',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: radius.card,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: { color: '#000000', fontSize: 24, fontWeight: '800' },
  cardText: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: Colors.white },
  subtext: { fontSize: 14, color: Colors.grey1, marginTop: 4 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: fonts.bodySemiBold,
    color: Colors.grey2,
    textTransform: 'uppercase',
    letterSpacing: 0.08,
    marginBottom: 8,
    paddingLeft: 4,
  },
  sectionContent: {
    backgroundColor: Colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
  },
  optionLast: { borderBottomWidth: 0 },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionText: { fontSize: 15, fontFamily: fonts.body, color: Colors.white },
  optionTextAccent: { color: Colors.yellow, fontFamily: fonts.bodySemiBold },
});
