import { StyleSheet, Text, View } from 'react-native';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Screen</Text>
      <Text style={styles.description}>
        This is a Phase 1 placeholder screen. Replace with actual form later.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#444444',
    textAlign: 'center',
  },
});
