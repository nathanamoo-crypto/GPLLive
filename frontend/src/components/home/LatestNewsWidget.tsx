import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors } from '../../constants/colors';
import { fetchNews, shuffleArticles } from '../../services/newsService';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import type { Article } from '../../types';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const WIDGET_ARTICLE_COUNT = 3;

interface Props {
  // Bumped by HomeScreen's pull-to-refresh so this widget re-fetches (and
  // reshuffles, like the News tab) instead of only ever showing whatever it
  // loaded on first mount.
  refreshTrigger?: number;
}

export default function LatestNewsWidget({ refreshTrigger = 0 }: Props) {
  const navigation = useNavigation<NavigationProp>();
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchNews(controller.signal)
      .then((data) => {
        const list = refreshTrigger > 0 ? shuffleArticles(data) : data;
        setArticles(list.slice(0, WIDGET_ARTICLE_COUNT));
      })
      .catch(() => { /* widget just stays empty - News tab has its own retry */ });
    return () => controller.abort();
  }, [refreshTrigger]);

  if (articles.length === 0) return null;

  return (
    <View style={styles.widget}>
      <Text style={styles.widgetTitle}>Latest News</Text>
      {articles.map((article) => (
        <TouchableOpacity
          key={article.id}
          style={styles.newsItem}
          onPress={() => navigation.navigate('NewsDetail', { article })}
        >
          {article.thumbnailUrl ? (
            <Image
              source={{ uri: article.thumbnailUrl }}
              style={styles.newsImage}
              contentFit="cover"
              contentPosition={{ top: '20%' }}
              transition={150}
            />
          ) : (
            <View style={styles.newsImage} />
          )}
          <View style={styles.newsText}>
            <Text style={styles.newsCategory} numberOfLines={1}>{article.category}</Text>
            <Text style={styles.newsTitle} numberOfLines={2}>{article.headline}</Text>
            <Text style={styles.newsMeta} numberOfLines={1}>{article.source}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  widget: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  widgetTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  newsItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  newsImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.tagFE.bg,
    marginRight: 12,
    // Fixed size, never let the row's flex math shrink or stretch it.
    flexShrink: 0,
  },
  // minWidth: 0 overrides the flex-child default of minWidth: 'auto', which
  // otherwise lets this column grow wider than the space actually left
  // beside the image - that's what was pushing/overlapping the title and
  // source text instead of wrapping and truncating cleanly within it.
  newsText: { flex: 1, minWidth: 0, justifyContent: 'center' },
  newsCategory: { fontSize: 11, fontWeight: '700', color: Colors.primary, marginBottom: 4, textAlign: 'left' },
  newsTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, lineHeight: 19, textAlign: 'left' },
  newsMeta: { fontSize: 12, color: Colors.textTertiary, marginTop: 5, textAlign: 'left' },
});
