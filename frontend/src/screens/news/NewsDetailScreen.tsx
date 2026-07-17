import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';

import { Colors } from '../../constants/colors';
import { getScrollBottomPadding } from '../../constants/layout';
import type { Article } from '../../types';

const { width } = Dimensions.get('window');

/**
 * MOCK DATA SECTION
 * -----------------
 * This data will be replaced by an API call once the backend is ready.
 */
const MOCK_ARTICLE: Article = {
  id: 'a1',
  headline: 'Asante Kotoko to Face Hearts of Oak in Season Opener',
  category: 'GPL',
  source: 'GPL Official',
  publishedAt: new Date().toISOString(),
  thumbnailUrl: '', // Placeholder
  author: 'Kwesi Appiah',
  body: `The Ghana Premier League returns with a bang as the two giants of Ghana football, Asante Kotoko and Accra Hearts of Oak, are set to face off in the opening weekend of the 2026/27 season.\n\nFans are eagerly awaiting the clash at the Baba Yara Stadium in Kumasi. Both teams have bolstered their squads during the transfer window and are looking to make a strong start to the campaign.\n\n"We are ready for the challenge," said the Kotoko head coach during the pre-match press conference. "Playing against Hearts is always a big occasion, and we want to give our fans something to celebrate."\n\nHearts of Oak, on the other hand, are confident of securing a positive result away from home. Their new signings are expected to make an immediate impact as they aim for the league title this year.`,
  url: 'https://gpl.com.gh/news/a1',
};

export default function NewsDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  // @ts-ignore
  const { articleId } = route.params || {};

  /**
   * API INTEGRATION PLACEHOLDER
   * ---------------------------
   * TODO: Implement data fetching here.
   * useEffect(() => {
   *   fetchArticle(articleId);
   * }, [articleId]);
   */

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: getScrollBottomPadding(insets.bottom) }}
      >
        {/* Header Image with Back Button */}
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
          <Text style={styles.category}>{MOCK_ARTICLE.category}</Text>
          <Text style={styles.headline}>{MOCK_ARTICLE.headline}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.authorBadge}>
              <Text style={styles.authorText}>
                {MOCK_ARTICLE.author?.charAt(0)}
              </Text>
            </View>
            <View>
              <Text style={styles.authorName}>{MOCK_ARTICLE.author}</Text>
              <Text style={styles.sourceText}>
                {MOCK_ARTICLE.source} · {new Date(MOCK_ARTICLE.publishedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.body}>{MOCK_ARTICLE.body}</Text>
        </View>
      </ScrollView>

      {/* Share Button (Floating) */}
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
