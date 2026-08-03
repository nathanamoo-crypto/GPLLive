import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../../store/authStore';
import { getAuthErrorMessage, validatePassword } from '../../utils/authValidation';
import type { AuthFlowParamList } from '../../navigation/types';
import { getAuthFormStyles } from './authFormStyles';
import { useTheme } from '../../context/ThemeContext';

type ResetPasswordNavigationProp = NativeStackNavigationProp<AuthFlowParamList, 'ResetPassword'>;
type ResetPasswordRouteProp = RouteProp<AuthFlowParamList, 'ResetPassword'>;

const RESEND_COOLDOWN_SECONDS = 30;

export default function ResetPasswordScreen() {
  const navigation = useNavigation<ResetPasswordNavigationProp>();
  const route = useRoute<ResetPasswordRouteProp>();
  const { email } = route.params;

  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => getAuthFormStyles(colors), [colors]);

  const resetPassword = useAuthStore((state) => state.resetPassword);
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const onboardingComplete = useAuthStore((state) => state.onboardingComplete);

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = useCallback(() => {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
    }
    cooldownTimerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) {
            clearInterval(cooldownTimerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

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

  const handleSubmit = useCallback(async () => {
    if (loading) {
      return;
    }

    const trimmedCode = code.trim();
    const nextCodeError = !trimmedCode
      ? 'Enter the code we sent you.'
      : !/^\d{6}$/.test(trimmedCode)
        ? 'Code should be the 6 digits from your email.'
        : null;
    const nextPasswordError = validatePassword(newPassword);
    const nextConfirmPasswordError =
      newPassword !== confirmPassword ? 'Passwords must match.' : null;

    setCodeError(nextCodeError);
    setPasswordError(nextPasswordError);
    setConfirmPasswordError(nextConfirmPasswordError);
    setFormError(null);

    if (nextCodeError || nextPasswordError || nextConfirmPasswordError) {
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, trimmedCode, newPassword);
      goToNextStep();
    } catch (error) {
      setFormError(getAuthErrorMessage(error, 'Unable to reset your password. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [code, confirmPassword, email, goToNextStep, loading, newPassword, resetPassword]);

  const handleResend = useCallback(async () => {
    if (resending || cooldown > 0) {
      return;
    }

    setResending(true);
    setFormError(null);
    setInfoMessage(null);
    try {
      await forgotPassword(email);
      setInfoMessage('A new code is on its way to your email.');
      startCooldown();
    } catch (error) {
      setFormError(getAuthErrorMessage(error, 'Unable to resend the code.'));
    } finally {
      setResending(false);
    }
  }, [cooldown, email, forgotPassword, resending, startCooldown]);

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
        <Text style={styles.heading}>Check your email</Text>
        <Text style={styles.subheading}>
          Enter the 6-digit code we sent to {email}, then choose a new password.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Reset code</Text>
          <TextInput
            style={[styles.input, codeError ? styles.inputError : null]}
            value={code}
            onChangeText={(value) => {
              setCode(value.replace(/[^0-9]/g, '').slice(0, 6));
              if (codeError) {
                setCodeError(null);
              }
            }}
            placeholder="123456"
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading}
          />
          {codeError ? <Text style={styles.errorText}>{codeError}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>New password</Text>
          <View style={styles.passwordFieldWrapper}>
            <TextInput
              style={[styles.input, styles.passwordInput, passwordError ? styles.inputError : null]}
              value={newPassword}
              onChangeText={(value) => {
                setNewPassword(value);
                if (passwordError) {
                  setPasswordError(null);
                }
              }}
              placeholder="••••••••"
              secureTextEntry={!showNewPassword}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowNewPassword((prev) => !prev)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Confirm new password</Text>
          <View style={styles.passwordFieldWrapper}>
            <TextInput
              style={[styles.input, styles.passwordInput, confirmPasswordError ? styles.inputError : null]}
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                if (confirmPasswordError) {
                  setConfirmPasswordError(null);
                }
              }}
              placeholder="••••••••"
              secureTextEntry={!showConfirmPassword}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowConfirmPassword((prev) => !prev)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
        </View>

        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
        {infoMessage ? <Text style={styles.infoText}>{infoMessage}</Text> : null}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.submitButtonText}>Reset password</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend} disabled={resending || cooldown > 0}>
          <Text style={styles.forgotText}>
            {resending
              ? 'Sending...'
              : cooldown > 0
                ? `Resend code (${cooldown}s)`
                : "Didn't get a code? Resend"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchModeRow}
          onPress={() => navigation.navigate('RegisterLogin')}
          disabled={loading}
        >
          <Text style={styles.switchModeText}>
            Wrong email? <Text style={styles.switchModeLink}>Start over</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
