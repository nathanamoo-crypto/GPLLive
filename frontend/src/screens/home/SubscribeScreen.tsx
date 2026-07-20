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
import { fonts, radius } from '../../constants/layout';
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
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Close button */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>Not now</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: getScrollBottomPadding(insets.bottom) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Crown icon */}
        <View style={styles.crownIconWrap}>
          <Text style={styles.crownEmoji}>👑</Text>
        </View>

        <Text style={styles.proLabel}>GPL LIVE PRO</Text>
        <Text style={styles.screenTitle}>GO BEHIND THE SCENES WITH YOUR CLUB</Text>
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
                <View style={[styles.planIconWrap, active && styles.planIconWrapActive]}>
                  <Ionicons name={plan.icon} size={24} color={active ? '#000000' : Colors.yellow} />
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
                    <View style={styles.featureIconWrap}>
                      <Ionicons name="checkmark-circle" size={14} color={Colors.yellow} />
                    </View>
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
          <Text style={styles.crownCta}>👑</Text>
          <Text style={styles.ctaText}>
            SUBSCRIBE NOW {activePlan ? `- ${activePlan.price}` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.laterButton} onPress={() => navigation.goBack()}>
          <Text style={styles.laterText}>Maybe later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeText: { color: Colors.grey1, fontSize: 14 },
  list: { flex: 1 },
  listContent: { padding: 20, alignItems: 'center' },
  crownIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  crownEmoji: { fontSize: 32 },
  proLabel: {
    color: Colors.yellow,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: fonts.display,
    letterSpacing: 0.1,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: fonts.display,
    color: Colors.white,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 6,
  },
  screenSub: { fontSize: 13, color: Colors.grey1, marginBottom: 24, textAlign: 'center' },
  planCard: {
    width: '100%',
    padding: 14,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    marginBottom: 8,
    position: 'relative',
  },
  planCardActive: {
    borderColor: Colors.yellow,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: Colors.yellow,
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
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  planIconWrapActive: { backgroundColor: Colors.yellow, borderColor: Colors.yellow },
  planInfo: { flex: 1 },
  planName: { fontSize: 14, fontWeight: '600', color: Colors.white },
  planPeriod: { fontSize: 12, color: Colors.grey2, marginTop: 2 },
  planPrice: { fontSize: 20, fontWeight: '800', color: Colors.yellow },
  featureList: { gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { fontSize: 13, color: Colors.grey1 },
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
  },
  crownCta: { fontSize: 18 },
  ctaText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
    fontFamily: fonts.display,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
  },
  laterButton: { marginTop: 12 },
  laterText: { color: Colors.grey1, fontSize: 13, textAlign: 'center' },
});
