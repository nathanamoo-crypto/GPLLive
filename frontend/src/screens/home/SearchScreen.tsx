import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
import { useTheme } from '../../context/ThemeContext';
import { getApiErrorMessage } from '../../services/api';
import { searchLeagues, getMyLeagues, joinLeagueByCode } from '../../services/leagueService';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import type { League } from '../../types';

type SearchNavProp = NativeStackNavigationProp<HomeStackParamList, 'Search'>;

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<SearchNavProp>();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<League[]>([]);
  const [myLeagues, setMyLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState('');
  const [codeBusy, setCodeBusy] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  const loadAll = useCallback(async (q: string) => {
    const [publicLeagues, mine] = await Promise.all([
      searchLeagues(q),
      getMyLeagues(),
    ]);
    return { publicLeagues, mine };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadAll(query.trim())
      .then(({ publicLeagues, mine }) => {
        if (cancelled) return;
        // Leagues the caller already owns/belongs to show under "My
        // Leagues" above - no need to repeat them in the public list too.
        const mineIds = new Set(mine.map((l) => l.id));
        setResults(publicLeagues.filter((l) => !mineIds.has(l.id)));
        setMyLeagues(mine);
      })
      .catch((err: any) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Could not load leagues.'));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // Debounced-ish: only the query itself retriggers this, not every
    // keystroke re-running instantly - React batches fast typing into the
    // same tick often enough that this stays responsive without a manual
    // debounce for a search this size (a few hundred leagues at most).
  }, [query, loadAll]);

  // My Leagues can change (accepted request, left a league) while this
  // screen isn't focused - refresh it coming back, same pattern used for
  // the notification badge and the league detail screen's pending list.
  useFocusEffect(
    useCallback(() => {
      getMyLeagues().then(setMyLeagues).catch(() => {});
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const { publicLeagues, mine } = await loadAll(query.trim());
      const mineIds = new Set(mine.map((l) => l.id));
      setResults(publicLeagues.filter((l) => !mineIds.has(l.id)));
      setMyLeagues(mine);
      setError(null);
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Could not load leagues.'));
    }
    setRefreshing(false);
  }, [loadAll, query]);

  const handleJoinByCode = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setCodeError('Enter a code.');
      return;
    }
    setCodeError(null);
    setCodeBusy(true);
    try {
      const league = await joinLeagueByCode(trimmed);
      setCode('');
      setCodeOpen(false);
      navigation.navigate('LeagueDetail', { leagueId: league.id });
    } catch (err: any) {
      setCodeError(getApiErrorMessage(err, 'Could not find or join that league.'));
    } finally {
      setCodeBusy(false);
    }
  };

  const renderLeagueCard = (league: League) => (
    <TouchableOpacity
      key={league.id}
      style={styles.resultCard}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('LeagueDetail', { leagueId: league.id })}
    >
      <View style={[styles.resultIcon, { backgroundColor: colors.yellow + '18' }]}>
        <Ionicons name={league.isPublic ? 'earth-outline' : 'lock-closed-outline'} size={18} color={colors.yellow} />
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultLabel} numberOfLines={1}>{league.name}</Text>
        <Text style={styles.resultSub}>
          {league.activeMemberCount}/{league.memberLimit} members · by {league.creatorUsername}
        </Text>
      </View>
      {league.callerStatus === 'ACTIVE' || league.callerStatus === 'OWNER' ? (
        <Text style={styles.joinedTag}>{league.callerStatus === 'OWNER' ? 'Owner' : 'Joined'}</Text>
      ) : league.callerStatus === 'PENDING' ? (
        <Text style={styles.pendingTag}>Pending</Text>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.grey2} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={colors.grey2} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search leagues by name..."
            placeholderTextColor={colors.grey2}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.grey2} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.createIconButton}
          onPress={() => navigation.navigate('CreateLeague')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="add" size={24} color={colors.black} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.codeToggle} onPress={() => setCodeOpen((v) => !v)}>
        <Ionicons name="key-outline" size={16} color={colors.yellow} />
        <Text style={styles.codeToggleText}>Have an invite code?</Text>
        <Ionicons name={codeOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.grey2} />
      </TouchableOpacity>

      {codeOpen ? (
        <View style={styles.codeBox}>
          <View style={styles.codeRow}>
            <TextInput
              style={styles.codeInput}
              placeholder="e.g. KTK4X9"
              placeholderTextColor={colors.grey2}
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
              maxLength={12}
            />
            <TouchableOpacity style={styles.codeGoButton} onPress={handleJoinByCode} disabled={codeBusy}>
              {codeBusy ? <ActivityIndicator size="small" color={colors.black} /> : <Text style={styles.codeGoButtonText}>Join</Text>}
            </TouchableOpacity>
          </View>
          {codeError ? <Text style={styles.codeErrorText}>{codeError}</Text> : null}
          <Text style={styles.codeHint}>Or just search by name above - private leagues show up too, joining always sends the owner a request to approve.</Text>
        </View>
      ) : null}

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          data={results}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={
            myLeagues.length > 0 ? (
              <View style={styles.myLeaguesSection}>
                <Text style={styles.sectionHeading}>My Leagues</Text>
                {myLeagues.map(renderLeagueCard)}
                <Text style={[styles.sectionHeading, { marginTop: 18 }]}>
                  {query.trim() ? 'Search Results' : 'Other Leagues'}
                </Text>
              </View>
            ) : (
              <Text style={styles.sectionHeading}>{query.trim() ? 'Search Results' : 'All Leagues'}</Text>
            )
          }
          renderItem={({ item }) => renderLeagueCard(item)}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={colors.grey2} />
              <Text style={styles.emptyText}>
                {query.trim() ? `No leagues match "${query}"` : 'No leagues yet - be the first to create one.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.black },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: { padding: 4 },
    searchWrap: { flex: 1, position: 'relative' },
    searchIcon: { position: 'absolute', left: 14, top: 13, zIndex: 1 },
    searchInput: {
      width: '100%',
      paddingVertical: 12,
      paddingLeft: 42,
      paddingRight: 36,
      borderRadius: 12,
      backgroundColor: colors.surface2,
      color: colors.white,
      fontSize: 15,
      borderWidth: 1,
      borderColor: colors.border,
    },
    clearBtn: { position: 'absolute', right: 10, top: 12 },
    createIconButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.yellow,
      alignItems: 'center',
      justifyContent: 'center',
    },
    codeToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    codeToggleText: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.grey1 },
    codeBox: {
      margin: 16,
      padding: 12,
      borderRadius: radius.card,
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    codeRow: { flexDirection: 'row', gap: 8 },
    codeInput: {
      flex: 1,
      backgroundColor: colors.black,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.white,
      fontSize: 14,
      borderWidth: 1,
      borderColor: colors.border,
      letterSpacing: 1,
    },
    codeGoButton: {
      backgroundColor: colors.yellow,
      borderRadius: 8,
      paddingHorizontal: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    codeGoButtonText: { fontSize: 13, fontWeight: '800', color: '#000000' },
    codeErrorText: { fontSize: 12, color: colors.live, marginTop: 8 },
    codeHint: { fontSize: 11, color: colors.grey2, marginTop: 8 },
    list: { flex: 1 },
    listContent: { padding: 16, gap: 8 },
    myLeaguesSection: { gap: 8 },
    sectionHeading: { fontSize: 12, fontWeight: '800', color: colors.grey1, textTransform: 'uppercase', letterSpacing: 0.05, marginBottom: 4 },
    resultCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: radius.card,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
    },
    resultIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    resultInfo: { flex: 1 },
    resultLabel: { fontSize: 15, fontWeight: '700', color: colors.white },
    resultSub: { fontSize: 12, color: colors.grey2, marginTop: 2 },
    joinedTag: { fontSize: 11, fontWeight: '700', color: colors.win },
    pendingTag: { fontSize: 11, fontWeight: '700', color: colors.yellow },
    emptyState: { alignItems: 'center', paddingTop: 80, gap: 12, paddingHorizontal: 24 },
    emptyText: { fontSize: 14, color: colors.grey2, textAlign: 'center' },
  });
}
