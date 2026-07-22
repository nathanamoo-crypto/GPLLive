import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
import { useTheme } from '../../context/ThemeContext';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'danger' | 'outline';
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
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const bgColor =
    variant === 'primary' ? colors.yellow :
    variant === 'danger' ? colors.red :
    colors.surface2;

  const txtColor =
    variant === 'primary' ? '#000000' :
    colors.white;

  const borderStyle =
    variant === 'outline'
      ? { borderWidth: 1, borderColor: colors.border }
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

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: radius.button,
      width: '100%',
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
      fontFamily: fonts.display,
      textTransform: 'uppercase',
      letterSpacing: 0.06,
    },
  });
}
