// src/screens/RegisterScreen.tsx
// TODO: Build full registration UI — form, validation, authService call
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RegisterScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Register Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D4A26' },
  text:      { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
});
