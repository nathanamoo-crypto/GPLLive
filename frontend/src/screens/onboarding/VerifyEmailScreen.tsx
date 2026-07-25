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

import { useAuthStore } from '../../store/authStore';
import { getAuthErrorMessage } from '../../utils/authValidation';
import type { AuthFlowParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { getAuthFormStyles } from './authFormStyles';
import { useTheme } from '../../context/ThemeContext';

type VerifyEmailNavigationProp = NativeStackNavigationProp<AuthFlowParamList, 'VerifyEmail'>;
type VerifyEmailRouteProp = RouteProp<AuthFlowParamList, 'VerifyEmail'>;

const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyEmailScreen() {
  const navigation = useNavigation<VerifyEmailNavigationProp>();
  const route = useRoute<VerifyEmailRouteProp>();
  const { email } = route.params;

  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => getAuthFormStyles(colors), [colors]);

  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  const resendVerificationCode = useAuthStore((state) => state.resendVerificationCode);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const onboardingComplete = useAuthStore((state) => state.onboardingComplete);

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
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

  const handleVerify = useCallback(async () => {
    if (loading) {
      return;
    }

    const trimmedCode = code.trim();
    const nextCodeError = !trimmedCode
      ? 'Enter the code we sent you.'
      : !/^\d{6}$/.test(trimmedCode)
        ? 'Code should be the 6 digits from your email.'
        : null;

    setCodeError(nextCodeError);
    setFormError(null);

    if (nextCodeError) {
      return;
    }

    setLoading(true);
    try {
      await verifyEmail(email, trimmedCode);
      goToNextStep();
    } catch (error) {
      setFormError(getAuthErrorMessage(error, 'Verification failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [code, email, goToNextStep, loading, verifyEmail]);

  const handleResend = useCallback(async () => {
    if (resending || cooldown > 0) {
      return;
    }

    setResending(true);
    setFormError(null);
    setInfoMessage(null);
    try {
      await resendVerificationCode(email);
      setInfoMessage('A new code is on its way to your email.');
      startCooldown();
    } catch (error) {
      setFormError(getAuthErrorMessage(error, 'Unable to resend the code.'));
    } finally {
      setResending(false);
    }
  }, [cooldown, email, resendVerificationCode, resending, startCooldown]);

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
        <Text style={styles.heading}>Verify your email</Text>
        <Text style={styles.subheading}>
          Enter the 6-digit code we sent to {email}.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Verification code</Text>
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

        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
        {infoMessage ? <Text style={styles.infoText}>{infoMessage}</Text> : null}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.submitButtonText}>Verify</Text>
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
