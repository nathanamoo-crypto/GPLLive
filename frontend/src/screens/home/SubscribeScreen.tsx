import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
import { getScrollBottomPadding } from '../../constants/layout';
import { getMyPremiumStatus } from '../../services/subscriptionService';
import { useTheme } from '../../context/ThemeContext';
import type { HomeStackParamList } from '../../navigation/HomeStack';

const badgeImage = require('../../assets/badge/badge.jpeg');

type SubscribeNavProp = NativeStackNavigationProp<HomeStackParamList, 'Subscribe'>;

// Mirrors PlayerAnalysisService's real premium fields (PlayerDetailsScreen)
// plus the badge shown on the profile/discussion - this list should stay in
// sync with what actually unlocks, not aspirational marketing copy.
const FEATURES = [
  { icon: 'stats-chart' as const, label: 'Average Fantasy Points per player' },
  { icon: 'pulse' as const, label: 'Recent form - last 5 gameweeks' },
  { icon: 'trending-up' as const, label: 'Performance trend (improving/declining/stable)' },
  { icon: 'bulb' as const, label: 'Fantasy insights for every player' },
  { icon: 'ribbon' as const, label: 'Premium badge on your profile & comments' },
];

export default function SubscribeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<SubscribeNavProp>();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [checking, setChecking] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  // Subscribe is opened from Profile (`Home > Subscribe`, a screen nested
  // inside the Home stack) - a plain goBack() only pops within that stack,
  // landing on the Home feed instead of back where the user actually came
  // from. Jumping to the Profile tab directly on the parent (tab) navigator
  // fixes that. popToTop() first resets the Home stack back to just
  // HomeFeed - without it, Subscribe (or Payment, pushed on top of it)
  // stayed at the top of the Home stack's own history, so switching to the
  // Home tab afterward showed Subscribe again instead of the actual feed.
  const returnToProfile = useCallback(() => {
    navigation.popToTop();
    navigation.getParent()?.navigate('Profile' as never);
  }, [navigation]);

  useEffect(() => {
    const controller = new AbortController();
    getMyPremiumStatus(controller.signal)
      .then((status) => setIsPremium(status.premium))
      .catch(() => { /* fall through to the normal subscribe flow */ })
      .finally(() => setChecking(false));
    return () => controller.abort();
  }, []);

  if (checking) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.yellow} />
      </View>
    );
  }

  if (isPremium) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <View style={styles.crownIconWrap}>
          <Image source={badgeImage} style={styles.crownImage} resizeMode="contain" />
        </View>
        <Text style={styles.screenTitle}>YOU'RE ALREADY PRO</Text>
        <Text style={styles.screenSub}>Your GPL Live Premium is active - enjoy full player analysis everywhere.</Text>
        <TouchableOpacity style={styles.cta} onPress={returnToProfile}>
          <Text style={styles.ctaText}>DONE</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={returnToProfile}>
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
        <View style={styles.crownIconWrap}>
          <Image source={badgeImage} style={styles.crownImage} resizeMode="contain" />
        </View>

        <Text style={styles.proLabel}>GPL LIVE PRO</Text>
        <Text style={styles.screenTitle}>UNLOCK FULL PLAYER ANALYSIS</Text>
        <Text style={styles.screenSub}>
          See beyond the basics - average points, form, trend and insights for every player.
        </Text>

        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <View style={styles.planIconWrap}>
              <Ionicons name="flash" size={24} color="#000000" />
            </View>
            <View style={styles.planInfo}>
              <Text style={styles.planName}>GPL Live Premium</Text>
              <Text style={styles.planPeriod}>per month</Text>
            </View>
            <Text style={styles.planPrice}>GH₵1.00</Text>
          </View>
          <View style={styles.featureList}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.featureIconWrap}>
                  <Ionicons name={f.icon} size={16} color={colors.yellow} />
                </View>
                <Text style={styles.featureText}>{f.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cta}
          onPress={() => navigation.navigate('Payment')}
        >
          <Image source={badgeImage} style={styles.crownCtaImage} resizeMode="contain" />
          <Text style={styles.ctaText}>SUBSCRIBE NOW - GH₵1.00</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.laterButton} onPress={returnToProfile}>
          <Text style={styles.laterText}>Maybe later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.black },
    centered: { alignItems: 'center', justifyContent: 'center', padding: 24 },
    headerBar: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    closeText: { color: colors.grey1, fontSize: 14 },
    list: { flex: 1 },
    listContent: { padding: 20, alignItems: 'center' },
    crownIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.yellow,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    crownImage: { width: 36, height: 36 },
    proLabel: {
      color: colors.yellow,
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
      color: colors.white,
      textTransform: 'uppercase',
      textAlign: 'center',
      marginBottom: 6,
    },
    screenSub: { fontSize: 13, color: colors.grey1, marginBottom: 24, textAlign: 'center' },
    planCard: {
      width: '100%',
      padding: 16,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: colors.yellow,
      backgroundColor: colors.surface2,
    },
    planHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    planIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.yellow,
      alignItems: 'center',
      justifyContent: 'center',
    },
    planInfo: { flex: 1 },
    planName: { fontSize: 15, fontWeight: '700', color: colors.white },
    planPeriod: { fontSize: 12, color: colors.grey2, marginTop: 2 },
    planPrice: { fontSize: 22, fontWeight: '800', color: colors.yellow },
    featureList: { gap: 10 },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    featureIconWrap: {
      width: 26,
      height: 26,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    featureText: { fontSize: 13, color: colors.grey1, flex: 1 },
    footer: {
      padding: 20,
      alignItems: 'center',
    },
    cta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.yellow,
      paddingVertical: 16,
      borderRadius: radius.button,
      width: '100%',
    },
    crownCtaImage: { width: 18, height: 18 },
    ctaText: {
      color: '#000000',
      fontSize: 15,
      fontWeight: '800',
      fontFamily: fonts.display,
      textTransform: 'uppercase',
      letterSpacing: 0.06,
    },
    laterButton: { marginTop: 12 },
    laterText: { color: colors.grey1, fontSize: 13, textAlign: 'center' },
  });
}
