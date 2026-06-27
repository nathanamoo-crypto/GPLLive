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

  /**
   * TODO: Replace with API call — see APIDocs.md → POST /subscriptions/payment
   */
  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
      setTimeout(() => navigation.goBack(), 2000);
    }, 2000);
  };

  if (done) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top },
          styles.doneContainer,
        ]}
      >
        <View style={styles.doneIconWrap}>
          <Ionicons name="checkmark-circle" size={64} color={Colors.primary} />
        </View>
        <Text style={styles.doneTitle}>Payment Successful!</Text>
        <Text style={styles.doneSub}>Welcome to GPL Live Premium</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.screenTitle}>Choose Payment Method</Text>

        <View style={styles.methodRow}>
          <TouchableOpacity
            style={[styles.methodBtn, method === 'card' && styles.methodBtnActive]}
            onPress={() => setMethod('card')}
          >
            <Ionicons
              name="card"
              size={20}
              color={method === 'card' ? Colors.primary : Colors.textTertiary}
            />
            <Text
              style={[
                styles.methodText,
                method === 'card' && styles.methodTextActive,
              ]}
            >
              Card
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.methodBtn, method === 'mobile' && styles.methodBtnActive]}
            onPress={() => setMethod('mobile')}
          >
            <Ionicons
              name="phone-portrait"
              size={20}
              color={method === 'mobile' ? Colors.primary : Colors.textTertiary}
            />
            <Text
              style={[
                styles.methodText,
                method === 'mobile' && styles.methodTextActive,
              ]}
            >
              Mobile Money
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {method === 'card' ? (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="4242 4242 4242 4242"
                  placeholderTextColor={Colors.textTertiary}
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
                    placeholderTextColor={Colors.textTertiary}
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
                    placeholderTextColor={Colors.textTertiary}
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
                placeholderTextColor={Colors.textTertiary}
                value={phone}
                onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                keyboardType="phone-pad"
              />
            </View>
          )}
        </View>

        <View style={styles.secureRow}>
          <Ionicons name="lock-closed" size={14} color={Colors.textTertiary} />
          <Text style={styles.secureText}>Secured with 256-bit encryption</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, processing && styles.ctaProcessing]}
          onPress={handlePay}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color={Colors.textInverse} />
          ) : (
            <>
              <Ionicons name="lock-closed" size={18} color={Colors.textInverse} />
              <Text style={styles.ctaText}>Pay Now</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  doneContainer: { alignItems: 'center', justifyContent: 'center' },
  doneIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(26,124,62,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  doneTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8 },
  doneSub: { fontSize: 15, color: Colors.textSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  content: { flex: 1, padding: 20 },
  screenTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 24 },
  methodRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  methodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  methodBtnActive: { borderColor: Colors.primary, backgroundColor: 'rgba(26,124,62,0.08)' },
  methodText: { fontSize: 14, fontWeight: '600', color: Colors.textTertiary },
  methodTextActive: { color: Colors.primary, fontWeight: '700' },
  form: { gap: 16, marginBottom: 24 },
  field: { marginBottom: 4 },
  label: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8, fontWeight: '600' },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
  },
  row2: { flexDirection: 'row', gap: 12 },
  secureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  secureText: { fontSize: 12, color: Colors.textTertiary },
  footer: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    minHeight: 52,
  },
  ctaProcessing: { opacity: 0.8 },
  ctaText: { color: Colors.textInverse, fontSize: 16, fontWeight: '700' },
});
