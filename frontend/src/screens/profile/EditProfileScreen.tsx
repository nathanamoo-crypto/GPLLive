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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import SubScreenHeader from '../../components/shared/SubScreenHeader';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../context/ThemeContext';
import { getAuthFormStyles } from '../onboarding/authFormStyles';
import { getAuthErrorMessage, validatePassword, validateUsername } from '../../utils/authValidation';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  // Reusing the exact same field/label/error/button styling as the
  // registration and reset-password screens (getAuthFormStyles) - same
  // validation rules too (validateUsername/validatePassword below), so this
  // form behaves and looks like the rest of the app's own auth forms
  // instead of introducing a new one-off style.
  const styles = useMemo(() => getAuthFormStyles(colors), [colors]);
  const user = useAuthStore((state) => state.user);
  const updateUsername = useAuthStore((state) => state.updateUsername);
  const changePassword = useAuthStore((state) => state.changePassword);

  const [username, setUsername] = useState(user?.username ?? '');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [passwordFormError, setPasswordFormError] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const usernameUnchanged = username.trim() === (user?.username ?? '');

  const handleSaveUsername = useCallback(async () => {
    setUsernameSuccess(null);
    const nextError = validateUsername(username);
    setUsernameError(nextError);
    if (nextError || usernameUnchanged) return;

    setUsernameSaving(true);
    try {
      await updateUsername(username.trim());
      setUsernameSuccess('Username updated.');
    } catch (error) {
      setUsernameError(getAuthErrorMessage(error, 'Unable to update username. Please try again.'));
    } finally {
      setUsernameSaving(false);
    }
  }, [updateUsername, username, usernameUnchanged]);

  const handleChangePassword = useCallback(async () => {
    setPasswordSuccess(null);
    const nextCurrentError = !currentPassword ? 'Enter your current password.' : null;
    const nextNewError = validatePassword(newPassword);
    const nextConfirmError = newPassword !== confirmPassword ? 'Passwords must match.' : null;
    const nextSameAsCurrentError =
      !nextNewError && !nextCurrentError && newPassword === currentPassword
        ? 'New password must be different from your current password.'
        : null;

    setCurrentPasswordError(nextCurrentError);
    setNewPasswordError(nextNewError ?? nextSameAsCurrentError);
    setConfirmPasswordError(nextConfirmError);
    setPasswordFormError(null);

    if (nextCurrentError || nextNewError || nextConfirmError || nextSameAsCurrentError) return;

    setPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordFormError(getAuthErrorMessage(error, 'Unable to change password. Please try again.'));
    } finally {
      setPasswordSaving(false);
    }
  }, [changePassword, confirmPassword, currentPassword, newPassword]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.flex, { paddingTop: insets.top }]}>
        <SubScreenHeader title="Edit Profile" />

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: insets.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={sectionLabelStyle(colors)}>USERNAME</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, usernameError ? styles.inputError : null]}
              value={username}
              onChangeText={(value) => {
                setUsername(value);
                if (usernameError) setUsernameError(null);
                if (usernameSuccess) setUsernameSuccess(null);
              }}
              placeholder="Your username"
              placeholderTextColor={colors.grey2}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!usernameSaving}
            />
            {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
            {usernameSuccess ? <Text style={styles.infoText}>{usernameSuccess}</Text> : null}
          </View>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (usernameSaving || usernameUnchanged) && styles.submitButtonDisabled,
            ]}
            onPress={handleSaveUsername}
            disabled={usernameSaving || usernameUnchanged}
          >
            {usernameSaving ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={styles.submitButtonText}>Save username</Text>
            )}
          </TouchableOpacity>

          <Text style={[sectionLabelStyle(colors), { marginTop: 32 }]}>CHANGE PASSWORD</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Current password</Text>
            <View style={styles.passwordFieldWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput, currentPasswordError ? styles.inputError : null]}
                value={currentPassword}
                onChangeText={(value) => {
                  setCurrentPassword(value);
                  if (currentPasswordError) setCurrentPasswordError(null);
                  if (passwordSuccess) setPasswordSuccess(null);
                }}
                placeholder="••••••••"
                placeholderTextColor={colors.grey2}
                secureTextEntry={!showCurrentPassword}
                editable={!passwordSaving}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowCurrentPassword((prev) => !prev)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.grey2}
                />
              </TouchableOpacity>
            </View>
            {currentPasswordError ? <Text style={styles.errorText}>{currentPasswordError}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>New password</Text>
            <View style={styles.passwordFieldWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput, newPasswordError ? styles.inputError : null]}
                value={newPassword}
                onChangeText={(value) => {
                  setNewPassword(value);
                  if (newPasswordError) setNewPasswordError(null);
                  if (passwordSuccess) setPasswordSuccess(null);
                }}
                placeholder="••••••••"
                placeholderTextColor={colors.grey2}
                secureTextEntry={!showNewPassword}
                editable={!passwordSaving}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowNewPassword((prev) => !prev)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.grey2}
                />
              </TouchableOpacity>
            </View>
            {newPasswordError ? <Text style={styles.errorText}>{newPasswordError}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirm new password</Text>
            <View style={styles.passwordFieldWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput, confirmPasswordError ? styles.inputError : null]}
                value={confirmPassword}
                onChangeText={(value) => {
                  setConfirmPassword(value);
                  if (confirmPasswordError) setConfirmPasswordError(null);
                  if (passwordSuccess) setPasswordSuccess(null);
                }}
                placeholder="••••••••"
                placeholderTextColor={colors.grey2}
                secureTextEntry={!showConfirmPassword}
                editable={!passwordSaving}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowConfirmPassword((prev) => !prev)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.grey2}
                />
              </TouchableOpacity>
            </View>
            {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
          </View>

          {passwordFormError ? <Text style={styles.errorText}>{passwordFormError}</Text> : null}
          {passwordSuccess ? <Text style={styles.infoText}>{passwordSuccess}</Text> : null}

          <TouchableOpacity
            style={[styles.submitButton, passwordSaving && styles.submitButtonDisabled]}
            onPress={handleChangePassword}
            disabled={passwordSaving}
          >
            {passwordSaving ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={styles.submitButtonText}>Change password</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

function sectionLabelStyle(colors: { grey2: string }) {
  return {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.grey2,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.08,
    marginBottom: 12,
  };
}
