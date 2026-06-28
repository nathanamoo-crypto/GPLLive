import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
import { getScrollBottomPadding } from '../../constants/layout';
import { useAuthStore } from '../../store/authStore';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  badge?: string;
  color?: string;
  iconBg?: string;
  last?: boolean;
}

function MenuItem({ icon, label, onPress, badge, color = Colors.grey1, iconBg = Colors.surface2, last }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={[styles.menuItem]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.menuIconWrap, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuRight}>
        {badge && (
          <View style={styles.menuBadge}>
            <Text style={styles.menuBadgeText}>{badge}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={16} color={Colors.grey2} />
      </View>
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const resetOnboarding = useAuthStore((state) => state.resetOnboarding);
  const favouriteClub = user?.favouriteClub;

  const handleLogOut = () => {
    Alert.alert('Sign Out', 'You will return to the login screen.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => { void logout(); } },
    ]);
  };

  const handleReplayOnboarding = () => {
    Alert.alert('Replay Onboarding?', 'This will show the intro again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Replay',
        onPress: () => {
          void logout();
          resetOnboarding();
        },
      },
    ]);
  };

  const navigateToTabScreen = (tabName: string, screenName: string) => {
    navigation.dispatch(
      CommonActions.navigate({ name: tabName, params: { screen: screenName } })
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Join me on GPL Live — the ultimate Ghana Premier League experience! Download now.',
      });
    } catch { /* user cancelled */ }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 20, paddingBottom: getScrollBottomPadding(insets.bottom) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MORE</Text>
      </View>

      {/* Menu sections */}
      <View style={styles.menuSection}>
        <MenuItem
          icon="card-outline"
          label="My Subscriptions"
          onPress={() => navigateToTabScreen('Home', 'Subscribe')}
          color="#000000"
          iconBg={Colors.yellow}
        />
        <MenuItem
          icon="calendar-outline"
          label="Fixtures"
          onPress={() => navigateToTabScreen('Fixtures', 'FixturesRoot')}
          color={Colors.green}
          iconBg="#1A3A2A"
        />
        <MenuItem
          icon="trophy-outline"
          label="League Table"
          onPress={() => navigateToTabScreen('Fixtures', 'LeagueTable')}
          color={Colors.yellow}
          iconBg="#1A2A3A"
        />
        <MenuItem
          icon="people-outline"
          label="Fantasy League"
          onPress={() => navigateToTabScreen('Fantasy', 'FantasyRoot')}
          color={Colors.grey1}
          iconBg="#1A1A2A"
        />
        <MenuItem
          icon="checkbox-outline"
          label="Prediction League"
          onPress={() => navigateToTabScreen('Predict', 'PredictRoot')}
          color={Colors.red}
          iconBg="#3A1A1A"
        />
      </View>

      <View style={styles.menuSection}>
        <MenuItem
          icon="newspaper-outline"
          label="All News"
          onPress={() => navigateToTabScreen('News', 'NewsFeed')}
          color={Colors.green}
          iconBg="#1A2A1A"
        />
        <MenuItem
          icon="notifications-outline"
          label="Notifications"
          onPress={() => navigateToTabScreen('Home', 'NotificationInbox')}
          color={Colors.yellow}
          iconBg="#2A2A1A"
        />
        <MenuItem
          icon="search-outline"
          label="Search"
          onPress={() => navigateToTabScreen('Home', 'Search')}
          color={Colors.grey1}
          iconBg={Colors.surface2}
        />
      </View>

      <View style={styles.menuSection}>
        <MenuItem icon="share-outline" label="Share App" onPress={handleShare} color={Colors.yellow} iconBg="#1A2A1A" />
        <MenuItem
          icon="refresh-outline"
          label="Replay Onboarding"
          onPress={handleReplayOnboarding}
          color={Colors.yellow}
          iconBg="#1A1A1A"
        />
        <MenuItem icon="log-out-outline" label="Sign Out" onPress={handleLogOut} color={Colors.red} iconBg="#3A1A1A" last />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  content: { paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: fonts.display,
    color: Colors.white,
    textTransform: 'uppercase',
  },
  menuSection: { marginBottom: 12 },
  menuItem: {
    backgroundColor: Colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { fontSize: 15, fontWeight: '600', color: Colors.white },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuBadge: {
    backgroundColor: Colors.surface2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  menuBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.yellow },
});
