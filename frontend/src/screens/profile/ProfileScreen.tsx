import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Share, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
import { getScrollBottomPadding } from '../../constants/layout';
import { useAuthStore } from '../../store/authStore';
import PremiumBadge from '../../components/shared/PremiumBadge';
import { useTheme } from '../../context/ThemeContext';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  accent?: boolean;
}

function MenuGroup({
  title,
  items,
  colors,
  styles,
}: {
  title?: string;
  items: MenuItem[];
  colors: typeof Colors;
  styles: ReturnType<typeof getStyles>;
}) {
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
              <Ionicons name={item.icon} size={18} color={item.accent ? colors.yellow : colors.grey1} />
              <Text style={[styles.optionText, item.accent && styles.optionTextAccent]}>
                {item.label}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.grey2} />
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
  const { theme, colors, toggleTheme } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
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

  
  const handleShare = useCallback(() => {
    void Share.share({ message: 'Join me on GPL Live — the ultimate Ghana Premier League companion app!' });
  }, []);

  const showComingSoon = useCallback((feature: string) => {
    Alert.alert('Coming Soon', `${feature} will be available in an upcoming update.`);
  }, []);

  return (
    <View style={styles.container}>
      {/* Fixed outside the ScrollView, like Home's own header bar - the
          heading used to scroll away with the rest of the content, leaving
          nothing solid painted over the status bar area, so scrolling (and
          especially the iOS overscroll bounce) could show content bleeding
          up into the phone's time/battery notch instead of stopping cleanly
          below it. */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.heading}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollFlex}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: 20,
            paddingBottom: getScrollBottomPadding(insets.bottom),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
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
          {user?.isPremium && (
            <View style={styles.premiumBadgeWrap}>
              <PremiumBadge variant="full" />
            </View>
          )}
        </View>
      </View>

      <MenuGroup
        title="GPL Live Pro"
        colors={colors}
        styles={styles}
        items={[
          // Payment Methods used to live here too, but it just routed to the
          // same Paystack flow Subscribe already opens - a separate entry for
          // the same destination was redundant, so it's gone.
          { icon: 'diamond-outline', label: 'Subscribe', onPress: () => navigation.navigate('Home', { screen: 'Subscribe' }) },
        ]}
      />

      <MenuGroup
        title="Football"
        colors={colors}
        styles={styles}
        items={[
          { icon: 'calendar-outline', label: 'Fixtures', onPress: () => navigation.navigate('Fixtures') },
          {
            icon: 'trophy-outline',
            label: 'League Table',
            onPress: () =>
              navigation.navigate('Fixtures', { screen: 'FixturesRoot', params: { defaultTab: 'table' } }),
          },
          { icon: 'newspaper-outline', label: 'All News', onPress: () => navigation.navigate('News') },
          { icon: 'search-outline', label: 'League Search', onPress: () => navigation.navigate('Home', { screen: 'Search' }) },
        ]}
      />

      <MenuGroup
        title="Games"
        colors={colors}
        styles={styles}
        items={[
          // "Fantasy League" used to sit above "My Team" as a separate entry,
          // but both landed on the same Games screen - one plain, one routed
          // to the fantasy tab specifically. Keeping just "My Team" (the more
          // precise route) removes the duplicate without losing the entry point.
          { icon: 'people-outline', label: 'My Team', onPress: handleMyTeamPress, accent: true },
          { icon: 'bulb-outline', label: 'Predictions', onPress: () => navigation.navigate('Games', { screen: 'GamesRoot', params: { defaultTab: 'predictions' } }) },
        ]}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.sectionContent}>
          <View style={[styles.option, styles.optionLast]}>
            <View style={styles.optionLeft}>
              <Ionicons name={theme === 'dark' ? 'moon-outline' : 'sunny-outline'} size={18} color={colors.grey1} />
              <Text style={styles.optionText}>Dark Mode</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.yellow }}
              thumbColor={colors.white}
            />
          </View>
        </View>
      </View>

      <MenuGroup
        title="App"
        colors={colors}
        styles={styles}
        items={[
          { icon: 'person-outline', label: 'Edit Profile', onPress: () => navigation.navigate('EditProfile') },
          { icon: 'notifications-outline', label: 'Notifications', onPress: () => navigation.navigate('Home', { screen: 'NotificationInbox' }) },
          { icon: 'share-outline', label: 'Share GPL Live', onPress: handleShare },
          { icon: 'log-out-outline', label: 'Log Out', onPress: handleLogOut },
        ]}
      />
      </ScrollView>
    </View>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.black },
    scrollFlex: { flex: 1 },
    // Fixed above the ScrollView - always opaque and covers the status bar
    // area, regardless of scroll position (see the comment where it's used).
    headerBar: {
      backgroundColor: colors.black,
      paddingHorizontal: 24,
      paddingBottom: 16,
    },
    content: { paddingHorizontal: 24 },
    heading: {
      fontSize: 24,
      fontWeight: '800',
      fontFamily: fonts.display,
      color: colors.white,
      textTransform: 'uppercase',
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: radius.card,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.yellow,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    avatarText: { color: '#000000', fontSize: 24, fontWeight: '800' },
    cardText: { flex: 1 },
    name: { fontSize: 18, fontWeight: '700', color: colors.white },
    subtext: { fontSize: 14, color: colors.grey1, marginTop: 4 },
    premiumBadgeWrap: { marginTop: 8 },
    section: { marginBottom: 20 },
    sectionTitle: {
      fontSize: 11,
      fontFamily: fonts.bodySemiBold,
      color: colors.grey2,
      textTransform: 'uppercase',
      letterSpacing: 0.08,
      marginBottom: 8,
      paddingLeft: 4,
    },
    sectionContent: {
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
    },
    optionLast: { borderBottomWidth: 0 },
    optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    optionText: { fontSize: 15, fontFamily: fonts.body, color: colors.white },
    optionTextAccent: { color: colors.yellow, fontFamily: fonts.bodySemiBold },
  });
}
