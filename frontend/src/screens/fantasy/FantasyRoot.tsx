import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors } from '../../constants/colors';
import { useFantasyStore } from '../../store/fantasyStore';
import { fetchPlayers, getMyTeam } from '../../services/fantasyService';
import { fetchClubsById, RealClub } from '../../services/clubService';
import PitchView from '../../components/fantasy/PitchView';
import FilterDropdown from '../../components/shared/FilterDropdown';
import MyTeamScreen from './MyTeamScreen';
import type { GamesStackParamList } from '../../navigation/GamesStack';
import type { Player, Position } from '../../types';

type FantasyRootNavProp = NativeStackNavigationProp<GamesStackParamList>;

// Mirrors the quota enforced in fantasyStore's addPlayer (2 GK, 5 DEF, 5 MID,
// 3 FWD) - duplicated here purely for the read-only progress checklist.
const POSITION_QUOTA: Record<Position, number> = { GK: 2, DEF: 5, MID: 5, FWD: 3 };

// Bounds for a valid Starting XI, derived from the 5 formations in
// FORMATIONS (fantasyStore.ts): GK is always exactly 1, DEF ranges 3-4,
// MID 3-5, FWD 1-3 across 4-3-3/4-4-2/3-4-3/4-5-1/3-5-2. Used to stop the
// user building a lineup that can't match any real formation.
const STARTING_XI_LIMITS: Record<Position, { min: number; max: number }> = {
  GK: { min: 1, max: 1 },
  DEF: { min: 3, max: 4 },
  MID: { min: 3, max: 5 },
  FWD: { min: 1, max: 3 },
};

// A 15-man squad (2 GK/5 DEF/5 MID/3 FWD) always has enough of each position
// to fill a 4-3-3 (1 GK/4 DEF/3 MID/3 FWD = 11), so this is always a legal
// starting XI regardless of who the user actually picked. Used to auto-fill
// a sensible default the moment the squad hits 15/15, so "Confirm Squad"
// doesn't silently block just because the user never opened the Starting XI
// tab to pick one manually.
function computeDefaultStartingXI(squad: Player[]): number[] {
  const byPositionDesc = (pos: Position) =>
    squad.filter((p) => p.position === pos).sort((a, b) => b.price - a.price);
  const pick = (pos: Position, count: number) => byPositionDesc(pos).slice(0, count);
  return [...pick('GK', 1), ...pick('DEF', 4), ...pick('MID', 3), ...pick('FWD', 3)].map((p) => p.id);
}

export default function FantasyRoot() {
  const navigation = useNavigation<FantasyRootNavProp>();
  const [activeTab, setActiveTab] = useState<'squad' | 'browse' | 'lineup'>('browse');
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Player.clubId is the backend's real club id, not this app's local/
  // mismatched one - resolve names via a live-fetched id->club map instead
  // of the old hardcoded CLUB_LOOKUP (see backendClubMap.ts for why).
  const [clubsById, setClubsById] = useState<Record<number, RealClub>>({});
  // Same "don't paint half-styled, then pop into place" fix as MyTeamScreen -
  // the Starting XI tab's PitchView also keys off clubsById for jersey
  // colors/badges, so gate it behind a spinner until the fetch below lands.
  const [clubsLoading, setClubsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<'All' | 'GK' | 'DEF' | 'MID' | 'FWD'>('All');
  const [clubFilter, setClubFilter] = useState<number | 'All'>('All');
  // The store's hasSquad flag is only ever set after a submitSquad() call
  // in the current session (or by MyTeamScreen, which never gets a chance
  // to mount if this screen defaults to the builder) - on a fresh app
  // launch it starts false even for a user who already has a team, which
  // would incorrectly show the Squad Builder instead of their pitch. Do a
  // real check against the backend before deciding which view to show.
  const [checkingTeam, setCheckingTeam] = useState(true);

  const {
    draftPlayers,
    draftCaptainId,
    draftViceCaptainId,
    draftStartingPlayerIds,
    draftFormation,
    budget,
    addPlayer,
    removePlayer,
    setCaptain,
    setViceCaptain,
    setStartingXI,
    submitSquad,
    hasSquad,
    team,
    // Renamed on destructure - `loading` above already means "player list is
    // loading"; this one means "Confirm Squad is submitting" (a ~19-call
    // sequence against the backend, see fantasyStore's submitSquad).
    loading: submitting,
    submitProgress,
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

  useEffect(() => {
    const controller = new AbortController();
    setCheckingTeam(true);
    getMyTeam(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        useFantasyStore.setState({ team: data, hasSquad: data !== null });
      })
      .catch(() => { /* fall back to whatever's already in the store */ })
      .finally(() => {
        if (!controller.signal.aborted) setCheckingTeam(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchClubsById(controller.signal)
      .then((byId) => setClubsById(byId))
      .catch(() => { /* club names fall back to 'Unknown' below */ })
      .finally(() => setClubsLoading(false));
    return () => controller.abort();
  }, []);

  const clubFilterOptions = useMemo(
    () => Object.values(clubsById).sort((a, b) => a.shortName.localeCompare(b.shortName)),
    [clubsById]
  );

  const positionDropdownOptions = useMemo(
    () => [
      { label: 'All Positions', value: 'All' as const },
      { label: 'GK', value: 'GK' as const },
      { label: 'DEF', value: 'DEF' as const },
      { label: 'MID', value: 'MID' as const },
      { label: 'FWD', value: 'FWD' as const },
    ],
    []
  );

  const clubDropdownOptions = useMemo(
    () => [
      { label: 'All Clubs', value: 'All' as const },
      ...clubFilterOptions.map((club) => ({ label: club.shortName, value: club.id })),
    ],
    [clubFilterOptions]
  );

  const positionCounts = useMemo(() => {
    const counts: Record<Position, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
    for (const p of draftPlayers) {
      counts[p.position] = (counts[p.position] ?? 0) + 1;
    }
    return counts;
  }, [draftPlayers]);

  const visiblePlayers = useMemo(() => {
    let list = players;
    if (positionFilter !== 'All') {
      list = list.filter((p) => p.position === positionFilter);
    }
    if (clubFilter !== 'All') {
      list = list.filter((p) => p.clubId === clubFilter);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    // Highest price first, so the standout (usually most in-demand) players
    // show up right away instead of requiring a scroll to find them.
    return [...list].sort((a, b) => b.price - a.price);
  }, [players, positionFilter, clubFilter, searchQuery]);

  const handleSaveSquad = async () => {
    // Confirming is a long sequential run against the backend with a spinner
    // as the only feedback (see the progress bar rendered on the button
    // below) - block a second tap outright rather than firing a second
    // submitSquad() that would race the first.
    if (submitting) {
      return;
    }
    if (!teamName.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }
    if (draftPlayers.length < 15) {
      Alert.alert('Error', `Select ${15 - draftPlayers.length} more player${15 - draftPlayers.length === 1 ? '' : 's'} to complete your 15-man squad`);
      return;
    }
    if (!draftCaptainId) {
      Alert.alert('Error', 'Pick a captain before confirming your squad (tap the star next to a player in your draft)');
      return;
    }
    if (draftStartingPlayerIds.length !== 11) {
      Alert.alert(
        'Pick your Starting XI',
        `Select exactly 11 starting players in the Starting XI tab (you have ${draftStartingPlayerIds.length}).`
      );
      return;
    }
    if (!draftStartingPlayerIds.includes(draftCaptainId)) {
      Alert.alert('Error', 'Your captain must be in the Starting XI - add them in the Starting XI tab, or pick a different captain.');
      return;
    }
    if (draftViceCaptainId && !draftStartingPlayerIds.includes(draftViceCaptainId)) {
      Alert.alert('Error', 'Your vice-captain must be in the Starting XI - add them in the Starting XI tab, or pick a different vice-captain.');
      return;
    }

    try {
      await submitSquad(teamName);
      // No navigation here on purpose - submitSquad() already set hasSquad
      // and team in the store, so this component's own render below
      // (`if (hasSquad && team) return <MyTeamScreen />`) has already
      // swapped to the pitch view underneath this alert. Navigating to the
      // separate 'MyTeam' stack route on top of that used to mount a SECOND
      // MyTeamScreen instance (with its own fresh fetch), which is exactly
      // the "pitch view appears, reloads, appears again" flash reported.
      Alert.alert('Success', 'Your fantasy team has been created!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const toggleStarting = (player: Player) => {
    const isStarting = draftStartingPlayerIds.includes(player.id);
    if (isStarting) {
      if (player.id === draftCaptainId) {
        Alert.alert(
          'Captain must start',
          'Your captain has to be in the Starting XI. Pick a different captain first (in My Draft) if you want to bench them.'
        );
        return;
      }
      if (player.id === draftViceCaptainId) {
        Alert.alert(
          'Vice-captain must start',
          'Your vice-captain has to be in the Starting XI. Pick a different vice-captain first (in My Draft) if you want to bench them.'
        );
        return;
      }
      setStartingXI(draftStartingPlayerIds.filter((id) => id !== player.id));
      return;
    }
    if (draftStartingPlayerIds.length >= 11) {
      Alert.alert('Starting XI full', 'You already have 11 starters. Bench a player first.');
      return;
    }
    const startingPlayers = draftPlayers.filter((p) => draftStartingPlayerIds.includes(p.id));
    const currentCountForPos = startingPlayers.filter((p) => p.position === player.position).length;
    const limit = STARTING_XI_LIMITS[player.position];
    if (currentCountForPos >= limit.max) {
      Alert.alert(
        'Position full',
        `You can only start ${limit.max} ${player.position}${limit.max === 1 ? '' : 's'} at once.`
      );
      return;
    }
    setStartingXI([...draftStartingPlayerIds, player.id]);
  };

  const handleAddPlayer = (player: Player) => {
    const result = addPlayer(player);
    if (!result.success && result.message) {
      Alert.alert('Cannot add player', result.message);
      return;
    }
    if (result.success) {
      const latestDraft = useFantasyStore.getState().draftPlayers;
      if (latestDraft.length === 15) {
        // Set a default Starting XI right away so Confirm Squad works even
        // if the user never visits the Starting XI tab - they can still
        // fine-tune it there before confirming.
        setStartingXI(computeDefaultStartingXI(latestDraft));
        // Jump straight to My Draft instead of leaving the user on Browse
        // once there's nothing left to browse for - picking a captain and
        // confirming is the only thing left to do at this point.
        setActiveTab('squad');
        Alert.alert(
          'Squad complete!',
          "You've picked all 15 players and we've set a starting XI for you (4-3-3, your priciest players). Pick a captain below, tweak the lineup in Starting XI if you want, then confirm."
        );
      }
    }
  };

  if (checkingTeam) {
    return (
      // No extra insets.top here - FantasyRoot is always rendered nested
    // below GamesRoot's Fantasy/Predictions toggle bar, which already
    // reserves the safe-area space at the top of the screen. Adding it
    // again here just pushed the "Squad Builder" header down with an
    // oversized, device-dependent gap under the toggle.
    <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.readyText}>Checking your squad...</Text>
        </View>
      </View>
    );
  }

  // Once a team exists, the "Fantasy" tab under Games should just be the
  // team's actual pitch view (starting XI, bench, chips, formation switch) -
  // not a bare "squad is ready" placeholder. MyTeamScreen already builds
  // that entire view (and fetches its own fresh data), so reuse it directly
  // instead of duplicating it here.
  if (hasSquad && team) {
    return <MyTeamScreen />;
  }

  return (
    // No extra insets.top here - FantasyRoot is always rendered nested
    // below GamesRoot's Fantasy/Predictions toggle bar, which already
    // reserves the safe-area space at the top of the screen. Adding it
    // again here just pushed the "Squad Builder" header down with an
    // oversized, device-dependent gap under the toggle.
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Squad Builder</Text>
        <Text style={styles.headerSubtitle}>Budget: GH₵{budget.toFixed(1)}m</Text>
      </View>

      {/* Moved out from between the filters and the player list (where it
          broke up the browsing flow) to a persistent strip here instead -
          visible across all 3 tabs, not just Browse, so it works as an
          at-a-glance progress readout rather than a scroll interruption. */}
      <View style={styles.quotaRow}>
        {(['GK', 'DEF', 'MID', 'FWD'] as Position[]).map((pos) => {
          const count = positionCounts[pos];
          const quota = POSITION_QUOTA[pos];
          const complete = count >= quota;
          return (
            <View key={pos} style={[styles.quotaPill, complete && styles.quotaPillComplete]}>
              <Text style={[styles.quotaText, complete && styles.quotaTextComplete]}>
                {pos} {count}/{quota}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'browse' && styles.tabActive]}
          onPress={() => setActiveTab('browse')}
        >
          <Text style={[styles.tabText, activeTab === 'browse' && styles.tabTextActive]}>Browse</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'squad' && styles.tabActive]}
          onPress={() => setActiveTab('squad')}
        >
          <Text style={[styles.tabText, activeTab === 'squad' && styles.tabTextActive]}>
            My Draft ({draftPlayers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'lineup' && styles.tabActive]}
          onPress={() => setActiveTab('lineup')}
        >
          <Text style={[styles.tabText, activeTab === 'lineup' && styles.tabTextActive]}>
            Starting XI ({draftStartingPlayerIds.length}/11)
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
        <>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color={Colors.textTertiary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search players..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Dropdowns instead of horizontal chip rows - two filters used to
              cost a full label+row of vertical space each; side by side
              like this they cost one compact row total, leaving more of
              the screen for the actual player list below. */}
          <View style={styles.filterDropdownRow}>
            <FilterDropdown
              label="Position"
              options={positionDropdownOptions}
              value={positionFilter}
              onChange={setPositionFilter}
              style={styles.filterDropdown}
            />
            <FilterDropdown
              label="Club"
              options={clubDropdownOptions}
              value={clubFilter}
              onChange={setClubFilter}
              style={styles.filterDropdown}
            />
          </View>

          {visiblePlayers.length === 0 ? (
            <View style={styles.centered}>
              <Ionicons name="search-outline" size={40} color={Colors.grey2} />
              <Text style={styles.readyText}>No players match your filters</Text>
            </View>
          ) : (
          <FlatList
            data={visiblePlayers}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isSelected = draftPlayers.some((p) => p.id === item.id);
              const club = clubsById[item.clubId];
              return (
                <View style={styles.playerCard}>
                  <TouchableOpacity
                    style={styles.playerCardMain}
                    onPress={() => navigation.navigate('PlayerDetails', { playerId: item.id })}
                    activeOpacity={0.7}
                  >
                    <View style={styles.badgeWrap}>
                      {club?.badge ? (
                        <Image source={club.badge} style={styles.badgeImg} resizeMode="contain" />
                      ) : (
                        <Ionicons name="shield-outline" size={20} color={Colors.textTertiary} />
                      )}
                    </View>
                    <View style={styles.playerInfo}>
                      <Text style={styles.playerName}>{item.name}</Text>
                      <Text style={styles.playerSub}>{item.position} · {club?.shortName ?? club?.fullName ?? 'Unknown'}</Text>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.playerAction}>
                    <Text style={styles.playerPrice}>GH₵{item.price}m</Text>
                    <TouchableOpacity
                      style={[styles.addButton, isSelected && styles.removeButton]}
                      onPress={() => isSelected ? removePlayer(item.id) : handleAddPlayer(item)}
                    >
                      <Ionicons name={isSelected ? 'remove' : 'add'} size={20} color={Colors.textInverse} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
          )}
        </>
        )
      ) : activeTab === 'squad' ? (
        <View style={styles.flex}>
          <ScrollView contentContainerStyle={styles.listContent}>
            <TextInput
              style={styles.nameInput}
              placeholder="Enter Team Name"
              value={teamName}
              onChangeText={setTeamName}
            />
            <Text style={styles.progressText}>
              {draftPlayers.length}/15 players
              {draftPlayers.length >= 15 && !draftCaptainId ? ' · pick a captain below' : ''}
            </Text>
            {draftPlayers.length > 0 && (
              <Text style={styles.hintText}>
                Tap ★ for captain, 🎗 for vice-captain - only players in your Starting XI are eligible
              </Text>
            )}
            {draftPlayers.length === 0 ? (
              <Text style={styles.emptyText}>No players selected yet.</Text>
            ) : (
              draftPlayers.map((item) => {
                const isCaptain = draftCaptainId === item.id;
                const isViceCaptain = draftViceCaptainId === item.id;
                const isStarting = draftStartingPlayerIds.includes(item.id);
                const club = clubsById[item.clubId];
                const handleCaptainPress = () => {
                  if (!isStarting) {
                    Alert.alert(
                      'Not in Starting XI',
                      `${item.name} is on the bench. Add them to your Starting XI first before making them captain.`
                    );
                    return;
                  }
                  setCaptain(item.id);
                };
                const handleViceCaptainPress = () => {
                  if (!isStarting) {
                    Alert.alert(
                      'Not in Starting XI',
                      `${item.name} is on the bench. Add them to your Starting XI first before making them vice-captain.`
                    );
                    return;
                  }
                  setViceCaptain(item.id);
                };
                return (
                  <View key={item.id} style={styles.playerCard}>
                    <TouchableOpacity
                      style={styles.captainStar}
                      onPress={handleCaptainPress}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={isCaptain ? 'star' : 'star-outline'}
                        size={20}
                        color={isCaptain ? Colors.accent : !isStarting ? Colors.border : Colors.textTertiary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.captainStar}
                      onPress={handleViceCaptainPress}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={isViceCaptain ? 'ribbon' : 'ribbon-outline'}
                        size={20}
                        color={isViceCaptain ? Colors.primary : !isStarting ? Colors.border : Colors.textTertiary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.playerCardMain}
                      onPress={() => navigation.navigate('PlayerDetails', { playerId: item.id })}
                      activeOpacity={0.7}
                    >
                      <View style={styles.badgeWrap}>
                        {club?.badge ? (
                          <Image source={club.badge} style={styles.badgeImg} resizeMode="contain" />
                        ) : (
                          <Ionicons name="shield-outline" size={18} color={Colors.textTertiary} />
                        )}
                      </View>
                      <View style={styles.playerInfo}>
                        <Text style={styles.playerName} numberOfLines={1}>
                          {item.name}{isCaptain ? ' (C)' : isViceCaptain ? ' (VC)' : ''}
                        </Text>
                        <View style={styles.playerSubRow}>
                          <Text style={styles.playerSub} numberOfLines={1}>
                            {item.position} · {club?.shortName ?? 'Unknown'}
                          </Text>
                          {isStarting ? (
                            <View style={styles.startingTag}>
                              <Text style={styles.startingTagText}>STARTING</Text>
                            </View>
                          ) : (
                            <View style={styles.benchTag}>
                              <Text style={styles.benchTagText}>BENCH</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                    <Text style={styles.draftPrice}>GH₵{item.price}m</Text>
                    <TouchableOpacity onPress={() => removePlayer(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="trash-outline" size={20} color={Colors.live} />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveSquad} disabled={submitting}>
            <Text style={styles.saveButtonText}>Confirm Squad</Text>
          </TouchableOpacity>
        </View>
      ) : draftPlayers.length < 15 ? (
        <View style={styles.centered}>
          <Ionicons name="football-outline" size={48} color={Colors.grey2} />
          <Text style={styles.readyText}>Complete your 15-man squad first</Text>
          <Text style={styles.hintText}>{draftPlayers.length}/15 players picked</Text>
        </View>
      ) : clubsLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.readyText}>Loading pitch...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          <Text style={styles.hintText}>
            Tap a bench player to add them to your Starting XI, or tap a starter to bench them.
            Formation: {draftFormation}
          </Text>
          <PitchView
            players={draftPlayers}
            startingPlayerIds={draftStartingPlayerIds}
            captainId={draftCaptainId}
            viceCaptainId={draftViceCaptainId}
            formation={draftFormation}
            clubsById={clubsById}
          />

          <Text style={[styles.filterLabel, { marginHorizontal: 0, marginTop: 20 }]}>
            Bench ({draftPlayers.length - draftStartingPlayerIds.length})
          </Text>
          {draftPlayers
            .filter((p) => !draftStartingPlayerIds.includes(p.id))
            .map((item) => {
              const club = clubsById[item.clubId];
              return (
                <View key={item.id} style={styles.playerCard}>
                  <TouchableOpacity
                    style={styles.playerCardMain}
                    onPress={() => toggleStarting(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.badgeWrap}>
                      {club?.badge ? (
                        <Image source={club.badge} style={styles.badgeImg} resizeMode="contain" />
                      ) : (
                        <Ionicons name="shield-outline" size={18} color={Colors.textTertiary} />
                      )}
                    </View>
                    <View style={styles.playerInfo}>
                      <Text style={styles.playerName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.playerSub} numberOfLines={1}>{item.position} · {club?.shortName ?? 'Unknown'}</Text>
                    </View>
                    <Ionicons name="arrow-up-circle-outline" size={26} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.infoButton}
                    onPress={() => navigation.navigate('PlayerDetails', { playerId: item.id })}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="information-circle-outline" size={20} color={Colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              );
            })}

          <Text style={[styles.filterLabel, { marginHorizontal: 0, marginTop: 8 }]}>
            Starting XI ({draftStartingPlayerIds.length}/11) - tap to bench
          </Text>
          {draftPlayers
            .filter((p) => draftStartingPlayerIds.includes(p.id))
            .map((item) => {
              const club = clubsById[item.clubId];
              return (
                <View key={item.id} style={styles.playerCard}>
                  <TouchableOpacity
                    style={styles.playerCardMain}
                    onPress={() => toggleStarting(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.badgeWrap}>
                      {club?.badge ? (
                        <Image source={club.badge} style={styles.badgeImg} resizeMode="contain" />
                      ) : (
                        <Ionicons name="shield-outline" size={18} color={Colors.textTertiary} />
                      )}
                    </View>
                    <View style={styles.playerInfo}>
                      <Text style={styles.playerName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.playerSub} numberOfLines={1}>{item.position} · {club?.shortName ?? 'Unknown'}</Text>
                    </View>
                    <Ionicons name="arrow-down-circle-outline" size={26} color={Colors.textTertiary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.infoButton}
                    onPress={() => navigation.navigate('PlayerDetails', { playerId: item.id })}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="information-circle-outline" size={20} color={Colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              );
            })}
        </ScrollView>
      )}

      <Modal visible={submitting} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.submitOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.submitLabel}>{submitProgress?.label ?? 'Creating your team...'}</Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, Math.round(((submitProgress?.current ?? 0) / (submitProgress?.total ?? 1)) * 100))}%` },
              ]}
            />
          </View>
          <Text style={styles.submitStep}>
            {submitProgress ? `${Math.min(submitProgress.current, submitProgress.total)} of ${submitProgress.total}` : ''}
          </Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  headerSubtitle: { fontSize: 16, color: Colors.primary, fontWeight: '700', marginTop: 4 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 16, gap: 8 },
  tabButton: { flex: 1, paddingVertical: 10, paddingHorizontal: 4, alignItems: 'center', borderRadius: 12, backgroundColor: Colors.surface, borderWidth: 1, borderBottomColor: Colors.border },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textAlign: 'center' },
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
  // Wraps the badge+name+sub portion of a player row as its own tappable
  // area (navigates to PlayerDetails) separate from the row's primary
  // action (add/remove, captain toggle, bench/start toggle) - keeps both
  // gestures working without nesting one TouchableOpacity inside another.
  playerCardMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  infoButton: { marginLeft: 10, padding: 2 },
  playerName: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  captainStar: { marginRight: 12 },
  progressText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 12 },
  playerSub: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
  playerSubRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  startingTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: 'rgba(34,197,94,0.15)',
  },
  startingTagText: { fontSize: 9, fontWeight: '800', color: Colors.win, letterSpacing: 0.4 },
  benchTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: Colors.surface2,
  },
  benchTagText: { fontSize: 9, fontWeight: '800', color: Colors.textTertiary, letterSpacing: 0.4 },
  playerAction: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  playerPrice: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  draftPrice: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary, marginRight: 12 },
  addButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  removeButton: { backgroundColor: Colors.live },
  flex: { flex: 1 },
  nameInput: { backgroundColor: Colors.surface, padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: Colors.border, fontSize: 16, color: Colors.textPrimary },
  hintText: { fontSize: 12, color: Colors.textTertiary, marginBottom: 12, marginTop: -6 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 16,
    marginTop: 4,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIcon: { marginRight: 2 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: Colors.textPrimary },
  filterDropdownRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 12,
  },
  filterDropdown: { flex: 1 },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginTop: 22,
    marginBottom: 10,
  },
  // Fixed height on the ScrollView itself (not just its content) so it can
  // never collapse to less than the chips' natural height - without this
  // the row's cross-axis size could shrink to ~0 and clip the chip labels
  // while still showing the chip backgrounds, making them look empty.
  filterScroll: { height: 44, marginBottom: 4 },
  filterRow: { paddingHorizontal: 16, alignItems: 'center' },
  filterChip: {
    minHeight: 36,
    minWidth: 36,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  filterChipTextActive: { color: Colors.textInverse },
  quotaRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  quotaPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  quotaPillComplete: { backgroundColor: 'rgba(34,197,94,0.12)', borderColor: Colors.win },
  quotaText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  quotaTextComplete: { color: Colors.win },
  badgeWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  badgeImg: { width: 24, height: 24 },
  emptyText: { textAlign: 'center', color: Colors.textTertiary, marginTop: 40 },
  saveButton: { margin: 16, backgroundColor: Colors.primary, padding: 18, borderRadius: 16, alignItems: 'center' },
  saveButtonText: { color: Colors.textInverse, fontSize: 16, fontWeight: '800' },
  // Full-screen dimmed backdrop shown while submitSquad() runs its ~19-call
  // sequence against the backend - no card, just the spinner/label/progress
  // bar floating directly on the dimmed backdrop (blocks taps elsewhere on
  // screen while a submission is actually in flight).
  submitOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
  },
  submitLabel: {
    marginTop: 20,
    marginBottom: 20,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
  submitStep: { marginTop: 10, fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  progressTrack: {
    width: '100%',
    maxWidth: 240,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: Colors.primary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  readyText: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginTop: 20, color: Colors.textPrimary },
  pointsText: { fontSize: 32, fontWeight: '800', color: Colors.primary, marginTop: 12 },
  retryButton: { marginTop: 16, backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 12 },
  retryButtonText: { fontSize: 14, fontWeight: '800', color: Colors.textInverse, textTransform: 'uppercase' },
});
