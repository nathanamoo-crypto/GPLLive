import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Image,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../../store/authStore';
import { getAuthErrorMessage, validateEmail, validatePassword } from '../../utils/authValidation';
import { fetchClubs, RealClub } from '../../services/clubService';
import type { AuthFlowParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { getAuthFormStyles } from './authFormStyles';
import { useTheme } from '../../context/ThemeContext';

type RegisterLoginNavigationProp = NativeStackNavigationProp<AuthFlowParamList, 'RegisterLogin'>;

export default function RegisterLoginScreen() {
  const navigation = useNavigation<RegisterLoginNavigationProp>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => getAuthFormStyles(colors), [colors]);
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

  const [clubs, setClubs] = useState<RealClub[]>([]);
  const [clubsLoading, setClubsLoading] = useState(false);
  const [clubsError, setClubsError] = useState<string | null>(null);
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [clubError, setClubError] = useState<string | null>(null);

  const loadClubs = useCallback(async (signal?: AbortSignal) => {
    setClubsLoading(true);
    setClubsError(null);
    try {
      const data = await fetchClubs(signal);
      if (signal?.aborted) return;
      setClubs(data);
    } catch (error) {
      if (signal?.aborted) return;
      setClubsError(getAuthErrorMessage(error, 'Failed to load clubs. Check your connection and try again.'));
    } finally {
      if (!signal?.aborted) setClubsLoading(false);
    }
  }, []);

  // Tracks whether a club fetch has already been kicked off, using a ref
  // (not state) so this effect doesn't depend on clubsLoading/clubs.length -
  // depending on state that loadClubs itself sets would re-run this effect
  // mid-fetch, aborting the in-flight request before it ever resolves and
  // leaving clubsLoading stuck at true forever.
  const clubsFetchStartedRef = useRef(false);

  useEffect(() => {
    if (mode !== 'register' || clubsFetchStartedRef.current) {
      return;
    }
    clubsFetchStartedRef.current = true;
    const controller = new AbortController();
    loadClubs(controller.signal);
    return () => controller.abort();
  }, [mode, loadClubs]);

  const goToNextStep = useCallback(() => {
    const user = useAuthStore.getState().user;

    if (user?.favouriteClub) {
      if (!onboardingComplete) {
        completeOnboarding();
      }
      return;
    }

    navigation.navigate('PickClub');
  }, [completeOnboarding, navigation, onboardingComplete]);

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
    const nextClubError =
      mode === 'register' && !selectedClubId ? 'Please choose your favourite club.' : null;

    setNameError(nextNameError);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setConfirmPasswordError(nextConfirmPasswordError);
    setClubError(nextClubError);
    setFormError(null);
    setForgotMessage(null);

    if (nextNameError || nextEmailError || nextPasswordError || nextConfirmPasswordError || nextClubError) {
      return;
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        await register(name.trim(), email.trim(), password, selectedClubId as number);
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
    selectedClubId,
  ]);

  const handleModeChange = useCallback((nextMode: 'register' | 'login') => {
    setMode(nextMode);
    setFormError(null);
    setForgotMessage(null);
    setClubError(null);
  }, []);

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
        <Text style={styles.heading}>Welcome to GPL Live</Text>
        <Text style={styles.subheading}>Sign in or create an account to continue.</Text>

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

        {mode === 'register' && (
          <View style={styles.field}>
            <Text style={styles.label}>Favourite club</Text>
            {clubsLoading ? (
              <View style={styles.clubPickerLoading}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : clubsError ? (
              <View style={styles.clubPickerLoading}>
                <Text style={styles.errorText}>{clubsError}</Text>
                <TouchableOpacity onPress={() => loadClubs()} disabled={loading}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={clubs}
                keyExtractor={(item) => String(item.id)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.clubList}
                renderItem={({ item }) => {
                  const active = item.id === selectedClubId;
                  return (
                    <TouchableOpacity
                      style={[styles.clubChip, active && styles.clubChipActive]}
                      onPress={() => {
                        setSelectedClubId(item.id);
                        if (clubError) {
                          setClubError(null);
                        }
                      }}
                      disabled={loading}
                    >
                      <View style={styles.clubChipBadge}>
                        {item.badge ? (
                          <Image source={item.badge} style={styles.clubChipBadgeImage} resizeMode="contain" />
                        ) : (
                          <Ionicons name="shield-outline" size={18} color={colors.textTertiary} />
                        )}
                      </View>
                      <Text
                        style={[styles.clubChipText, active && styles.clubChipTextActive]}
                        numberOfLines={1}
                      >
                        {item.shortName || item.fullName}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
            {clubError ? <Text style={styles.errorText}>{clubError}</Text> : null}
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
            <ActivityIndicator color={colors.textInverse} />
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
          <Ionicons name="logo-google" size={18} color={colors.textPrimary} />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.demoButton} onPress={handleDemo} disabled={loading}>
          <Text style={styles.demoButtonText}>Continue as Demo User (For Testing)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchModeRow}
          onPress={() => handleModeChange(mode === 'register' ? 'login' : 'register')}
          disabled={loading}
        >
          <Text style={styles.switchModeText}>
            {mode === 'register'
              ? 'Already have an account? '
              : "New here? "}
            <Text style={styles.switchModeLink}>
              {mode === 'register' ? 'Log in' : 'Create account'}
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
