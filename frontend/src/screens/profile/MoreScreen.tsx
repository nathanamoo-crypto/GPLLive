import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { getScrollBottomPadding } from '../../constants/layout';
import { useAuthStore } from '../../store/authStore';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  badge?: string;
  color?: string;
  last?: boolean;
}

function MenuItem({ icon, label, onPress, badge, color = Colors.textPrimary, last }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, last && styles.menuItemLast]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.menuIconWrap, { backgroundColor: color + '18' }]}>
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
        <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
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
      {/* User card */}
      <TouchableOpacity
        style={styles.userCard}
        activeOpacity={0.7}
        onPress={() => Alert.alert('GPL Live', user?.username ?? 'GPL Fan')}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.username ?? 'GL').slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.username ?? 'GPL Fan'}</Text>
          <Text style={styles.userClub}>
            {favouriteClub ? favouriteClub.name : 'Pick your club'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.fantasyRank ?? '–'}</Text>
          <Text style={styles.statLabel}>Fantasy Rank</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.predictionPoints ?? 0}</Text>
          <Text style={styles.statLabel}>Prediction Pts</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.reactionsPosted ?? 0}</Text>
          <Text style={styles.statLabel}>Reactions</Text>
        </View>
      </View>

      {/* Menu sections */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionLabel}>GENERAL</Text>
        <MenuItem
          icon="card-outline"
          label="My Subscriptions"
          onPress={() => navigateToTabScreen('Home', 'Subscribe')}
          color={Colors.fantasyGold}
        />
        <MenuItem
          icon="notifications-outline"
          label="Notifications"
          onPress={() => navigateToTabScreen('Home', 'NotificationInbox')}
          color={Colors.primary}
        />
        <MenuItem
          icon="swap-horizontal-outline"
          label="Change Club"
          onPress={() => Alert.alert('Change Club', 'Use the Pick Club screen to change your favourite club.')}
          color={Colors.accent}
          badge={favouriteClub?.shortName}
        />
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.menuSectionLabel}>OTHER</Text>
        <MenuItem icon="share-outline" label="Share App" onPress={handleShare} color={Colors.primary} />
        <MenuItem
          icon="help-circle-outline"
          label="Help & FAQ"
          onPress={() => Alert.alert('Help & FAQ', 'Support information coming soon.')}
          color={Colors.textTertiary}
        />
        <MenuItem
          icon="information-circle-outline"
          label="About"
          onPress={() => Alert.alert('GPL Live', 'Version 1.0.0\n\nThe ultimate Ghana Premier League experience.')}
          color={Colors.textTertiary}
        />
        <MenuItem icon="refresh-outline" label="Replay Onboarding" onPress={handleReplayOnboarding} color={Colors.accent} />
        <MenuItem icon="log-out-outline" label="Sign Out" onPress={handleLogOut} color={Colors.live} last />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: { color: Colors.textInverse, fontSize: 20, fontWeight: '800' },
  userInfo: { flex: 1 },
  userName: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  userClub: { fontSize: 13, color: Colors.textTertiary, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.fantasyGold },
  statLabel: { fontSize: 11, color: Colors.textTertiary, marginTop: 4, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: Colors.border, marginHorizontal: 8 },
  menuSection: { marginBottom: 20 },
  menuSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 8,
    paddingLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  menuBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
});
