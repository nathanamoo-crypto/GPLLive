import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '../../constants/colors';
import { fonts } from '../../constants/layout';
import { useTheme } from '../../context/ThemeContext';

export interface ActionSheetOption {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  options: ActionSheetOption[];
  onClose: () => void;
}

// React Native's native Alert.alert() renders completely differently per
// platform once you pass it more than 2-3 buttons: iOS shows all of them as
// a proper bottom action sheet, but Android's AlertDialog only has 3 button
// slots (positive/neutral/negative) - anything past the 3rd is silently
// dropped, with no visual indication anything's missing. That bit us on the
// player-options menu (Make Captain / Make Vice-Captain / Swap with Bench /
// View Details / Cancel - 5 options), where Android users lost "View
// Details" and "Cancel" entirely. This component replaces Alert.alert() for
// any menu with more than 2 options, so both platforms render identically -
// same bottom sheet, same rows, same Cancel button, every time.
export default function ActionSheet({ visible, title, subtitle, options, onClose }: ActionSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const handlePress = (option: ActionSheetOption) => {
    onClose();
    option.onPress();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        {/* Swallows taps so they don't fall through to the backdrop and
            close the sheet when tapping inside the panel itself. */}
        <View
          style={[styles.panel, { paddingBottom: Math.max(insets.bottom, 16) }]}
          onStartShouldSetResponder={() => true}
        >
          {(title || subtitle) && (
            <View style={styles.header}>
              {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : null}
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          )}

          <View style={styles.optionsWrap}>
            {options.map((option, idx) => (
              <TouchableOpacity
                key={option.label}
                style={[styles.option, idx === options.length - 1 && styles.optionLast]}
                onPress={() => handlePress(option)}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionText, option.destructive && styles.optionTextDestructive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    panel: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      paddingTop: 16,
      paddingHorizontal: 16,
      borderTopWidth: 1,
      borderColor: colors.border,
    },
    header: {
      paddingHorizontal: 4,
      paddingBottom: 12,
      marginBottom: 4,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      alignItems: 'center',
    },
    title: {
      fontSize: 15,
      fontWeight: '800',
      fontFamily: fonts.display,
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    optionsWrap: {
      backgroundColor: colors.background,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 10,
    },
    option: {
      paddingVertical: 15,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    optionLast: { borderBottomWidth: 0 },
    optionText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.yellow,
    },
    optionTextDestructive: {
      color: colors.live,
    },
    cancelButton: {
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: 'center',
    },
    cancelText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textSecondary,
    },
  });
}
