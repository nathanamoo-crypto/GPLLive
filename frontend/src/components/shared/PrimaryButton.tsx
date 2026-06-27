import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export default function PrimaryButton({
  title,
  onPress,
  icon,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = true,
}: PrimaryButtonProps) {
  const bgColor =
    variant === 'primary' ? Colors.primary :
    variant === 'secondary' ? Colors.surfaceAlt :
    variant === 'danger' ? Colors.live :
    'transparent';

  const txtColor =
    variant === 'ghost' ? Colors.textPrimary :
    Colors.textInverse;

  const borderStyle =
    variant === 'secondary' || variant === 'ghost'
      ? { borderWidth: 1, borderColor: Colors.border }
      : {};

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: bgColor },
        borderStyle,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={txtColor} size="small" />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={txtColor} />}
          <Text style={[styles.text, { color: txtColor }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    fontSize: 15,
    fontWeight: '800',
  },
});
