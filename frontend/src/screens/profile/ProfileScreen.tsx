import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '../../constants/colors';
import { getScrollBottomPadding } from '../../constants/layout';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const resetOnboarding = useAuthStore((state) => state.resetOnboarding);

  const handleLogOut = useCallback(() => {
    Alert.alert('Log out?', 'You will return to the login screen.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          void logout();
        },
      },
    ]);
  }, [logout]);

  const handleReplayOnboarding = useCallback(() => {
    Alert.alert('Replay onboarding?', 'This will show the splash and onboarding slides again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Replay',
        onPress: () => {
          void logout();
          resetOnboarding();
        },
      },
    ]);
  }, [logout, resetOnboarding]);

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
            Favourite club: {user?.favouriteClub?.name ?? 'Not selected'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={handleReplayOnboarding}>
          <Text style={styles.optionText}>Replay onboarding</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.option, styles.optionLast]} onPress={handleLogOut}>
          <Text style={[styles.optionText, styles.logoutText]}>Log out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 24 },
  heading: { fontSize: 24, fontWeight: '800', marginBottom: 24, color: Colors.textPrimary },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: { color: Colors.textInverse, fontSize: 24, fontWeight: '800' },
  cardText: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  subtext: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  section: { backgroundColor: Colors.surface, borderRadius: 20, padding: 16 },
  option: {
    paddingVertical: 14,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
  },
  optionLast: { borderBottomWidth: 0 },
  optionText: { fontSize: 16, color: Colors.textPrimary },
  logoutText: { color: Colors.live, fontWeight: '700' },
});
