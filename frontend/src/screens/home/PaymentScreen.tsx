import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  AppState,
} from 'react-native';
import type { AppStateStatus } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
import { initializePremiumPayment, verifyPremiumPayment } from '../../services/subscriptionService';
import { getApiErrorMessage } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

// Real Paystack checkout (no card form here - card details never touch this
// app). Flow: initialize on the backend -> open Paystack's own hosted
// checkout page in the system browser -> when the user returns to the app
// we verify server-to-server via the reference. This deliberately avoids
// adding react-native-webview as a new native dependency (can't be
// installed/verified from this environment); Linking.openURL is built into
// React Native, so this works with zero extra setup. An in-app WebView
// checkout (no browser hand-off) is a natural upgrade later if the team
// installs that package.
type Stage = 'idle' | 'opening' | 'awaiting' | 'verifying' | 'success' | 'error';

export default function PaymentScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [stage, setStage] = useState<Stage>('idle');
  const [reference, setReference] = useState<string | null>(null);
  const [amountPesewas, setAmountPesewas] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // True only while the app was backgrounded specifically because we sent
  // the user to the browser to pay - used to gate the auto-verify-on-return
  // so an unrelated app-switch doesn't trigger a verify call.
  const awaitingReturnRef = useRef(false);

  const handleVerify = useCallback(async (ref: string) => {
    setStage('verifying');
    setErrorMsg(null);
    try {
      const status = await verifyPremiumPayment(ref);
      if (status.premium) {
        // Reflect the new premium status immediately (crown badge on
        // Profile/Discussion) without waiting for the next full profile
        // refetch.
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.setState({ user: { ...currentUser, isPremium: true } });
        }
        setStage('success');
      } else {
        setErrorMsg("Payment not confirmed yet. If you completed checkout, wait a moment and try again - Paystack can take a few seconds to confirm.");
        setStage('error');
      }
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, 'Could not verify payment. Please try again.'));
      setStage('error');
    }
  }, []);

  // Auto-verify the moment the user comes back to the app after being sent
  // to the browser - the manual "I've completed payment" button below is
  // the fallback for whenever this doesn't fire in time.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active' && awaitingReturnRef.current && reference) {
        awaitingReturnRef.current = false;
        handleVerify(reference);
      }
    });
    return () => sub.remove();
  }, [reference, handleVerify]);

  const handlePay = async () => {
    setStage('opening');
    setErrorMsg(null);
    try {
      const result = await initializePremiumPayment();
      setReference(result.reference);
      setAmountPesewas(result.amountPesewas);
      awaitingReturnRef.current = true;
      setStage('awaiting');
      await Linking.openURL(result.authorizationUrl);
    } catch (err) {
      awaitingReturnRef.current = false;
      setErrorMsg(getApiErrorMessage(err, 'Could not start checkout. Please try again.'));
      setStage('error');
    }
  };

  if (stage === 'success') {
    return (
      <View style={[styles.container, styles.doneContainer]}>
        <View style={styles.doneIconWrap}>
          <Text style={styles.doneCheckmark}>✓</Text>
        </View>
        <Text style={styles.doneTitle}>YOU'RE IN, PRO MEMBER</Text>
        <Text style={styles.doneSub}>Welcome to GPL Live Premium</Text>
        <TouchableOpacity style={styles.startButton} onPress={() => navigation.goBack()}>
          <Text style={styles.startButtonText}>START EXPLORING</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={Colors.grey1} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CHECKOUT</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.paystackWrap}>
          <Ionicons name="shield-checkmark" size={40} color={Colors.yellow} />
          <Text style={styles.paystackTitle}>Secure checkout via Paystack</Text>
          <Text style={styles.paystackSub}>
            You'll be taken to Paystack's secure page to pay by card or mobile money. GPL Live never
            sees your card details.
          </Text>
        </View>

        <View style={styles.dueRow}>
          <Text style={styles.dueLabel}>Due today</Text>
          <Text style={styles.dueAmount}>
            {amountPesewas != null ? `GH₵${(amountPesewas / 100).toFixed(2)}` : 'GH₵1.00'}
          </Text>
        </View>

        {stage === 'awaiting' && (
          <View style={styles.awaitingBanner}>
            <ActivityIndicator size="small" color={Colors.yellow} />
            <Text style={styles.awaitingText}>
              Complete your payment in the browser, then come back here.
            </Text>
          </View>
        )}

        {stage === 'error' && errorMsg && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={16} color={Colors.danger} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {stage === 'awaiting' || stage === 'verifying' || (stage === 'error' && reference) ? (
          <TouchableOpacity
            style={[styles.cta, stage === 'verifying' && styles.ctaProcessing]}
            onPress={() => reference && handleVerify(reference)}
            disabled={stage === 'verifying'}
          >
            {stage === 'verifying' ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <>
                <Text style={styles.lockIcon}>✓</Text>
                <Text style={styles.ctaText}>I'VE COMPLETED PAYMENT</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.cta, stage === 'opening' && styles.ctaProcessing]}
            onPress={handlePay}
            disabled={stage === 'opening'}
          >
            {stage === 'opening' ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <>
                <Text style={styles.lockIcon}>🔒</Text>
                <Text style={styles.ctaText}>PAY WITH PAYSTACK</Text>
              </>
            )}
          </TouchableOpacity>
        )}
        <Text style={styles.finePrint}>Cancel anytime. No questions asked.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  doneContainer: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  doneIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  doneCheckmark: { color: '#000000', fontSize: 32, fontWeight: '800' },
  doneTitle: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: fonts.display,
    color: Colors.white,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
  },
  doneSub: { fontSize: 13, color: Colors.grey1, textAlign: 'center' },
  startButton: {
    marginTop: 32,
    backgroundColor: Colors.yellow,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: radius.button,
  },
  startButtonText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 15,
    fontFamily: fonts.display,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.black,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: fonts.display,
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
  },
  content: { flex: 1, padding: 20 },
  paystackWrap: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    marginBottom: 20,
  },
  paystackTitle: { fontSize: 15, fontWeight: '700', color: Colors.white, marginTop: 12, textAlign: 'center' },
  paystackSub: { fontSize: 12, color: Colors.grey1, marginTop: 8, textAlign: 'center', lineHeight: 17 },
  dueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface2,
    borderRadius: radius.input,
    padding: 14,
  },
  dueLabel: { color: Colors.grey1, fontSize: 13 },
  dueAmount: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  awaitingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface2,
    borderRadius: radius.card,
    padding: 14,
    marginTop: 16,
  },
  awaitingText: { flex: 1, fontSize: 12, color: Colors.grey1, lineHeight: 17 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(208,2,27,0.12)',
    borderRadius: radius.card,
    padding: 14,
    marginTop: 16,
  },
  errorText: { flex: 1, fontSize: 12, color: Colors.danger, lineHeight: 17 },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.yellow,
    paddingVertical: 16,
    borderRadius: radius.button,
    width: '100%',
    minHeight: 52,
  },
  ctaProcessing: { opacity: 0.8 },
  lockIcon: { fontSize: 18 },
  ctaText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
    fontFamily: fonts.display,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
  },
  finePrint: { color: Colors.grey2, fontSize: 11, textAlign: 'center', marginTop: 10 },
});
