import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors } from '../../constants/colors';
import { DUMMY_NEWS } from '../../constants/homeDummyData';
import type { HomeStackParamList } from '../../navigation/HomeStack';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export default function LatestNewsWidget() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.widget}>
      <Text style={styles.widgetTitle}>Latest News</Text>
      {DUMMY_NEWS.map((article) => (
        <TouchableOpacity
          key={article.id}
          style={styles.newsItem}
          onPress={() => navigation.navigate('NewsDetail', { articleId: article.id })}
        >
          <View style={styles.newsImage} />
          <View style={styles.newsText}>
            <Text style={styles.newsCategory}>{article.category}</Text>
            <Text style={styles.newsTitle}>{article.headline}</Text>
            <Text style={styles.newsMeta}>
              {article.source} · {article.time}
            </Text>
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
