import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import SplashScreen from '../screens/onboarding/SplashScreen';
import { useAuthStore } from '../store/authStore';
import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';
import OnboardingStack from './OnboardingStack';

const SPLASH_DELAY_MS = 2000;
const HYDRATION_FALLBACK_MS = 1000;

export default function RootNavigator() {
  const onboardingComplete = useAuthStore((state) => state.onboardingComplete);
  const splashKey = useAuthStore((state) => state.splashKey);
  const token = useAuthStore((state) => state.token);
  const favouriteClub = useAuthStore((state) => state.user?.favouriteClub);
  const isAuthenticated = Boolean(token);

  const [hasHydrated, setHasHydrated] = useState(useAuthStore.persist.hasHydrated());
  const [showSplash, setShowSplash] = useState(true);
  const splashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }

    const hydrationFallback = setTimeout(() => {
      setHasHydrated(true);
    }, HYDRATION_FALLBACK_MS);

    return () => {
      unsubscribe();
      clearTimeout(hydrationFallback);
    };
  }, []);

  // The branded splash used to play its full 2s animation on every launch,
  // logged-in or not - someone who already has a session just wants to land
  // on Home, not sit through the same intro every time. Now it only plays
  // for the logged-out path (first launch, or after logging out); a
  // returning logged-in user skips straight to the app. hasHydrated has to
  // be true first since isAuthenticated is meaningless before the persisted
  // token has actually loaded from storage.
  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (isAuthenticated) {
      setShowSplash(false);
      if (splashTimerRef.current) {
        clearTimeout(splashTimerRef.current);
      }
      return;
    }

    setShowSplash(true);

    if (splashTimerRef.current) {
      clearTimeout(splashTimerRef.current);
    }

    splashTimerRef.current = setTimeout(() => {
      setShowSplash(false);
    }, SPLASH_DELAY_MS);

    return () => {
      if (splashTimerRef.current) {
        clearTimeout(splashTimerRef.current);
      }
    };
  }, [hasHydrated, isAuthenticated, splashKey]);

  const renderAppNavigator = () => {
    if (!hasHydrated) {
      return <OnboardingStack />;
    }

    if (!onboardingComplete) {
      return <OnboardingStack />;
    }

    if (!isAuthenticated) {
      return <AuthStack />;
    }

    if (!favouriteClub) {
      return <AuthStack initialRouteName="PickClub" />;
    }

    return <MainTabNavigator />;
  };

  return (
    <NavigationContainer>
      <View style={styles.root}>
        {renderAppNavigator()}
        {showSplash ? (
          <View style={styles.splashOverlay}>
            <SplashScreen />
          </View>
        ) : null}
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
});
