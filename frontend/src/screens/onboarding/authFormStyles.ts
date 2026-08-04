import { StyleSheet } from 'react-native';

import { Colors } from '../../constants/colors';

export function getAuthFormStyles(colors: typeof Colors) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    container: {
      flexGrow: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 24,
      justifyContent: 'center',
    },
    heading: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.textPrimary,
      marginBottom: 8,
    },
    subheading: {
      fontSize: 15,
      color: colors.textSecondary,
      marginBottom: 24,
    },
    field: { marginBottom: 18 },
    label: { fontSize: 13, color: colors.textSecondary, marginBottom: 6 },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 14,
      fontSize: 15,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
    },
    inputError: {
      borderColor: colors.live,
    },
    // Wraps a password TextInput so the show/hide toggle can be absolutely
    // positioned inside it, on top of the input, rather than as a sibling
    // that would need its own layout math.
    passwordFieldWrapper: {
      justifyContent: 'center',
    },
    // Extra right padding on the input itself so typed text never runs
    // under the toggle icon.
    passwordInput: {
      paddingRight: 46,
    },
    passwordToggle: {
      position: 'absolute',
      right: 4,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
      paddingHorizontal: 10,
    },
    errorText: {
      color: colors.live,
      fontSize: 12,
      marginTop: 6,
    },
    submitButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: 'center',
      marginTop: 4,
      minHeight: 52,
      justifyContent: 'center',
    },
    submitButtonDisabled: {
      opacity: 0.7,
    },
    submitButtonText: { color: colors.textInverse, fontWeight: '700', fontSize: 15 },
    tabRow: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 4,
      marginBottom: 24,
    },
    tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 16 },
    tabActive: { backgroundColor: colors.primary },
    tabText: { color: colors.textSecondary, fontWeight: '700' },
    tabTextActive: { color: colors.textInverse },
    forgotText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 18,
      textAlign: 'right',
    },
    infoText: {
      color: colors.textSecondary,
      fontSize: 12,
      marginBottom: 12,
    },
    clubPickerLoading: {
      paddingVertical: 12,
      alignItems: 'flex-start',
    },
    retryText: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: 13,
      marginTop: 6,
    },
    clubList: {
      paddingVertical: 4,
      gap: 10,
    },
    clubChip: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 84,
      marginRight: 10,
      paddingVertical: 10,
      paddingHorizontal: 6,
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    clubChipActive: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    clubChipBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
      overflow: 'hidden',
    },
    clubChipBadgeImage: { width: 24, height: 24 },
    clubChipText: {
      fontSize: 11,
      color: colors.textPrimary,
      fontWeight: '600',
      textAlign: 'center',
    },
    clubChipTextActive: { color: colors.primary },
    switchModeRow: {
      marginTop: 20,
      alignItems: 'center',
    },
    switchModeText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    switchModeLink: {
      color: colors.primary,
      fontWeight: '700',
    },
  });
}
