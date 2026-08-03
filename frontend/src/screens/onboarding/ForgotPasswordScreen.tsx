import React, { useCallback, useMemo, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '../../store/authStore';
import { getAuthErrorMessage, validateEmail } from '../../utils/authValidation';
import type { AuthFlowParamList } from '../../navigation/types';
import { getAuthFormStyles } from './authFormStyles';
import { useTheme } from '../../context/ThemeContext';

type ForgotPasswordNavigationProp = NativeStackNavigationProp<AuthFlowParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<ForgotPasswordNavigationProp>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => getAuthFormStyles(colors), [colors]);

  const forgotPassword = useAuthStore((state) => state.forgotPassword);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (loading) {
      return;
    }

    const trimmedEmail = email.trim();
    const nextEmailError = validateEmail(trimmedEmail);
    setEmailError(nextEmailError);
    setFormError(null);

    if (nextEmailError) {
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(trimmedEmail);
      // Always proceed regardless of whether the email actually has an
      // account - the backend never reveals that, so the UI shouldn't
      // either (otherwise this screen itself becomes an email-enumeration
      // tool).
      navigation.navigate('ResetPassword', { email: trimmedEmail });
    } catch (error) {
      setFormError(getAuthErrorMessage(error, 'Something went wrong. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [email, forgotPassword, loading, navigation]);

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
        <Text style={styles.heading}>Reset your password</Text>
        <Text style={styles.subheading}>
          Enter the email on your account and we'll send you a code to reset your password.
        </Text>

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

        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.submitButtonText}>Send reset code</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchModeRow}
          onPress={() => navigation.navigate('RegisterLogin')}
          disabled={loading}
        >
          <Text style={styles.switchModeText}>
            Remembered it? <Text style={styles.switchModeLink}>Back to log in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
