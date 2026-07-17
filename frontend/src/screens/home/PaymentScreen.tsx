import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';

type PaymentMethod = 'card' | 'mobile';

export default function PaymentScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
    }, 2000);
  };

  if (done) {
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={Colors.grey1} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PAYMENT METHOD</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.screenTitle}>CHOOSE HOW TO PAY</Text>

        <TouchableOpacity
          style={[styles.methodBtn, method === 'card' && styles.methodBtnActive]}
          onPress={() => setMethod('card')}
        >
          <View style={styles.radioWrap}>
            <View style={[styles.radioOuter, method === 'card' && styles.radioOuterActive]}>
              {method === 'card' && <View style={styles.radioInner} />}
            </View>
          </View>
          <View style={styles.methodIconWrap}>
            <Ionicons name="card" size={20} color={Colors.grey1} />
          </View>
          <View style={styles.methodInfo}>
            <Text style={styles.methodName}>Card Payment</Text>
            <Text style={styles.methodSub}>Credit or debit card</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.methodBtn, method === 'mobile' && styles.methodBtnActive]}
          onPress={() => setMethod('mobile')}
        >
          <View style={styles.radioWrap}>
            <View style={[styles.radioOuter, method === 'mobile' && styles.radioOuterActive]}>
              {method === 'mobile' && <View style={styles.radioInner} />}
            </View>
          </View>
          <View style={styles.methodIconWrap}>
            <Ionicons name="phone-portrait" size={20} color={Colors.grey1} />
          </View>
          <View style={styles.methodInfo}>
            <Text style={styles.methodName}>Mobile Money</Text>
            <Text style={styles.methodSub}>MTN / Vodafone / AirtelTigo</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.form}>
          {method === 'card' ? (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="4242 4242 4242 4242"
                  placeholderTextColor={Colors.grey2}
                  value={cardNum}
                  onChangeText={(t) =>
                    setCardNum(
                      t
                        .replace(/\D/g, '')
                        .replace(/(.{4})/g, '$1 ')
                        .trim()
                        .slice(0, 19)
                    )
                  }
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.row2}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Expiry</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    placeholderTextColor={Colors.grey2}
                    value={expiry}
                    onChangeText={(t) =>
                      setExpiry(
                        t
                          .replace(/\D/g, '')
                          .replace(/(\d{2})(\d)/, '$1/$2')
                          .slice(0, 5)
                      )
                    }
                    keyboardType="number-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    placeholderTextColor={Colors.grey2}
                    value={cvv}
                    onChangeText={(t) => setCvv(t.replace(/\D/g, '').slice(0, 3))}
                    secureTextEntry
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            </>
          ) : (
            <View style={styles.field}>
              <Text style={styles.label}>Mobile Money Number</Text>
              <TextInput
                style={styles.input}
                placeholder="054 000 0000"
                placeholderTextColor={Colors.grey2}
                value={phone}
                onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                keyboardType="phone-pad"
              />
            </View>
          )}
        </View>

        <View style={styles.dueRow}>
          <Text style={styles.dueLabel}>Due today (7-day trial)</Text>
          <Text style={styles.dueAmount}>¢0.00</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, processing && styles.ctaProcessing]}
          onPress={handlePay}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <>
              <Text style={styles.lockIcon}>🔒</Text>
              <Text style={styles.ctaText}>CONFIRM & START TRIAL</Text>
            </>
          )}
        </TouchableOpacity>
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
  screenTitle: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fonts.display,
    color: Colors.grey1,
    textTransform: 'uppercase',
    letterSpacing: 0.1,
    marginBottom: 12,
  },
  methodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginBottom: 10,
  },
  methodBtnActive: { borderColor: Colors.yellow, backgroundColor: Colors.surface2 },
  radioWrap: { width: 24, alignItems: 'center' },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.grey2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: { borderColor: Colors.yellow },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.yellow,
  },
  methodIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  methodInfo: { flex: 1 },
  methodName: { fontSize: 15, fontWeight: '700', color: Colors.white },
  methodSub: { fontSize: 12, color: Colors.grey1, marginTop: 2 },
  form: { gap: 16, marginBottom: 24, marginTop: 20 },
  field: { marginBottom: 4 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fonts.display,
    color: Colors.grey1,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
  input: {
    backgroundColor: Colors.surface2,
    borderRadius: radius.input,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row2: { flexDirection: 'row', gap: 12 },
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
