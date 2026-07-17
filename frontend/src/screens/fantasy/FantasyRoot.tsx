import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { useFantasyStore } from '../../store/fantasyStore';
import { fetchPlayers } from '../../services/fantasyService';
import type { Player } from '../../types';

export default function FantasyRoot() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'squad' | 'browse'>('browse');
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    draftPlayers,
    budget,
    addPlayer,
    removePlayer,
    submitSquad,
    hasSquad,
    team,
  } = useFantasyStore();

  const loadPlayers = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPlayers(undefined, signal);
      if (signal?.aborted) return;
      setPlayers(data);
    } catch {
      if (signal?.aborted) return;
      setError('Failed to load players. Check your connection and try again.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadPlayers(controller.signal);
    return () => controller.abort();
  }, [loadPlayers]);

  /**
   * API INTEGRATION PLACEHOLDER
   * ---------------------------
   * TODO: Sync squad with backend on submit.
   */
  const handleSaveSquad = async () => {
    if (!teamName.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }
    if (draftPlayers.length < 5) {
      Alert.alert('Error', 'Select at least 5 players for your MVP squad');
      return;
    }

    try {
      await submitSquad(teamName);
      Alert.alert('Success', 'Your fantasy team has been created!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (hasSquad && team) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{team.teamName}</Text>
          <Text style={styles.headerSubtitle}>Overall Rank: {team.overallRank}</Text>
        </View>
        <View style={styles.centered}>
          <Ionicons name="football" size={64} color={Colors.primary} />
          <Text style={styles.readyText}>Your squad is ready for the next gameweek!</Text>
          <Text style={styles.pointsText}>{team.totalPoints} Total Points</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Squad Builder</Text>
        <Text style={styles.headerSubtitle}>Budget: ${budget.toFixed(1)}m</Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'browse' && styles.tabActive]}
          onPress={() => setActiveTab('browse')}
        >
          <Text style={[styles.tabText, activeTab === 'browse' && styles.tabTextActive]}>Browse Players</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'squad' && styles.tabActive]}
          onPress={() => setActiveTab('squad')}
        >
          <Text style={[styles.tabText, activeTab === 'squad' && styles.tabTextActive]}>
            My Draft ({draftPlayers.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'browse' ? (
        loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.readyText}>Loading players...</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Ionicons name="cloud-offline-outline" size={48} color={Colors.grey2} />
            <Text style={styles.readyText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => loadPlayers()}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
        <FlatList
          data={players}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isSelected = draftPlayers.some((p) => p.id === item.id);
            return (
              <View style={styles.playerCard}>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{item.name}</Text>
                  <Text style={styles.playerSub}>{item.position} · {item.club.name}</Text>
                </View>
                <View style={styles.playerAction}>
                  <Text style={styles.playerPrice}>${item.price}m</Text>
                  <TouchableOpacity
                    style={[styles.addButton, isSelected && styles.removeButton]}
                    onPress={() => isSelected ? removePlayer(item.id) : addPlayer(item)}
                  >
                    <Ionicons name={isSelected ? "remove" : "add"} size={20} color={Colors.textInverse} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
        )
      ) : (
        <View style={styles.flex}>
          <ScrollView contentContainerStyle={styles.listContent}>
            <TextInput
              style={styles.nameInput}
              placeholder="Enter Team Name"
              value={teamName}
              onChangeText={setTeamName}
            />
            {draftPlayers.length === 0 ? (
              <Text style={styles.emptyText}>No players selected yet.</Text>
            ) : (
              draftPlayers.map((item) => (
                <View key={item.id} style={styles.playerCard}>
                  <Text style={styles.playerName}>{item.name}</Text>
                  <TouchableOpacity onPress={() => removePlayer(item.id)}>
                    <Ionicons name="trash-outline" size={20} color={Colors.live} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveSquad}>
            <Text style={styles.saveButtonText}>Confirm Squad</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  headerSubtitle: { fontSize: 16, color: Colors.primary, fontWeight: '700', marginTop: 4 },
  tabRow: { flexDirection: 'row', padding: 16, gap: 12 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12, backgroundColor: Colors.surface, borderWidth: 1, borderBottomColor: Colors.border },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  tabTextActive: { color: Colors.textInverse },
  listContent: { padding: 16 },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  playerSub: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
  playerAction: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  playerPrice: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  addButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  removeButton: { backgroundColor: Colors.live },
  flex: { flex: 1 },
  nameInput: { backgroundColor: Colors.surface, padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: Colors.border, fontSize: 16 },
  emptyText: { textAlign: 'center', color: Colors.textTertiary, marginTop: 40 },
  saveButton: { margin: 16, backgroundColor: Colors.primary, padding: 18, borderRadius: 16, alignItems: 'center' },
  saveButtonText: { color: Colors.textInverse, fontSize: 16, fontWeight: '800' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  readyText: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginTop: 20, color: Colors.textPrimary },
  pointsText: { fontSize: 32, fontWeight: '800', color: Colors.primary, marginTop: 12 },
  retryButton: { marginTop: 16, backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 12 },
  retryButtonText: { fontSize: 14, fontWeight: '800', color: Colors.textInverse, textTransform: 'uppercase' },
});
