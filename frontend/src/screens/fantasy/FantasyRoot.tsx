import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const tabs: Array<{ key: 'mysquad' | 'leaderboard'; label: string }> = [
  { key: 'mysquad', label: 'My Squad' },
  { key: 'leaderboard', label: 'Leaderboard' },
];

export default function FantasyRoot() {
  const [activeTab, setActiveTab] = useState<'mysquad' | 'leaderboard'>('mysquad');

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.toggleButton, activeTab === tab.key && styles.toggleButtonActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.toggleText, activeTab === tab.key && styles.toggleTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.content}>
        {activeTab === 'mysquad' ? (
          <Text style={styles.placeholder}>My Squad screen content will render here.</Text>
        ) : (
          <Text style={styles.placeholder}>Fantasy leaderboard content will render here.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  toggleRow: { flexDirection: 'row', margin: 16, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 8 },
  toggleButton: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 16 },
  toggleButtonActive: { backgroundColor: '#1A7C3E' },
  toggleText: { fontSize: 14, fontWeight: '700', color: '#5A6472' },
  toggleTextActive: { color: '#FFFFFF' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholder: { color: '#5A6472', fontSize: 16 },
});
