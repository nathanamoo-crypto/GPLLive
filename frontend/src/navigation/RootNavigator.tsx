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

  useEffect(() => {
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
  }, [splashKey]);

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
