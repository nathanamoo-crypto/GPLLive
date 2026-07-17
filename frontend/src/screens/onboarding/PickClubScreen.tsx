import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '../../store/authStore';
import { GPL_CLUBS } from '../../constants/clubs';
import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
import { getAuthErrorMessage } from '../../utils/authValidation';
import { Logos } from '../../constants/logos';

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
      <View style={styles.stepDots}>
        <View style={styles.stepDotActive} />
        <View style={styles.stepDotInactive} />
        <View style={styles.stepDotInactive} />
      </View>

      <Text style={styles.heading}>PICK YOUR CLUB</Text>
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
              <Image
                source={Logos[item.id]}
                style={styles.badge}
                resizeMode="contain"
/>

              <Text style={[styles.clubName, active && styles.clubNameActive]}>{item.name}</Text>
              {active ? (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.yellow} />
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
          <ActivityIndicator color="#000000" />
        ) : (
          <Text style={styles.continueText}>
            {selectedClub ? `CONTINUE AS A ${selectedClub.shortName.toUpperCase()} FAN` : 'SELECT A CLUB'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipButton} onPress={() => completeOnboarding()}>
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black, paddingHorizontal: 20 },
  stepDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 24,
  },
  stepDotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.yellow,
  },
  stepDotInactive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.grey2,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: fonts.display,
    color: Colors.white,
    textTransform: 'uppercase',
    marginBottom: 8,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 13,
    color: Colors.grey1,
    marginBottom: 24,
    textAlign: 'center',
  },
  grid: { paddingBottom: 24 },
  clubCard: {
    flex: 1,
    margin: 6,
    padding: 12,
    borderRadius: radius.card,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    minWidth: 0,
    aspectRatio: 1,
  },
  clubCardActive: {
    borderColor: Colors.yellow,
    borderWidth: 2,
  }, 
  
  badge: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },


  clubName: { textAlign: 'center', fontSize: 12, fontWeight: '600', color: Colors.white },
  clubNameActive: { color: Colors.yellow },
  checkmark: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.yellow,
    borderRadius: 9999,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButton: {
    backgroundColor: Colors.yellow,
    paddingVertical: 16,
    borderRadius: radius.button,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  continueButtonDisabled: { backgroundColor: Colors.border },
  continueText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 15,
    fontFamily: fonts.display,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
  },
  skipButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  skipText: {
    color: Colors.grey1,
    fontSize: 13,
    textAlign: 'center',
  },
  errorText: {
    color: Colors.red,
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    color: Colors.green,
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
});
