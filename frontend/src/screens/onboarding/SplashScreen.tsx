import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';

import { Colors } from '../../constants/colors';

export default function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity }]}>
        <Image
          source={require('../../../assets/GplLogo1.png')}
          style={styles.logoImage}
          resizeMode="contain"
          accessibilityLabel="GPL Live logo"
        />
        <Text style={styles.logoText}>GPL Live</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  logoText: {
    color: Colors.textInverse,
    fontSize: 38,
    fontWeight: '800',
  },
});
