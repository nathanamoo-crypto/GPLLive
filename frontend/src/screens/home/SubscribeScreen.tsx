import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { getScrollBottomPadding } from '../../constants/layout';
import type { HomeStackParamList } from '../../navigation/HomeStack';

type SubscribeNavProp = NativeStackNavigationProp<HomeStackParamList, 'Subscribe'>;

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  icon: keyof typeof Ionicons.glyphMap;
  popular?: boolean;
  features: string[];
}

/**
 * TODO: Replace with API call — see APIDocs.md → GET /subscriptions
 */
const PLANS: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 'GH₵15',
    period: 'per month',
    icon: 'flash',
    features: [
      'Live match updates',
      'Basic statistics',
      'Standard support',
    ],
  },
  {
    id: 'seasonal',
    name: 'Seasonal',
    price: 'GH₵75',
    period: 'per season',
    icon: 'trophy',
    popular: true,
    features: [
      'Everything in Monthly',
      'Ad-free experience',
      'Fantasy football access',
      'Match predictions',
      'Priority support',
    ],
  },
  {
    id: 'annual',
    name: 'Annual',
    price: 'GH₵120',
    period: 'per year',
    icon: 'sparkles',
    features: [
      'Everything in Seasonal',
      'Exclusive content',
      'Early access to features',
      'VIP event invites',
      'Dedicated account manager',
    ],
  },
];

export default function SubscribeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<SubscribeNavProp>();
  const [selectedPlan, setSelectedPlan] = useState('seasonal');

  const activePlan = PLANS.find((p) => p.id === selectedPlan);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscribe</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: getScrollBottomPadding(insets.bottom) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Upgrade Your Experience</Text>
        <Text style={styles.screenSub}>Unlock premium features for your favourite club</Text>

        {PLANS.map((plan) => {
          const active = plan.id === selectedPlan;
          return (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planCard, active && styles.planCardActive]}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.7}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>POPULAR</Text>
                </View>
              )}
              <View style={styles.planHeader}>
                <View style={styles.planIconWrap}>
                  <Ionicons name={plan.icon} size={24} color={Colors.fantasyGold} />
                </View>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                </View>
                <Text style={styles.planPrice}>{plan.price}</Text>
              </View>
              <View style={styles.featureList}>
                {plan.features.map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cta}
          onPress={() => navigation.navigate('Payment')}
        >
          <Ionicons name="card-outline" size={20} color={Colors.textInverse} />
          <Text style={styles.ctaText}>
            Subscribe {activePlan ? `- ${activePlan.price}` : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
  list: { flex: 1 },
  listContent: { padding: 20 },
  screenTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
  screenSub: { fontSize: 14, color: Colors.textSecondary, marginBottom: 24 },
  planCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginBottom: 14,
    position: 'relative',
  },
  planCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(26,124,62,0.06)',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: Colors.fantasyGold,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  popularText: { color: '#000', fontSize: 11, fontWeight: '800' },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  planIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,215,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planInfo: { flex: 1 },
  planName: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  planPeriod: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
  planPrice: { fontSize: 20, fontWeight: '800', color: Colors.fantasyGold },
  featureList: { gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 13, color: Colors.textSecondary },
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
  },
  ctaText: { color: Colors.textInverse, fontSize: 16, fontWeight: '700' },
});
