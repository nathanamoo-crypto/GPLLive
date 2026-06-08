import { StyleSheet } from 'react-native';

import { Colors } from '../../constants/colors';

export const authFormStyles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  field: { marginBottom: 18 },
  label: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputError: {
    borderColor: Colors.live,
  },
  errorText: {
    color: Colors.live,
    fontSize: 12,
    marginTop: 6,
  },
  submitButton: {
    backgroundColor: Colors.primary,
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
  submitButtonText: { color: Colors.textInverse, fontWeight: '700', fontSize: 15 },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 4,
    marginBottom: 24,
  },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 16 },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { color: Colors.textSecondary, fontWeight: '700' },
  tabTextActive: { color: Colors.textInverse },
  forgotText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 18,
    textAlign: 'right',
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 12,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  googleButtonText: {
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  demoButton: {
    backgroundColor: Colors.accent,
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 18,
    alignItems: 'center',
  },
  demoButtonText: { color: Colors.textPrimary, fontWeight: '700', fontSize: 13 },
});
