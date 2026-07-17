import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';

import { Colors } from '../../constants/colors';
import { fonts } from '../../constants/layout';

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
        />
        <Text style={styles.logoText}>
          GPL <Text style={styles.logoLIVE}>LIVE</Text>
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoImage: {
  width: 140,
  height: 140,
  marginBottom: 20,
  },logoText: {
    fontFamily: fonts.display,
    fontSize: 38,
    fontWeight: '800',
    color: Colors.white,
  },
  logoLIVE: {
    color: Colors.yellow,
  },
});
