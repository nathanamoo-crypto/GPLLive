import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../../store/authStore';
import { getAuthErrorMessage, validateEmail, validatePassword } from '../../utils/authValidation';
import type { AuthFlowParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { fonts } from '../../constants/layout';
import { authFormStyles as styles } from './authFormStyles';

type RegisterLoginNavigationProp = NativeStackNavigationProp<AuthFlowParamList, 'RegisterLogin'>;

export default function RegisterLoginScreen() {
  const navigation = useNavigation<RegisterLoginNavigationProp>();
  const insets = useSafeAreaInsets();
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const onboardingComplete = useAuthStore((state) => state.onboardingComplete);
  const loginDemo = useAuthStore((state) => state.loginDemo);

  const [mode, setMode] = useState<'register' | 'login'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const goToNextStep = useCallback(() => {
    const user = useAuthStore.getState().user;

    if (mode === 'login' && user?.favouriteClub) {
      if (!onboardingComplete) {
        completeOnboarding();
      }
      return;
    }

    navigation.navigate('PickClub');
  }, [completeOnboarding, mode, navigation, onboardingComplete]);

  const handleDemo = useCallback(async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    setFormError(null);

    try {
      await loginDemo();
      navigation.navigate('PickClub');
    } catch (error) {
      setFormError(getAuthErrorMessage(error, 'Unable to start demo session.'));
    } finally {
      setLoading(false);
    }
  }, [loading, loginDemo, navigation]);

  const handleGoogleSignIn = useCallback(() => {
    // TODO: Wire expo-auth-session when Google OAuth credentials are configured.
    setFormError('Google sign-in will be available after OAuth credentials are configured.');
  }, []);

  const handleForgotPassword = useCallback(() => {
    setForgotMessage('Password reset will be available once the auth service endpoint is live.');
  }, []);

  const handleSubmit = useCallback(async () => {
    if (loading) {
      return;
    }

    const nextNameError = mode === 'register' && !name.trim() ? 'Full name is required.' : null;
    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);
    const nextConfirmPasswordError =
      mode === 'register' && password !== confirmPassword ? 'Passwords must match.' : null;

    setNameError(nextNameError);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setConfirmPasswordError(nextConfirmPasswordError);
    setFormError(null);
    setForgotMessage(null);

    if (nextNameError || nextEmailError || nextPasswordError || nextConfirmPasswordError) {
      return;
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      goToNextStep();
    } catch (error) {
      setFormError(getAuthErrorMessage(error, 'Authentication failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [
    confirmPassword,
    email,
    goToNextStep,
    loading,
    login,
    mode,
    name,
    password,
    register,
  ]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 24,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
         <Image
          source={require('../../../assets/GplLogo1.png')}
            style={{
                    width: 120,
                    height: 120,
                    marginBottom: 12,
                  }}
         resizeMode="contain"
  />

  <Text
    style={{
      fontFamily: fonts.display,
      fontSize: 20,
      fontWeight: '800',
      color: Colors.white,
    }}
  >
    GPL <Text style={{ color: Colors.yellow }}>LIVE</Text>
  </Text>
</View>

        {mode === 'register' && (
          <View style={styles.field}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={[styles.input, nameError ? styles.inputError : null]}
              value={name}
              onChangeText={(value) => {
                setName(value);
                if (nameError) {
                  setNameError(null);
                }
              }}
              placeholder="Jane Doe"
              autoCapitalize="words"
              editable={!loading}
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (emailError) {
                setEmailError(null);
              }
            }}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, passwordError ? styles.inputError : null]}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (passwordError) {
                setPasswordError(null);
              }
            }}
            placeholder="••••••••"
            secureTextEntry
            editable={!loading}
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>

        {mode === 'login' ? (
          <TouchableOpacity onPress={handleForgotPassword} disabled={loading}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        ) : null}

        {mode === 'register' && (
          <View style={styles.field}>
            <Text style={styles.label}>Confirm password</Text>
            <TextInput
              style={[styles.input, confirmPasswordError ? styles.inputError : null]}
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                if (confirmPasswordError) {
                  setConfirmPasswordError(null);
                }
              }}
              placeholder="••••••••"
              secureTextEntry
              editable={!loading}
            />
            {confirmPasswordError ? (
              <Text style={styles.errorText}>{confirmPasswordError}</Text>
            ) : null}
          </View>
        )}

        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
        {forgotMessage ? <Text style={styles.infoText}>{forgotMessage}</Text> : null}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textInverse} />
          ) : (
            <Text style={styles.submitButtonText}>
              {mode === 'register' ? 'Create account' : 'Log in'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <Ionicons name="logo-google" size={18} color={Colors.textPrimary} />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.demoButton} onPress={handleDemo} disabled={loading}>
          <Text style={styles.demoButtonText}>Continue as Demo User (For Testing)</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
