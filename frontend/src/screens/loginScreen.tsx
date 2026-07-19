import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    Alert.alert('Success', 'Login works!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GPL Live</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 24, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFD700', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: '#1a1a1a', color: '#fff', padding: 14, borderRadius: 10, marginBottom: 16, fontSize: 15 },
  btn: { backgroundColor: '#1a73e8', padding: 16, borderRadius: 10, marginBottom: 16 },
  btnText: { color: '#fff', fontWeight: '600', textAlign: 'center', fontSize: 16 },
  link: { color: '#888', textAlign: 'center', fontSize: 14 },
});