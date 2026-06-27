import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { NewsStackParamList } from '../../navigation/NewsStack';
import { Colors } from '../../constants/colors';

const categories = ['All', 'GPL', 'Black Stars', 'AFCON', 'Transfers'];
const articles = [
  { id: 'a1', title: 'GPL season preview: title race heats up', category: 'GPL' },
  { id: 'a2', title: 'Black Stars squad named for upcoming qualifiers', category: 'Black Stars' },
];

type NavigationProp = NativeStackNavigationProp<NewsStackParamList>;

export default function NewsScreen() {
  const navigation = useNavigation<NavigationProp>();

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
          <TouchableOpacity
            style={styles.articleCard}
            onPress={() => navigation.navigate('NewsDetail', { articleId: item.id })}
          >
            <View style={styles.thumbnail} />
            <View style={styles.articleText}>
              <Text style={styles.articleCategory}>{item.category}</Text>
              <Text style={styles.articleTitle}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 8 },
  categoryChip: { backgroundColor: Colors.surface, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, marginRight: 8, marginBottom: 8 },
  categoryLabel: { color: Colors.primary, fontWeight: '700' },
  list: { paddingBottom: 80 },
  articleCard: { backgroundColor: Colors.surface, marginHorizontal: 16, marginBottom: 16, borderRadius: 18, overflow: 'hidden' },
  thumbnail: { height: 160, backgroundColor: Colors.primaryLight },
  articleText: { padding: 16 },
  articleCategory: { fontSize: 11, color: Colors.primary, marginBottom: 8, fontWeight: '700' },
  articleTitle: { fontSize: 16, color: Colors.textPrimary, fontWeight: '800' },
});
