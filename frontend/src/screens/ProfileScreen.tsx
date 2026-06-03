// src/screens/ProfileScreen.tsx
// TODO: Build profile UI — user info, fantasy team stats, logout
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProfileScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  text:      { color: '#0D4A26', fontSize: 20, fontWeight: 'bold' },
});
