import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { NewsStackParamList } from '../../navigation/NewsStack';
import { Colors } from '../../constants/colors';
import { fonts, radius, getScrollBottomPadding } from '../../constants/layout';
import { fetchNews, shuffleArticles } from '../../services/newsService';
import type { Article } from '../../types';

type NavigationProp = NativeStackNavigationProp<NewsStackParamList>;

function timeAgo(publishedAt: string): string {
  const diffMs = Date.now() - new Date(publishedAt).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function NewsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (options?: { shuffleResult?: boolean; signal?: AbortSignal }) => {
    const { shuffleResult, signal } = options ?? {};
    try {
      const data = await fetchNews(signal);
      if (signal?.aborted) return;
      setArticles(shuffleResult ? shuffleArticles(data) : data);
      setError(null);
    } catch (err: any) {
      if (signal?.aborted) return;
      setError(err?.message ?? 'Failed to load news. Check your connection and try again.');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // First load shows the source's true latest-first order.
    load({ signal: controller.signal });
    return () => controller.abort();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load({ shuffleResult: true });
  }, [load]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.yellow} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={44} color={Colors.grey2} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => { setLoading(true); load(); }}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: getScrollBottomPadding(insets.bottom) }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.yellow} />
          }
          ListHeaderComponent={<Text style={styles.screenTitle}>GPL News</Text>}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No news right now - pull to refresh.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.articleCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('NewsDetail', { article: item })}
            >
              {item.thumbnailUrl ? (
                <Image
                  source={{ uri: item.thumbnailUrl }}
                  style={styles.thumbnail}
                  contentFit="cover"
                  contentPosition={{ top: '20%' }}
                  transition={150}
                />
              ) : (
                <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                  <Ionicons name="image-outline" size={32} color={Colors.grey2} />
                </View>
              )}
              <View style={styles.articleText}>
                <View style={styles.metaRow}>
                  <Text style={styles.articleCategory}>{item.category}</Text>
                  <Text style={styles.articleTime}>{timeAgo(item.publishedAt)}</Text>
                </View>
                <Text style={styles.articleTitle} numberOfLines={2}>{item.headline}</Text>
                {item.body ? (
                  <Text style={styles.articleSummary} numberOfLines={2}>{item.body}</Text>
                ) : null}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: fonts.display,
    color: Colors.white,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  list: { paddingBottom: 24 },
  articleCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  thumbnail: { width: '100%', height: 180, backgroundColor: Colors.surface2 },
  thumbnailPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  // minWidth: 0 keeps this column from ever being measured wider than the
  // card itself, so the title/summary text always wraps and truncates
  // inside the card instead of spilling past its edges.
  articleText: { padding: 14, minWidth: 0 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  articleCategory: { fontSize: 11, color: Colors.yellow, fontWeight: '700', fontFamily: fonts.display, textTransform: 'uppercase', textAlign: 'left' },
  articleTime: { fontSize: 11, color: Colors.grey2, fontWeight: '600', textAlign: 'right' },
  articleTitle: { fontSize: 16, color: Colors.white, fontWeight: '800', lineHeight: 22, textAlign: 'left' },
  articleSummary: { fontSize: 13, color: Colors.grey1, marginTop: 6, lineHeight: 18, textAlign: 'left' },
  errorText: { fontSize: 14, color: Colors.grey1, textAlign: 'center' },
  emptyText: { fontSize: 14, color: Colors.grey2, textAlign: 'center' },
  retryButton: {
    marginTop: 4,
    backgroundColor: Colors.yellow,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: { fontSize: 13, fontWeight: '800', color: '#000000', textTransform: 'uppercase' },
});
