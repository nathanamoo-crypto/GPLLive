import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import { Colors } from '../../constants/colors';
import { getScrollBottomPadding } from '../../constants/layout';
import { useTheme } from '../../context/ThemeContext';
import type { NewsStackParamList } from '../../navigation/NewsStack';

const { width } = Dimensions.get('window');

type NewsDetailRouteProp = RouteProp<NewsStackParamList, 'NewsDetail'>;

export default function NewsDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const route = useRoute<NewsDetailRouteProp>();
  const { article } = route.params;

  const handleReadFullStory = () => {
    if (article.url) Linking.openURL(article.url);
  };

  const handleShare = () => {
    void Share.share({
      message: article.url ? `${article.headline}\n${article.url}` : article.headline,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: getScrollBottomPadding(insets.bottom) }}
      >
        <View style={styles.imageHeader}>
          {article.thumbnailUrl ? (
            <Image
              source={{ uri: article.thumbnailUrl }}
              style={styles.image}
              contentFit="cover"
              contentPosition={{ top: '20%' }}
              transition={150}
            />
          ) : (
            <View style={styles.imagePlaceholder} />
          )}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { top: insets.top + 10 }]}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textInverse} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.category}>{article.category}</Text>
          <Text style={styles.headline}>{article.headline}</Text>

          <View style={styles.metaRow}>
            <View style={styles.authorBadge}>
              <Ionicons name="newspaper-outline" size={18} color={colors.textInverse} />
            </View>
            <View>
              <Text style={styles.authorName}>{article.source}</Text>
              <Text style={styles.sourceText}>
                {new Date(article.publishedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* RSS feeds only ever give a short excerpt, never the full
              article body - showing that honestly as a summary, with a
              clear way to read the complete story at the source, rather
              than passing off a truncated snippet as the whole article. */}
          <Text style={styles.body}>{article.body}</Text>

          {article.url ? (
            <TouchableOpacity style={styles.readMoreButton} onPress={handleReadFullStory}>
              <Text style={styles.readMoreText}>Read full story on {article.source}</Text>
              <Ionicons name="open-outline" size={18} color={colors.textInverse} />
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.shareButton, { bottom: insets.bottom + 20 }]}
        onPress={handleShare}
      >
        <Ionicons name="share-social-outline" size={24} color={colors.textInverse} />
      </TouchableOpacity>
    </View>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    imageHeader: { width: width, height: 250, backgroundColor: colors.border },
    image: { width: '100%', height: '100%' },
    imagePlaceholder: { flex: 1, backgroundColor: '#333' },
    backButton: {
      position: 'absolute',
      left: 16,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 20,
      padding: 8,
    },
    content: { padding: 20 },
    category: { fontSize: 12, fontWeight: '800', color: colors.primary, marginBottom: 8, letterSpacing: 1 },
    headline: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginBottom: 20, lineHeight: 32 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    authorBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.yellow,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    authorName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
    sourceText: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },
    divider: { height: 1, backgroundColor: colors.border, marginBottom: 24 },
    body: { fontSize: 16, lineHeight: 26, color: colors.textPrimary, letterSpacing: 0.3 },
    readMoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 14,
      marginTop: 28,
    },
    readMoreText: { fontSize: 15, fontWeight: '700', color: colors.textInverse },
    shareButton: {
      position: 'absolute',
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
  });
}
