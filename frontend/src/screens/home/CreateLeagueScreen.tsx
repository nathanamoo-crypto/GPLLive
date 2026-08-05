import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
import { useTheme } from '../../context/ThemeContext';
import { getApiErrorMessage } from '../../services/api';
import { createLeague } from '../../services/leagueService';
import type { HomeStackParamList } from '../../navigation/HomeStack';

type NavProp = NativeStackNavigationProp<HomeStackParamList, 'CreateLeague'>;

const DEFAULT_MEMBER_LIMIT = 20;
const MIN_MEMBER_LIMIT = 2;
const MAX_MEMBER_LIMIT = 200;

export default function CreateLeagueScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [memberLimit, setMemberLimit] = useState(String(DEFAULT_MEMBER_LIMIT));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Give your league a name.');
      return;
    }
    const limit = parseInt(memberLimit, 10);
    if (Number.isNaN(limit) || limit < MIN_MEMBER_LIMIT || limit > MAX_MEMBER_LIMIT) {
      setError(`Member limit must be between ${MIN_MEMBER_LIMIT} and ${MAX_MEMBER_LIMIT}.`);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const league = await createLeague({ name: trimmedName, isPublic, memberLimit: limit });
      navigation.replace('LeagueDetail', { leagueId: league.id });
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Could not create the league.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create League</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>League name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Office Kotoko Fans"
          placeholderTextColor={colors.grey2}
          value={name}
          onChangeText={setName}
          maxLength={60}
        />

        <Text style={styles.label}>Who can join</Text>
        <View style={styles.visibilityRow}>
          <TouchableOpacity
            style={[styles.visibilityOption, isPublic && styles.visibilityOptionActive]}
            onPress={() => setIsPublic(true)}
          >
            <Ionicons name="earth-outline" size={18} color={isPublic ? colors.black : colors.grey1} />
            <View style={styles.visibilityTextWrap}>
              <Text style={[styles.visibilityTitle, isPublic && styles.visibilityTitleActive]}>Public</Text>
              <Text style={[styles.visibilitySub, isPublic && styles.visibilityTitleActive]}>
                Anyone can find and join instantly
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.visibilityOption, !isPublic && styles.visibilityOptionActive]}
            onPress={() => setIsPublic(false)}
          >
            <Ionicons name="lock-closed-outline" size={18} color={!isPublic ? colors.black : colors.grey1} />
            <View style={styles.visibilityTextWrap}>
              <Text style={[styles.visibilityTitle, !isPublic && styles.visibilityTitleActive]}>Private</Text>
              <Text style={[styles.visibilitySub, !isPublic && styles.visibilityTitleActive]}>
                Hidden from search - join by invite code, you approve requests
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Member limit</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={memberLimit}
          onChangeText={setMemberLimit}
          maxLength={3}
        />
        <Text style={styles.hint}>Between {MIN_MEMBER_LIMIT} and {MAX_MEMBER_LIMIT} members.</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.createButton, submitting && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colors.black} />
          ) : (
            <Text style={styles.createButtonText}>Create League</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.black },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: { padding: 4, width: 30 },
    headerTitle: { fontSize: 16, fontWeight: '800', color: colors.white, fontFamily: fonts.display, textTransform: 'uppercase' },
    content: { padding: 16 },
    label: { fontSize: 12, fontWeight: '700', color: colors.grey1, textTransform: 'uppercase', letterSpacing: 0.05, marginBottom: 8, marginTop: 18 },
    input: {
      backgroundColor: colors.surface2,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: colors.white,
      fontSize: 15,
    },
    hint: { fontSize: 11, color: colors.grey2, marginTop: 6 },
    visibilityRow: { gap: 10 },
    visibilityOption: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      padding: 14,
      borderRadius: radius.card,
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    visibilityOptionActive: { backgroundColor: colors.yellow, borderColor: colors.yellow },
    visibilityTextWrap: { flex: 1 },
    visibilityTitle: { fontSize: 14, fontWeight: '700', color: colors.white },
    visibilityTitleActive: { color: colors.black },
    visibilitySub: { fontSize: 12, color: colors.grey2, marginTop: 2 },
    errorText: { color: colors.live, fontSize: 13, marginTop: 16, textAlign: 'center' },
    createButton: {
      marginTop: 28,
      backgroundColor: colors.yellow,
      borderRadius: radius.card,
      paddingVertical: 14,
      alignItems: 'center',
    },
    createButtonDisabled: { opacity: 0.6 },
    createButtonText: { fontSize: 15, fontWeight: '800', color: colors.black },
  });
}
