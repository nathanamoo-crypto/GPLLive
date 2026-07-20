import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '../../store/authStore';
import { fetchClubs, RealClub } from '../../services/clubService';
import { Colors } from '../../constants/colors';
import { getAuthErrorMessage } from '../../utils/authValidation';

export default function PickClubScreen() {
  const insets = useSafeAreaInsets();
  const [clubs, setClubs] = useState<RealClub[]>([]);
  const [clubsLoading, setClubsLoading] = useState(true);
  const [clubsError, setClubsError] = useState<string | null>(null);
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const setFavouriteClub = useAuthStore((state) => state.setFavouriteClub);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const logout = useAuthStore((state) => state.logout);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }, [loggingOut, logout]);

  const loadClubs = useCallback(async (signal?: AbortSignal) => {
    setClubsLoading(true);
    setClubsError(null);
    try {
      const data = await fetchClubs(signal);
      if (signal?.aborted) return;
      setClubs(data);
    } catch (error) {
      if (signal?.aborted) return;
      setClubsError(getAuthErrorMessage(error, 'Failed to load clubs. Check your connection and try again.'));
    } finally {
      if (!signal?.aborted) setClubsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadClubs(controller.signal);
    return () => controller.abort();
  }, [loadClubs]);

  const selectedClub = useMemo(
    () => clubs.find((club) => club.id === selectedClubId) ?? null,
    [clubs, selectedClubId]
  );

  const handleContinue = useCallback(async () => {
    if (!selectedClub || loading) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await setFavouriteClub({ id: selectedClub.id, fullName: selectedClub.fullName });
      completeOnboarding();
      setSuccessMessage(`${selectedClub.fullName} saved as your favourite club.`);
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error, 'Unable to save your club. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [completeOnboarding, loading, selectedClub, setFavouriteClub]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.topRowText}>
          <Text style={styles.heading}>Which club do you support?</Text>
          <Text style={styles.subheading}>Choose one of the 18 GPL clubs.</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} disabled={loggingOut} style={styles.logoutButton}>
          {loggingOut ? (
            <ActivityIndicator size="small" color={Colors.textSecondary} />
          ) : (
            <Text style={styles.logoutText}>Log out</Text>
          )}
        </TouchableOpacity>
      </View>

      {clubsLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : clubsError ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{clubsError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadClubs()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
      <FlatList
        data={clubs}
        keyExtractor={(item) => String(item.id)}
        numColumns={3}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const active = item.id === selectedClubId;
          return (
            <TouchableOpacity
              style={[styles.clubCard, active && styles.clubCardActive]}
              onPress={() => {
                setSelectedClubId(item.id);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              disabled={loading}
            >
              <View style={styles.badgePlaceholder}>
                {item.badge ? (
                  <Image source={item.badge} style={styles.badgeImage} resizeMode="contain" />
                ) : (
                  <Ionicons name="shield-outline" size={28} color={Colors.textTertiary} />
                )}
              </View>
              <Text style={styles.clubName}>{item.fullName}</Text>
              {active ? (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                </View>
              ) : null}
            </TouchableOpacity>
          );
        }}
      />
      )}

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

      <TouchableOpacity
        style={[
          styles.continueButton,
          (!selectedClub || loading) && styles.continueButtonDisabled,
        ]}
        disabled={!selectedClub || loading}
        onPress={handleContinue}
      >
        {loading ? (
          <ActivityIndicator color={Colors.textInverse} />
        ) : (
          <Text style={styles.continueText}>Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 24 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  topRowText: { flex: 1, paddingRight: 12 },
  logoutButton: { paddingVertical: 4, paddingHorizontal: 6 },
  logoutText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  heading: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8 },
  subheading: { fontSize: 14, color: Colors.textSecondary, marginBottom: 20 },
  grid: { paddingBottom: 24 },
  clubCard: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    minWidth: 0,
  },
  clubCardActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  badgePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    overflow: 'hidden',
  },
  badgeImage: {
    width: 36,
    height: 36,
  },
  clubName: { textAlign: 'center', fontSize: 13, color: Colors.textPrimary, fontWeight: '600' },
  checkmark: { marginTop: 8 },
  continueButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  continueButtonDisabled: { backgroundColor: '#A8C7B0' },
  continueText: { color: Colors.textInverse, fontWeight: '700', fontSize: 15 },
  errorText: {
    color: Colors.live,
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    color: Colors.win,
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  retryButton: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  retryButtonText: { fontSize: 14, fontWeight: '800', color: Colors.textInverse, textTransform: 'uppercase' },
});
