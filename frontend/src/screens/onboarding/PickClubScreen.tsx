import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '../../store/authStore';
import { GPL_CLUBS } from '../../constants/clubs';
import { Colors } from '../../constants/colors';
import { getAuthErrorMessage } from '../../utils/authValidation';

export default function PickClubScreen() {
  const insets = useSafeAreaInsets();
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const setFavouriteClub = useAuthStore((state) => state.setFavouriteClub);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

  const selectedClub = useMemo(
    () => GPL_CLUBS.find((club) => club.id === selectedClubId) ?? null,
    [selectedClubId]
  );

  const handleContinue = useCallback(async () => {
    if (!selectedClub || loading) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await setFavouriteClub(selectedClub);
      completeOnboarding();
      setSuccessMessage(`${selectedClub.name} saved as your favourite club.`);
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
      <Text style={styles.heading}>Which club do you support?</Text>
      <Text style={styles.subheading}>Choose one of the 18 GPL clubs.</Text>

      <FlatList
        data={GPL_CLUBS}
        keyExtractor={(item) => item.id}
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
                <Text style={styles.badgeText}>{item.shortName.slice(0, 2).toUpperCase()}</Text>
              </View>
              <Text style={styles.clubName}>{item.name}</Text>
              {active ? (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                </View>
              ) : null}
            </TouchableOpacity>
          );
        }}
      />

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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  badgeText: { color: Colors.primary, fontWeight: '800' },
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
  continueButtonDisabled: { backgroundColor: Colors.border },
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
});
