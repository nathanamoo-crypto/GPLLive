import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FixturesRoot() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fixtures</Text>
      <Text style={styles.placeholder}>Fixtures, Results and Table content will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA', justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#0D1117', marginBottom: 16 },
  placeholder: { fontSize: 16, color: '#5A6472', textAlign: 'center' },
});
