import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const categories = ['All', 'GPL', 'Black Stars', 'AFCON', 'Transfers'];
const articles = [
  { id: 'a1', title: 'GPL season preview: title race heats up', category: 'GPL' },
  { id: 'a2', title: 'Black Stars squad named for upcoming qualifiers', category: 'Black Stars' },
];

export default function NewsScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.categoryRow}>
            {categories.map((label) => (
              <View key={label} style={styles.categoryChip}>
                <Text style={styles.categoryLabel}>{label}</Text>
              </View>
            ))}
          </View>
        }
        data={articles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.articleCard}>
            <View style={styles.thumbnail} />
            <View style={styles.articleText}>
              <Text style={styles.articleCategory}>{item.category}</Text>
              <Text style={styles.articleTitle}>{item.title}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 8 },
  categoryChip: { backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, marginRight: 8, marginBottom: 8 },
  categoryLabel: { color: '#1A7C3E', fontWeight: '700' },
  list: { paddingBottom: 80 },
  articleCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 16, borderRadius: 18, overflow: 'hidden' },
  thumbnail: { height: 160, backgroundColor: '#E8F5EE' },
  articleText: { padding: 16 },
  articleCategory: { fontSize: 11, color: '#1A7C3E', marginBottom: 8, fontWeight: '700' },
  articleTitle: { fontSize: 16, color: '#0D1117', fontWeight: '800' },
});
