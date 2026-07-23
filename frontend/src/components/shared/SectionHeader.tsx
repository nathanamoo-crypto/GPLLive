import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { fonts } from '../../constants/layout';
import { useTheme } from '../../context/ThemeContext';

interface SectionHeaderProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function SectionHeader({
  title,
  icon,
  iconColor,
  actionLabel,
  onAction,
}: SectionHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const resolvedIconColor = iconColor ?? colors.yellow;

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {icon && (
          <View style={[styles.iconWrap, { backgroundColor: resolvedIconColor + '20' }]}>
            <Ionicons name={icon} size={14} color={resolvedIconColor} />
          </View>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} style={styles.action}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.yellow} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    iconWrap: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 16,
      fontWeight: '800',
      fontFamily: fonts.display,
      color: colors.yellow,
      textTransform: 'uppercase',
      letterSpacing: 0.08,
    },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    actionText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.yellow,
    },
  });
}
