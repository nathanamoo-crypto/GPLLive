import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Animated } from 'react-native';

import { Colors } from '../../constants/colors';

export default function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity, transform: [{ translateY }] }]}>
        <Image
          source={require('../../../assets/GplLogo1.png')}
          style={styles.logoImage}
          resizeMode="contain"
          accessibilityLabel="GPL Live logo"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoImage: {
    width: 280,
    height: 280,
  },
});
