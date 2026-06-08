import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Colors } from '../../constants/colors';
import { DUMMY_NEWS } from '../../constants/homeDummyData';

export default function LatestNewsWidget() {
  return (
    <View style={styles.widget}>
      <Text style={styles.widgetTitle}>Latest News</Text>
      {DUMMY_NEWS.map((article) => (
        <View key={article.id} style={styles.newsItem}>
          <View style={styles.newsImage} />
          <View style={styles.newsText}>
            <Text style={styles.newsCategory}>{article.category}</Text>
            <Text style={styles.newsTitle}>{article.headline}</Text>
            <Text style={styles.newsMeta}>
              {article.source} · {article.time}
            </Text>
          </View>
        </View>
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
  newsItem: { flexDirection: 'row', marginBottom: 14, alignItems: 'center' },
  newsImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.tagFE.bg,
    marginRight: 12,
  },
  newsText: { flex: 1 },
  newsCategory: { fontSize: 11, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  newsTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  newsMeta: { fontSize: 12, color: Colors.textTertiary, marginTop: 4 },
});
