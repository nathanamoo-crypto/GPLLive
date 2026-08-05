import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Image, Text, Animated, Easing } from 'react-native';

import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';

// Synchronized with RootNavigator SPLASH_DELAY_MS = 2000
// Phase 1 (0–650ms):  logo scale-in + fade
// Phase 2 (650–1000ms): yellow bar sweeps left→right
// Phase 3 (1000–1650ms): hold
// Phase 4 (1650–2000ms): screen fade to black → clean handoff
export default function SplashScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale   = useRef(new Animated.Value(0.82)).current;
  const lineWidth   = useRef(new Animated.Value(0)).current;
  const holdDummy   = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // Phase 1: logo enters
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // Phase 2: yellow bar sweeps in (non-native — width is a layout prop)
      Animated.timing(lineWidth, {
        toValue: 240,
        duration: 350,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      // Phase 3: hold (native-driver-safe dummy timing)
      Animated.timing(holdDummy, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      // Phase 4: screen fades out → clean handoff to app
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoOpacity, logoScale, lineWidth, holdDummy, screenOpacity]);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <Animated.View
        style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
      >
        <Image
          source={require('../../../assets/GplLogo1.png')}
          style={styles.logoImage}
          resizeMode="contain"
          accessibilityLabel="GPL Live logo"
        />
        <Text style={styles.wordmark}>GPL Live</Text>
      </Animated.View>

      {/* Sweep bar — uses non-native driver, separate view from native-driven elements */}
      <Animated.View style={[styles.line, { width: lineWidth }]} />
    </Animated.View>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoWrap: {
      alignItems: 'center',
    },
    logoImage: {
      width: 280,
      height: 280,
    },
    // White on the screen's existing dark (#0A0A0A) background - the "GPL
    // Live" text you'd expect during launch, on the one splash screen we
    // actually control (the native OS boot screen only supports an image +
    // background color, no text of its own).
    wordmark: {
      marginTop: 4,
      fontSize: 22,
      fontWeight: '800',
      color: colors.white,
      letterSpacing: 0.5,
    },
    line: {
      height: 2,
      backgroundColor: colors.yellow,
      borderRadius: 1,
      marginTop: 16,
    },
  });
}
