import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
import type { HomeStackParamList } from '../../navigation/HomeStack';

interface SearchResult {
  id: string;
  type: 'player' | 'club' | 'news';
  label: string;
  subtitle: string;
}

/**
 * TODO: Replace with API call — see APIDocs.md → GET /search
 */
const MOCK_DATA: SearchResult[] = [
  { id: 's1', type: 'player', label: 'Frank Etouga', subtitle: 'Asante Kotoko · FWD' },
  { id: 's2', type: 'player', label: 'Gladson Awako', subtitle: 'Hearts of Oak · MID' },
  { id: 's3', type: 'player', label: 'Richard Attah', subtitle: 'Hearts of Oak · GK' },
  { id: 's4', type: 'player', label: 'Ibrahim Danlad', subtitle: 'Asante Kotoko · GK' },
  { id: 's5', type: 'player', label: 'Albert Eonde', subtitle: 'Hearts of Oak · FWD' },
  { id: 's6', type: 'club', label: 'Asante Kotoko', subtitle: 'Kumasi · 1st in GPL' },
  { id: 's7', type: 'club', label: 'Hearts of Oak', subtitle: 'Accra · 2nd in GPL' },
  { id: 's8', type: 'club', label: 'Medeama SC', subtitle: 'Tarkwa · 3rd in GPL' },
  { id: 's9', type: 'news', label: 'Kotoko secure narrow win in derby', subtitle: 'Ghana Sports · 2h ago' },
  { id: 's10', type: 'news', label: 'Hearts target top four finish', subtitle: 'GPL Daily · 4h ago' },
  { id: 's11', type: 'news', label: 'Medeama extend unbeaten run', subtitle: 'Football Ghana · 6h ago' },
];

type FilterType = 'all' | 'player' | 'club' | 'news';

type SearchNavProp = NativeStackNavigationProp<HomeStackParamList, 'Search'>;

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<SearchNavProp>();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    let items = MOCK_DATA.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q)
    );
    if (filter !== 'all') items = items.filter((r) => r.type === filter);
    return items;
  }, [query, filter]);

  const typeConfig: Record<string, { icon: string; color: string }> = {
    player: { icon: 'shield', color: Colors.yellow },
    club: { icon: 'people', color: Colors.yellow },
    news: { icon: 'newspaper', color: '#4169E1' },
  };

  const countByType = useMemo(() => {
    if (!query.trim()) return { all: 0, player: 0, club: 0, news: 0 };
    const q = query.toLowerCase();
    const matching = MOCK_DATA.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q)
    );
    return {
      all: matching.length,
      player: matching.filter((r) => r.type === 'player').length,
      club: matching.filter((r) => r.type === 'club').length,
      news: matching.filter((r) => r.type === 'news').length,
    };
  }, [query]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={Colors.grey2} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search players, clubs, news..."
            placeholderTextColor={Colors.grey2}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.grey2} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {query.trim().length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterContent}
        >
          {([
            { key: 'all' as FilterType, label: `All (${countByType.all})` },
            { key: 'player' as FilterType, label: `Players (${countByType.player})` },
            { key: 'club' as FilterType, label: `Clubs (${countByType.club})` },
            { key: 'news' as FilterType, label: `News (${countByType.news})` },
          ]).map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text
                style={[styles.filterText, filter === f.key && styles.filterTextActive]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {query.trim().length > 0 && results.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={Colors.grey2} />
            <Text style={styles.emptyText}>No results for "{query}"</Text>
          </View>
        ) : query.trim().length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color={Colors.grey2} />
            <Text style={styles.emptyText}>Search players, clubs, and news</Text>
          </View>
        ) : (
          results.map((r) => {
            const cfg = typeConfig[r.type] || typeConfig.news;
            return (
              <TouchableOpacity
                key={r.id}
                style={styles.resultCard}
                activeOpacity={0.7}
                onPress={() => {
                  if (r.type === 'news') {
                    navigation.navigate('NewsDetail', { articleId: r.id });
                  } else {
                    Alert.alert(r.label, r.subtitle);
                  }
                }}
              >
                <View style={[styles.resultIcon, { backgroundColor: cfg.color + '18' }]}>
                  <Ionicons name={cfg.icon as any} size={18} color={cfg.color} />
                </View>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultLabel}>{r.label}</Text>
                  <Text style={styles.resultSub}>{r.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.grey2} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    backgroundColor: Colors.surface2,
    color: Colors.white,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clearBtn: { position: 'absolute', right: 10, top: 12 },
  filterRow: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: Colors.surface2,
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: Colors.yellow },
  filterText: { fontSize: 12, fontWeight: '600', color: Colors.grey1 },
  filterTextActive: { color: Colors.black },
  list: { flex: 1 },
  listContent: { padding: 16, gap: 8 },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: { flex: 1 },
  resultLabel: { fontSize: 15, fontWeight: '700', color: Colors.white },
  resultSub: { fontSize: 12, color: Colors.grey2, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.grey2, fontFamily: fonts.display, textTransform: 'uppercase' },
});
