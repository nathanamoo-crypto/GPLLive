import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';

import { Colors } from '../../constants/colors';
import { getScrollBottomPadding } from '../../constants/layout';
import { getArticleDetails } from '../../services/newsService';
import type { Article } from '../../types';

const { width } = Dimensions.get('window');

export default function NewsDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  // @ts-ignore
  const { articleId } = route.params || {};

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!articleId) {
      setLoading(false);
      setError('No article ID provided.');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getArticleDetails(articleId)
      .then((data) => {
        if (cancelled) return;
        if (data) {
          setArticle(data);
        } else {
          setError('Article not found.');
        }
      })
      .catch((err: any) => {
        if (cancelled) return;
        setError(err?.message ?? 'Failed to load article.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [articleId]);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.imageHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { top: insets.top + 10 }]}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textInverse} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (error || !article) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.imageHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { top: insets.top + 10 }]}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textInverse} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error ?? 'Article not found.'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: getScrollBottomPadding(insets.bottom) }}
      >
        <View style={styles.imageHeader}>
          <View style={styles.imagePlaceholder} />
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { top: insets.top + 10 }]}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textInverse} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.category}>{article.category}</Text>
          <Text style={styles.headline}>{article.headline}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.authorBadge}>
              <Text style={styles.authorText}>
                {article.author?.charAt(0) ?? '?'}
              </Text>
            </View>
            <View>
              <Text style={styles.authorName}>{article.author}</Text>
              <Text style={styles.sourceText}>
                {article.source} · {new Date(article.publishedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.body}>{article.body}</Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={[styles.shareButton, { bottom: insets.bottom + 20 }]}>
        <Ionicons name="share-social-outline" size={24} color={Colors.textInverse} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  imageHeader: { width: width, height: 250, backgroundColor: Colors.border },
  imagePlaceholder: { flex: 1, backgroundColor: '#333' },
  backButton: {
    position: 'absolute',
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  content: { padding: 20 },
  category: { fontSize: 12, fontWeight: '800', color: Colors.primary, marginBottom: 8, letterSpacing: 1 },
  headline: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: 20, lineHeight: 32 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  authorBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  authorText: { color: Colors.textInverse, fontWeight: '700' },
  authorName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  sourceText: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 24 },
  body: { fontSize: 16, lineHeight: 26, color: Colors.textPrimary, letterSpacing: 0.3 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: Colors.live, textAlign: 'center', paddingHorizontal: 32 },
  shareButton: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
