import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
import { fonts, radius } from '../../constants/layout';
import { useFantasyStore, FORMATIONS, computeFormation } from '../../store/fantasyStore';
import { fetchPlayers } from '../../services/fantasyService';
import { GPL_CLUBS, CLUB_COLORS, CLUB_LOOKUP } from '../../constants/clubs';
import type { FantasyPlayer, FantasyTeam, Player, Position, LeaderboardEntry, FormationKey } from '../../types';

const ALL_CLUBS = GPL_CLUBS;

const MOCK_FANTASY_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, rankChange: 2, userId: 'u1', username: 'KotokoKing', club: CLUB_LOOKUP['kotoko'], totalPoints: 486, weekPoints: 54, isCurrentUser: false },
  { rank: 2, rankChange: -1, userId: 'u2', username: 'HeartsLoyal', club: CLUB_LOOKUP['hearts'], totalPoints: 472, weekPoints: 42, isCurrentUser: false },
  { rank: 3, rankChange: 0, userId: 'u3', username: 'MedeamaMagic', club: CLUB_LOOKUP['medeama'], totalPoints: 458, weekPoints: 48, isCurrentUser: false },
  { rank: 4, rankChange: 5, userId: 'u4', username: 'GoldStarsFan', club: CLUB_LOOKUP['bibiani'], totalPoints: 441, weekPoints: 61, isCurrentUser: false },
  { rank: 5, rankChange: -2, userId: 'u5', username: 'DreamsDawu', club: CLUB_LOOKUP['dreams'], totalPoints: 435, weekPoints: 37, isCurrentUser: false },
  { rank: 128, rankChange: 3, userId: 'user-1', username: 'GPL All Stars', club: CLUB_LOOKUP['kotoko'], totalPoints: 312, weekPoints: 54, isCurrentUser: true },
  { rank: 129, rankChange: -1, userId: 'u6', username: 'RTU Riders', club: CLUB_LOOKUP['rtu'], totalPoints: 308, weekPoints: 41, isCurrentUser: false },
];

const MOCK_PRIVATE_LEAGUES = [
  { id: 'pl1', name: 'Kumasi Kings League', memberCount: 12, rank: 3, totalMembers: 12, code: 'KKL2024' },
  { id: 'pl2', name: 'Friends & Family', memberCount: 6, rank: 1, totalMembers: 6, code: 'FAM24' },
  { id: 'pl3', name: 'GPL Experts', memberCount: 24, rank: 8, totalMembers: 24, code: 'GPLXP' },
];

const POSITION_TABS: Position[] = ['GK', 'DEF', 'MID', 'FWD'];

const MAX_PLAYERS = 15;
const MAX_PER_POSITION: Record<Position, number> = {
  GK: 2,
  DEF: 5,
  MID: 5,
  FWD: 3,
};

type BuilderStep = 'setup' | 'browse' | 'pitch' | 'lineup';
type HubTab = 'team' | 'leaderboard' | 'leagues';

const ROLE_COLORS: Record<Position, string> = {
  GK: Colors.roleGk,
  DEF: Colors.roleDef,
  MID: Colors.roleMid,
  FWD: Colors.roleFwd,
};

export default function FantasyRoot() {
  const insets = useSafeAreaInsets();
  const [teamName, setTeamName] = useState('');
  const [teamBadgeId, setTeamBadgeId] = useState<string | null>(null);
  const [step, setStep] = useState<BuilderStep>('setup');
  const [positionFilter, setPositionFilter] = useState<Position | 'ALL'>('ALL');
  const [hubTab, setHubTab] = useState<HubTab>('team');

  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [playersError, setPlayersError] = useState<string | null>(null);

  const loadPlayers = useCallback(async () => {
    setPlayersLoading(true);
    setPlayersError(null);
    try {
      const data = await fetchPlayers();
      setAllPlayers(data);
    } catch {
      setPlayersError('Failed to load players. Check your connection and try again.');
    } finally {
      setPlayersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (step === 'browse' && allPlayers.length === 0 && !playersLoading && !playersError) {
      loadPlayers();
    }
  }, [step, allPlayers.length, playersLoading, playersError, loadPlayers]);

  const {
    draftPlayers,
    draftCaptainId,
    draftViceCaptainId,
    draftStartingPlayerIds,
    draftFormation,
    budget,
    loading: storeLoading,
    error: storeError,
    addPlayer,
    removePlayer,
    setCaptain,
    setViceCaptain,
    setStartingXI,
    submitSquad,
    lockTeamForGameweek,
    unlockTeam,
    hasSquad,
    team,
    clearError,
  } = useFantasyStore();

  const positionCounts = useMemo(() => {
    const counts: Record<Position, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
    for (const p of draftPlayers) {
      counts[p.position]++;
    }
    return counts;
  }, [draftPlayers]);

  const canAddToPosition = (pos: Position): boolean => {
    return positionCounts[pos] < MAX_PER_POSITION[pos] && draftPlayers.length < MAX_PLAYERS;
  };

  const positionCountTotal = positionCounts.GK + positionCounts.DEF + positionCounts.MID + positionCounts.FWD;

  const handleAddPlayer = (player: Player) => {
    if (!canAddToPosition(player.position)) {
      Alert.alert('Squad Full', `You already have ${positionCounts[player.position]} ${player.position}(s). Max ${MAX_PER_POSITION[player.position]}.`);
      return;
    }
    if (player.price > budget) {
      Alert.alert('Insufficient Budget', `You need $${player.price}m but you only have $${budget.toFixed(1)}m.`);
      return;
    }
    addPlayer(player);
  };

  const handleRemovePlayer = (playerId: string) => {
    removePlayer(playerId);
  };

  const handleConfirmSquad = async () => {
    if (!teamName.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }
    if (draftPlayers.length < MAX_PLAYERS) {
      Alert.alert('Error', `Select exactly ${MAX_PLAYERS} players for your squad (currently ${draftPlayers.length}).`);
      return;
    }
    if (!draftCaptainId) {
      Alert.alert('Error', 'Please select a captain for your starting XI.');
      return;
    }

    try {
      await submitSquad(teamName.trim());
      Alert.alert('Success', `"${teamName.trim()}" has been created!`);
    } catch {
      if (storeError) {
        Alert.alert('Error', storeError);
      }
    }
  };

  const handleLockTeam = async () => {
    try {
      await lockTeamForGameweek();
      Alert.alert('Locked', 'Your team has been locked for the current gameweek.');
    } catch {
      if (storeError) {
        Alert.alert('Error', storeError);
      }
    }
  };

  if (hasSquad && team) {
    if (team.isLocked) {
      return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{team.teamName}</Text>
            <Text style={styles.headerSubtitle}>Overall Rank: {team.overallRank}</Text>
          </View>
          <ScrollView contentContainerStyle={styles.lockedPitchContainer}>
            <Text style={styles.sectionLabel}>Locked Squad (Read-Only)</Text>
            <PitchView
              players={team.players}
              startingPlayerIds={team.startingPlayerIds}
              captainId={team.captainId}
              viceCaptainId={team.viceCaptainId}
              formation={team.formation}
              interactive={false}
            />
          </ScrollView>
        </View>
      );
    }

    const starters = team.players.filter((p) => team.startingPlayerIds?.includes(p.id) ?? p.isStarting);
    const benchPlayers = team.players.filter((p) => !starters.includes(p));

    const renderHubTab = () => {
      switch (hubTab) {
        case 'team':
          return <HubTeamView team={team} starters={starters} benchPlayers={benchPlayers} onLock={handleLockTeam} loading={storeLoading} />;
        case 'leaderboard':
          return <HubLeaderboard entries={MOCK_FANTASY_LEADERBOARD} />;
        case 'leagues':
          return <HubLeagues leagues={MOCK_PRIVATE_LEAGUES} />;
      }
    };

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{team.teamName}</Text>
          <Text style={styles.headerSubtitle}>Gameweek Points: {team.weekPoints} &middot; Overall Rank: {team.overallRank}</Text>
        </View>

        {storeError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{storeError}</Text>
            <TouchableOpacity onPress={clearError}>
              <Ionicons name="close" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.hubTabRow}>
          {(['team', 'leaderboard', 'leagues'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.hubTab, hubTab === tab && styles.hubTabActive]}
              onPress={() => setHubTab(tab)}
            >
              <Ionicons
                name={
                  tab === 'team' ? 'shirt-outline' :
                  tab === 'leaderboard' ? 'trophy-outline' :
                  'people-outline'
                }
                size={16}
                color={hubTab === tab ? Colors.textInverse : Colors.textSecondary}
              />
              <Text style={[styles.hubTabText, hubTab === tab && styles.hubTabTextActive]}>
                {tab === 'team' ? 'My Team' : tab === 'leaderboard' ? 'Leaderboard' : 'Leagues'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.hubContent}
        >
          {renderHubTab()}
        </ScrollView>
      </View>
    );
  }

  // ─── Builder flow ───
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Squad Builder</Text>
        <Text style={styles.headerSubtitle}>Budget: ${budget.toFixed(1)}m</Text>
      </View>

      {storeError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{storeError}</Text>
          <TouchableOpacity onPress={clearError}>
            <Ionicons name="close" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.stepRow}>
        <StepDot index={1} label="Setup" active={step === 'setup'} done={step !== 'setup' && teamName.trim().length > 0} />
        <View style={styles.stepConnector} />
        <StepDot index={2} label="Browse" active={step === 'browse'} done={step === 'pitch' || step === 'lineup'} />
        <View style={styles.stepConnector} />
        <StepDot index={3} label="Pitch" active={step === 'pitch'} done={step === 'lineup'} />
        <View style={styles.stepConnector} />
        <StepDot index={4} label="Lineup" active={step === 'lineup'} done={false} />
      </View>

      {step === 'setup' && (
        <SetupStep
          teamName={teamName}
          onChangeTeamName={setTeamName}
          teamBadgeId={teamBadgeId}
          onChangeBadge={setTeamBadgeId}
          onNext={() => setStep('browse')}
        />
      )}

      {step === 'browse' && (
        <BrowseStep
          players={allPlayers}
          draftPlayers={draftPlayers}
          budget={budget}
          positionFilter={positionFilter}
          onPositionFilter={setPositionFilter}
          onAdd={handleAddPlayer}
          onRemove={handleRemovePlayer}
          positionCounts={positionCounts}
          positionCountTotal={positionCountTotal}
          canAddToPosition={canAddToPosition}
          onNext={() => setStep('pitch')}
          onBack={() => setStep('setup')}
          loading={playersLoading}
          error={playersError}
          onRetry={loadPlayers}
        />
      )}

      {step === 'pitch' && (
        <PitchStep
          players={draftPlayers}
          onNext={() => setStep('lineup')}
          onBack={() => setStep('browse')}
        />
      )}

      {step === 'lineup' && (
        <LineupStep
          players={draftPlayers}
          startingPlayerIds={draftStartingPlayerIds}
          captainId={draftCaptainId}
          viceCaptainId={draftViceCaptainId}
          onSetStartingXI={setStartingXI}
          onSetCaptain={setCaptain}
          onSetViceCaptain={setViceCaptain}
          onBack={() => setStep('pitch')}
          onConfirm={handleConfirmSquad}
        />
      )}
    </View>
  );
}

// ─── Step indicator ───
function StepDot({ index, label, active, done }: { index: number; label: string; active: boolean; done: boolean }) {
  return (
    <View style={styles.stepDotContainer}>
      <View style={[styles.stepCircle, active && styles.stepCircleActive, done && styles.stepCircleDone]}>
        {done ? (
          <Ionicons name="checkmark" size={14} color={Colors.textInverse} />
        ) : (
          <Text style={[styles.stepCircleText, active && styles.stepCircleTextActive]}>{index}</Text>
        )}
      </View>
      <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{label}</Text>
    </View>
  );
}

// ─── Setup step ───
function SetupStep({
  teamName,
  onChangeTeamName,
  teamBadgeId,
  onChangeBadge,
  onNext,
}: {
  teamName: string;
  onChangeTeamName: (v: string) => void;
  teamBadgeId: string | null;
  onChangeBadge: (v: string | null) => void;
  onNext: () => void;
}) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.sectionLabel}>Team Name</Text>
      <TextInput
        style={styles.nameInput}
        placeholder="e.g. Kumasi Kings"
        value={teamName}
        onChangeText={onChangeTeamName}
        maxLength={30}
      />

      <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Team Badge (optional)</Text>
      <Text style={styles.hintText}>Pick a club badge as your team emblem.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgePickerRow}>
        <TouchableOpacity
          style={[styles.badgePickerItem, teamBadgeId === null && styles.badgePickerItemActive]}
          onPress={() => onChangeBadge(null)}
        >
          <View style={styles.badgeCircle}>
            <Ionicons name="shuffle" size={22} color={Colors.textSecondary} />
          </View>
          <Text style={styles.badgePickerLabel}>None</Text>
        </TouchableOpacity>
        {ALL_CLUBS.map((club) => (
          <TouchableOpacity
            key={club.id}
            style={[styles.badgePickerItem, teamBadgeId === club.id && styles.badgePickerItemActive]}
            onPress={() => onChangeBadge(club.id)}
          >
            <View style={[styles.badgeCircle, { backgroundColor: CLUB_COLORS[club.id] || Colors.primaryLight }]}>
              <Text style={styles.badgeCircleText}>{club.shortName.slice(0, 2).toUpperCase()}</Text>
            </View>
            <Text style={styles.badgePickerLabel}>{club.shortName}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.nextButton, !teamName.trim() && styles.nextButtonDisabled]}
        disabled={!teamName.trim()}
        onPress={onNext}
      >
        <Text style={styles.nextButtonText}>Continue to Browse Players</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Browse step ───
function BrowseStep({
  players,
  draftPlayers,
  budget,
  positionFilter,
  onPositionFilter,
  onAdd,
  onRemove,
  positionCounts,
  positionCountTotal,
  canAddToPosition,
  onNext,
  onBack,
  loading,
  error,
  onRetry,
}: {
  players: Player[];
  draftPlayers: Player[];
  budget: number;
  positionFilter: Position | 'ALL';
  onPositionFilter: (v: Position | 'ALL') => void;
  onAdd: (p: Player) => void;
  onRemove: (id: string) => void;
  positionCounts: Record<Position, number>;
  positionCountTotal: number;
  canAddToPosition: (pos: Position) => boolean;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const filtered = useMemo(() => {
    if (positionFilter === 'ALL') return players;
    return players.filter((p) => p.position === positionFilter);
  }, [players, positionFilter]);

  const draftIds = useMemo(() => new Set(draftPlayers.map((p) => p.id)), [draftPlayers]);

  const allSlotsFilled = positionCountTotal === MAX_PLAYERS;

  if (loading) {
    return (
      <View style={[styles.flex, styles.centeredMessage]}>
        <ActivityIndicator size="large" color={Colors.yellow} />
        <Text style={styles.loadingText}>Loading players...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.flex, styles.centeredMessage]}>
        <Ionicons name="cloud-offline-outline" size={48} color={Colors.grey2} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <View style={styles.compositionBar}>
        <CompoBadge label="GK" count={positionCounts.GK} max={MAX_PER_POSITION.GK} />
        <CompoBadge label="DEF" count={positionCounts.DEF} max={MAX_PER_POSITION.DEF} />
        <CompoBadge label="MID" count={positionCounts.MID} max={MAX_PER_POSITION.MID} />
        <CompoBadge label="FWD" count={positionCounts.FWD} max={MAX_PER_POSITION.FWD} />
        <View style={styles.compoTotal}>
          <Text style={styles.compoTotalText}>{positionCountTotal}/{MAX_PLAYERS}</Text>
        </View>
      </View>

      <View style={styles.posTabRow}>
        <TouchableOpacity
          style={[styles.posTab, positionFilter === 'ALL' && styles.posTabActive]}
          onPress={() => onPositionFilter('ALL')}
        >
          <Text style={[styles.posTabText, positionFilter === 'ALL' && styles.posTabTextActive]}>All</Text>
        </TouchableOpacity>
        {POSITION_TABS.map((pos) => (
          <TouchableOpacity
            key={pos}
            style={[styles.posTab, positionFilter === pos && styles.posTabActive]}
            onPress={() => onPositionFilter(pos)}
          >
            <Text style={[styles.posTabText, positionFilter === pos && styles.posTabTextActive]}>{pos}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const selected = draftIds.has(item.id);
          const addDisabled = !selected && !canAddToPosition(item.position);
          return (
            <View style={styles.playerCard}>
              <View style={[styles.clubDot, { backgroundColor: CLUB_COLORS[item.clubId] || Colors.primary }]} />
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{item.name}</Text>
                <Text style={styles.playerSub}>
                  {item.position} &middot; {item.club.shortName}
                </Text>
              </View>
              <View style={styles.playerAction}>
                <Text style={styles.playerPrice}>${item.price}m</Text>
                <TouchableOpacity
                  style={[styles.addButton, selected && styles.removeButton, addDisabled && styles.addButtonDisabled]}
                  onPress={() => (selected ? onRemove(item.id) : onAdd(item))}
                  disabled={addDisabled}
                >
                  <Ionicons
                    name={selected ? 'remove' : 'add'}
                    size={20}
                    color={Colors.textInverse}
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          <View style={styles.footerButtons}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextButton, !allSlotsFilled && styles.nextButtonDisabled]}
              disabled={!allSlotsFilled}
              onPress={onNext}
            >
              <Text style={styles.nextButtonText}>
                {allSlotsFilled ? 'View Pitch' : `Need ${MAX_PLAYERS - positionCountTotal} more`}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

// ─── Pitch step ───
function PitchStep({
  players,
  onNext,
  onBack,
}: {
  players: Player[];
  onNext: () => void;
  onBack: () => void;
}) {
  const gk = players.filter((p) => p.position === 'GK');
  const def = players.filter((p) => p.position === 'DEF');
  const mid = players.filter((p) => p.position === 'MID');
  const fwd = players.filter((p) => p.position === 'FWD');

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.pitchScroll}>
        <Text style={styles.sectionLabel}>Your 15-Man Squad</Text>
        <View style={styles.pitchContainer}>
          <PitchRoleSection label="FWD" players={fwd} />
          <PitchRoleSection label="MID" players={mid} />
          <PitchRoleSection label="DEF" players={def} />
          <PitchRoleSection label="GK" players={gk} />
        </View>
      </ScrollView>
      <View style={styles.footerButtons}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
          <Text style={styles.nextButtonText}>Select Starting XI</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PitchRoleSection({ label, players }: { label: string; players: Player[] }) {
  if (players.length === 0) return null;
  const pos = label as Position;
  return (
    <View style={styles.pitchSection}>
      <Text style={styles.pitchSectionLabel}>{label}</Text>
      <View style={styles.pitchPlayerRow}>
        {players.map((p) => (
          <View key={p.id} style={styles.playerTokenWrapper}>
            <View
              style={[
                styles.playerTokenCircle,
                { backgroundColor: ROLE_COLORS[pos] || Colors.primary },
              ]}
            >
              <Text style={styles.playerTokenInitial}>
                {p.name.split(' ').pop()?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <Text style={styles.playerTokenName} numberOfLines={1}>
              {p.name.split(' ').pop()}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Lineup step ───
function LineupStep({
  players,
  startingPlayerIds,
  captainId,
  viceCaptainId,
  onSetStartingXI,
  onSetCaptain,
  onSetViceCaptain,
  onBack,
  onConfirm,
}: {
  players: Player[];
  startingPlayerIds: string[];
  captainId: string | null;
  viceCaptainId: string | null;
  onSetStartingXI: (ids: string[]) => void;
  onSetCaptain: (id: string) => void;
  onSetViceCaptain: (id: string) => void;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const starters = players.filter((p) => startingPlayerIds.includes(p.id));

  const defCount = starters.filter((p) => p.position === 'DEF').length;
  const midCount = starters.filter((p) => p.position === 'MID').length;
  const fwdCount = starters.filter((p) => p.position === 'FWD').length;

  const currentFormation = computeFormation(defCount, midCount, fwdCount);
  const isValidFormation = currentFormation !== null;

  const handleToggleStarter = (playerId: string) => {
    if (startingPlayerIds.includes(playerId)) {
      onSetStartingXI(startingPlayerIds.filter((id) => id !== playerId));
    } else {
      if (startingPlayerIds.length >= 11) {
        Alert.alert('Max 11', 'You can only select 11 starters.');
        return;
      }
      const pos = players.find((p) => p.id === playerId)?.position;
      if (pos === 'GK') {
        const existingGkStarter = startingPlayerIds.find((id) => players.find((p) => p.id === id)?.position === 'GK');
        if (existingGkStarter) {
          Alert.alert('GK Slot', 'Only one goalkeeper can start.');
          return;
        }
      }
      onSetStartingXI([...startingPlayerIds, playerId]);
    }
  };

  const handleSetCaptain = (playerId: string) => {
    onSetCaptain(playerId);
  };

  const handleSetViceCaptain = (playerId: string) => {
    onSetViceCaptain(playerId);
  };

  const bench = players.filter((p) => !startingPlayerIds.includes(p.id));

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.listContent}>
        <View style={styles.formationBanner}>
          <Text style={styles.formationBannerLabel}>
            {currentFormation ? `${currentFormation}` : 'Invalid formation'}
          </Text>
          <Text style={styles.formationBannerDetail}>
            1 GK &middot; {defCount} DEF &middot; {midCount} MID &middot; {fwdCount} FWD
          </Text>
        </View>

        {!isValidFormation && (
          <View style={styles.formationWarning}>
            <Ionicons name="alert-circle" size={16} color={Colors.red} />
            <Text style={styles.formationWarningText}>
              Pick a valid combination: {
                Object.values(FORMATIONS).map((f) => `${f.def}-${f.mid}-${f.fwd}`).join(', ')
              } + 1 GK
            </Text>
          </View>
        )}

        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>
          Starting XI ({starters.length}/11)
        </Text>
        <Text style={styles.hintText}>
          Tap a player to toggle starter/bench. Tap a starter to set captain or VC.
        </Text>

        <View style={styles.miniPitch}>
          {(['GK', 'DEF', 'MID', 'FWD'] as const).map((pos) => {
            const posPlayers = starters.filter((p) => p.position === pos);
            if (posPlayers.length === 0) return null;
            return (
              <View key={pos} style={styles.miniPitchRow}>
                <Text style={styles.miniPitchPosLabel}>{pos}</Text>
                <View style={styles.miniPitchPlayers}>
                  {posPlayers.map((p) => (
                    <PlayerChip
                      key={p.id}
                      player={p}
                      role={
                        p.id === captainId
                          ? 'captain'
                          : p.id === viceCaptainId
                            ? 'vice'
                            : 'starter'
                      }
                      onTapRole={() => {
                        Alert.alert(
                          'Set Role',
                          `What role for ${p.name}?`,
                          [
                            { text: 'Captain', onPress: () => handleSetCaptain(p.id) },
                            { text: 'Vice Captain', onPress: () => handleSetViceCaptain(p.id) },
                            { text: 'Remove from XI', onPress: () => handleToggleStarter(p.id), style: 'destructive' },
                            { text: 'Cancel', style: 'cancel' },
                          ]
                        );
                      }}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Bench ({bench.length})</Text>
        <View style={styles.benchRow}>
          {bench.length === 0 ? (
            <Text style={styles.hintText}>All players are starting. Remove some from the XI first.</Text>
          ) : (
            bench.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.benchChip, { borderLeftColor: CLUB_COLORS[p.clubId] || Colors.primary }]}
                onPress={() => handleToggleStarter(p.id)}
              >
                <Text style={styles.benchChipName}>{p.name}</Text>
                <Text style={styles.benchChipPos}>{p.position}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.footerButtons}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.confirmButton, (!captainId || !isValidFormation) && styles.nextButtonDisabled]}
          disabled={!captainId || !isValidFormation}
          onPress={onConfirm}
        >
          <Text style={styles.confirmButtonText}>Confirm Squad</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Player chip for lineup view ───
function PlayerChip({
  player,
  role,
  onTapRole,
}: {
  player: Player;
  role: 'starter' | 'captain' | 'vice';
  onTapRole: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.playerChipBase,
        { backgroundColor: CLUB_COLORS[player.clubId] || Colors.primary },
        role === 'captain' && styles.playerChipCaptain,
        role === 'vice' && styles.playerChipVice,
      ]}
      onPress={onTapRole}
    >
      <Text style={styles.playerChipName}>{player.name.split(' ').pop()}</Text>
      {role === 'captain' && (
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>C</Text>
        </View>
      )}
      {role === 'vice' && (
        <View style={[styles.roleBadge, styles.roleBadgeVice]}>
          <Text style={styles.roleBadgeText}>VC</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Pitch view (reusable: interactive or read-only) ───
function PitchView({
  players,
  startingPlayerIds,
  captainId,
  viceCaptainId,
  formation,
  interactive,
}: {
  players: Player[];
  startingPlayerIds?: string[];
  captainId?: string;
  viceCaptainId?: string;
  formation?: FormationKey;
  interactive: boolean;
}) {
  const starters = startingPlayerIds
    ? players.filter((p) => startingPlayerIds.includes(p.id))
    : players;

  const benchPlayers = startingPlayerIds
    ? players.filter((p) => !startingPlayerIds.includes(p.id))
    : [];

  return (
    <View>
      <View style={styles.pitchFormationHeader}>
        <Text style={styles.formationLabel}>Formation: {formation || 'Custom'}</Text>
      </View>
      <View style={styles.pitchContainer}>
        <PitchRoleSection label="FWD" players={starters.filter((p) => p.position === 'FWD')} />
        <PitchRoleSection label="MID" players={starters.filter((p) => p.position === 'MID')} />
        <PitchRoleSection label="DEF" players={starters.filter((p) => p.position === 'DEF')} />
        <PitchRoleSection label="GK" players={starters.filter((p) => p.position === 'GK')} />
      </View>
      {(captainId || viceCaptainId) && (
        <View style={styles.captaincyRow}>
          {captainId && (
            <View style={styles.captainBadge}>
              <Text style={styles.captainBadgeText}>
                C: {players.find((p) => p.id === captainId)?.name.split(' ').pop()}
              </Text>
            </View>
          )}
          {viceCaptainId && (
            <View style={[styles.captainBadge, styles.viceBadge]}>
              <Text style={styles.captainBadgeText}>
                VC: {players.find((p) => p.id === viceCaptainId)?.name.split(' ').pop()}
              </Text>
            </View>
          )}
        </View>
      )}
      {benchPlayers.length > 0 && (
        <View style={styles.benchPitchSection}>
          <Text style={styles.benchLabel}>Bench</Text>
          <View style={styles.benchPitchRow}>
            {benchPlayers.map((p) => (
              <View key={p.id} style={[styles.benchPitchChip, { borderLeftColor: CLUB_COLORS[p.clubId] || Colors.primary }]}>
                <Text style={styles.benchPitchName}>{p.name.split(' ').pop()}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Composition badge ───
function CompoBadge({ label, count, max }: { label: string; count: number; max: number }) {
  const full = count >= max;
  const empty = count === 0;
  return (
    <View style={[styles.compoBadge, full && styles.compoBadgeFull, empty && styles.compoBadgeEmpty]}>
      <Text style={styles.compoBadgeLabel}>{label}</Text>
      <Text style={[styles.compoBadgeCount, full && styles.compoBadgeCountFull]}>
        {count}/{max}
      </Text>
    </View>
  );
}

// ─── Hub Tab: My Team ───
function HubTeamView({
  team,
  starters,
  benchPlayers,
  onLock,
  loading,
}: {
  team: FantasyTeam;
  starters: FantasyPlayer[];
  benchPlayers: FantasyPlayer[];
  onLock: () => void;
  loading: boolean;
}) {
  return (
    <>
      <View style={styles.teamSummary}>
        <Text style={styles.teamSummaryPoints}>{team.weekPoints}</Text>
        <Text style={styles.teamSummaryLabel}>Gameweek Points</Text>
        <View style={styles.teamSummaryRow}>
          <View style={styles.teamSummaryStat}>
            <Text style={styles.teamSummaryStatValue}>{team.totalPoints}</Text>
            <Text style={styles.teamSummaryStatLabel}>Total</Text>
          </View>
          <View style={styles.teamSummaryStat}>
            <Text style={styles.teamSummaryStatValue}>#{team.overallRank}</Text>
            <Text style={styles.teamSummaryStatLabel}>Rank</Text>
          </View>
        </View>
      </View>

      <PitchView
        players={starters}
        captainId={team.captainId}
        viceCaptainId={team.viceCaptainId}
        formation={team.formation}
        interactive={false}
      />

      {benchPlayers.length > 0 && (
        <View style={styles.benchPitchSection}>
          <Text style={styles.benchLabel}>Bench</Text>
          <View style={styles.benchPitchRow}>
            {benchPlayers.map((p) => (
              <View key={p.id} style={[styles.benchPitchChip, { borderLeftColor: CLUB_COLORS[p.clubId] || Colors.primary }]}>
                <Text style={styles.benchPitchName}>{p.name.split(' ').pop()}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.lockButton, loading && styles.lockButtonDisabled]}
        onPress={onLock}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#000000" />
        ) : (
          <Ionicons name="lock-closed" size={18} color={Colors.textInverse} />
        )}
        <Text style={styles.lockButtonText}>{loading ? 'Locking...' : 'Lock Team for Gameweek'}</Text>
      </TouchableOpacity>
    </>
  );
}

// ─── Hub Tab: Leaderboard ───
function HubLeaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <View style={styles.leaderboardWrap}>
      <Text style={styles.sectionLabel}>Fantasy League Standings</Text>
      {entries.map((entry) => {
        const initials = entry.club?.shortName?.slice(0, 2).toUpperCase() ?? '??';
        const rankColor =
          entry.rankChange > 0 ? Colors.win :
          entry.rankChange < 0 ? Colors.live :
          Colors.textTertiary;
        const rankIcon =
          entry.rankChange > 0 ? 'arrow-up' :
          entry.rankChange < 0 ? 'arrow-down' :
          'remove';

        return (
          <View key={entry.userId} style={[styles.leaderboardRow, entry.isCurrentUser && styles.leaderboardRowCurrent]}>
            <Text style={styles.leaderboardRank}>#{entry.rank}</Text>
            <View style={[styles.leaderboardAvatar, { backgroundColor: entry.club ? (CLUB_COLORS[entry.club.id] || Colors.primary) : Colors.primary }]}>
              <Text style={styles.leaderboardAvatarText}>{initials}</Text>
            </View>
            <View style={styles.leaderboardInfo}>
              <Text style={styles.leaderboardName}>{entry.username}</Text>
              {entry.club && <Text style={styles.leaderboardClub}>{entry.club.shortName}</Text>}
            </View>
            <View style={styles.leaderboardPointsWrap}>
              <Text style={styles.leaderboardPoints}>{entry.totalPoints}</Text>
              <Text style={styles.leaderboardPointsLabel}>pts</Text>
            </View>
            <View style={[styles.leaderboardChange, { backgroundColor: rankColor + '20' }]}>
              <Ionicons name={rankIcon as any} size={12} color={rankColor} />
              <Text style={[styles.leaderboardChangeText, { color: rankColor }]}>{Math.abs(entry.rankChange)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Hub Tab: Private Leagues ───
function HubLeagues({ leagues }: { leagues: { id: string; name: string; memberCount: number; rank: number; totalMembers: number; code: string }[] }) {
  return (
    <View style={styles.leaderboardWrap}>
      <View style={styles.leaguesHeader}>
        <Text style={styles.sectionLabel}>Your Private Leagues</Text>
        <TouchableOpacity
          style={styles.leaguesCreateBtn}
          onPress={() => Alert.alert('Coming Soon', 'Private league creation will be available soon.')}
        >
          <Ionicons name="add" size={18} color={Colors.textInverse} />
          <Text style={styles.leaguesCreateText}>Create</Text>
        </TouchableOpacity>
      </View>
      {leagues.map((league) => (
        <TouchableOpacity
          key={league.id}
          style={styles.leagueCard}
          activeOpacity={0.7}
          onPress={() => Alert.alert(league.name, `Rank: ${league.rank}/${league.totalMembers}\nMembers: ${league.memberCount}\nCode: ${league.code}`)}
        >
          <View style={styles.leagueTop}>
            <View style={styles.leagueNameRow}>
              <Ionicons name="people" size={18} color={Colors.primary} />
              <Text style={styles.leagueName}>{league.name}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </View>
          <View style={styles.leagueStats}>
            <View style={styles.leagueStat}>
              <Text style={styles.leagueStatValue}>{league.rank}/{league.totalMembers}</Text>
              <Text style={styles.leagueStatLabel}>Your Rank</Text>
            </View>
            <View style={styles.leagueStat}>
              <Text style={styles.leagueStatValue}>{league.memberCount}</Text>
              <Text style={styles.leagueStatLabel}>Members</Text>
            </View>
            <View style={styles.leagueStat}>
              <Text style={styles.leagueStatValue}>{league.code}</Text>
              <Text style={styles.leagueStatLabel}>Join Code</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Styles ───
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  header: { padding: 20, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 24, fontWeight: '800', fontFamily: fonts.display, color: Colors.white, textTransform: 'uppercase' },
  headerSubtitle: { fontSize: 14, color: Colors.grey1, fontWeight: '600', marginTop: 4 },
  flex: { flex: 1 },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(208,2,27,0.15)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.red,
  },
  errorBannerText: { flex: 1, fontSize: 13, color: Colors.red, marginRight: 8 },

  centeredMessage: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { fontSize: 14, color: Colors.grey1, marginTop: 12 },
  errorText: { fontSize: 14, color: Colors.grey1, marginTop: 12, textAlign: 'center' },
  retryButton: { marginTop: 16, backgroundColor: Colors.yellow, paddingVertical: 12, paddingHorizontal: 28, borderRadius: radius.button },
  retryButtonText: { fontSize: 14, fontWeight: '800', color: '#000000', fontFamily: fonts.display, textTransform: 'uppercase' },

  // Steps
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stepDotContainer: { alignItems: 'center' },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: { backgroundColor: Colors.yellow },
  stepCircleDone: { backgroundColor: Colors.green },
  stepCircleText: { fontSize: 12, fontWeight: '700', color: Colors.grey1 },
  stepCircleTextActive: { color: '#000000' },
  stepLabel: { fontSize: 10, color: Colors.grey2, marginTop: 4 },
  stepLabelActive: { color: Colors.yellow, fontWeight: '600' },
  stepConnector: { flex: 1, height: 2, backgroundColor: Colors.border, marginHorizontal: 6, marginBottom: 18 },

  stepContent: { flex: 1, padding: 20 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: Colors.white, marginBottom: 8 },
  hintText: { fontSize: 12, color: Colors.grey2, marginBottom: 12 },

  // Setup
  nameInput: { backgroundColor: Colors.surface2, padding: 13, borderRadius: radius.input, borderWidth: 1, borderColor: Colors.border, fontSize: 14, color: Colors.white },
  badgePickerRow: { marginBottom: 24 },
  badgePickerItem: { alignItems: 'center', marginRight: 12, padding: 4, borderRadius: 8, borderWidth: 2, borderColor: 'transparent' },
  badgePickerItemActive: { borderColor: Colors.yellow },
  badgeCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface2, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  badgeCircleText: { fontSize: 12, fontWeight: '800', color: Colors.white },
  badgePickerLabel: { fontSize: 10, color: Colors.grey1 },

  // Browse
  compositionBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
    gap: 8,
  },
  compoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  compoBadgeFull: { backgroundColor: Colors.green },
  compoBadgeEmpty: { opacity: 0.5 },
  compoBadgeLabel: { fontSize: 11, fontWeight: '700', color: Colors.grey1 },
  compoBadgeCount: { fontSize: 10, fontWeight: '800', color: Colors.white },
  compoBadgeCountFull: { color: Colors.white },
  compoTotal: { marginLeft: 'auto', backgroundColor: Colors.surface2, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  compoTotalText: { fontSize: 13, fontWeight: '700', color: Colors.white },

  posTabRow: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  posTab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 9999, backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.border },
  posTabActive: { backgroundColor: Colors.yellow, borderColor: Colors.yellow },
  posTabText: { fontSize: 13, fontWeight: '600', color: Colors.white },
  posTabTextActive: { color: '#000000', fontWeight: '700' },

  listContent: { padding: 16, paddingBottom: 32 },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: radius.card,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clubDot: { width: 6, height: 40, borderRadius: 3, marginRight: 12 },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 14, fontWeight: '700', color: Colors.white },
  playerSub: { fontSize: 11, color: Colors.grey1, marginTop: 2 },
  playerAction: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  playerPrice: { fontSize: 13, fontWeight: '700', color: Colors.yellow },
  addButton: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center' },
  removeButton: { backgroundColor: Colors.red },
  addButtonDisabled: { backgroundColor: Colors.grey2, opacity: 0.5 },

  footerButtons: { flexDirection: 'row', padding: 16, gap: 12, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
  backButton: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: radius.button, borderWidth: 1, borderColor: Colors.border },
  backButtonText: { fontSize: 14, fontWeight: '700', color: Colors.grey1 },
  nextButton: { flex: 1, paddingVertical: 14, borderRadius: radius.button, backgroundColor: Colors.yellow, alignItems: 'center' },
  nextButtonDisabled: { backgroundColor: Colors.border },
  nextButtonText: { color: '#000000', fontSize: 14, fontWeight: '800', fontFamily: fonts.display, textTransform: 'uppercase' },

  // Pitch
  pitchScroll: { padding: 16 },
  pitchContainer: {
    backgroundColor: Colors.pitchGrass,
    borderRadius: 20,
    padding: 16,
    minHeight: 300,
  },
  pitchSection: { marginBottom: 16 },
  pitchSectionLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.7)', marginBottom: 6, textTransform: 'uppercase' },
  pitchPlayerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },

  playerTokenWrapper: { alignItems: 'center', width: 56 },
  playerTokenCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  playerTokenInitial: { fontSize: 16, fontWeight: '800', color: Colors.white },
  playerTokenName: { fontSize: 10, color: Colors.white, marginTop: 4, textAlign: 'center', maxWidth: 54 },

  pitchFormationHeader: { alignItems: 'center', marginBottom: 8 },
  formationLabel: { fontSize: 14, fontWeight: '700', color: Colors.grey1, textAlign: 'center' },

  // Lineup
  formationBanner: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formationBannerLabel: { fontSize: 22, fontWeight: '800', fontFamily: fonts.display, color: Colors.yellow, textTransform: 'uppercase' },
  formationBannerDetail: { fontSize: 13, color: Colors.grey1, marginTop: 4 },

  formationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(208,2,27,0.1)',
    padding: 12,
    borderRadius: radius.card,
    marginBottom: 12,
    gap: 8,
  },
  formationWarningText: { flex: 1, fontSize: 12, color: Colors.red },

  miniPitch: { backgroundColor: Colors.pitchGrass, borderRadius: 16, padding: 12, marginTop: 8 },
  miniPitchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  miniPitchPosLabel: { width: 32, fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.6)' },
  miniPitchPlayers: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  playerChipBase: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playerChipCaptain: { borderWidth: 2, borderColor: Colors.fantasyGold },
  playerChipVice: { borderWidth: 2, borderColor: Colors.grey2 },
  playerChipName: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  roleBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.fantasyGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBadgeVice: { backgroundColor: Colors.grey2 },
  roleBadgeText: { fontSize: 9, fontWeight: '900', color: '#000000' },
  benchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  benchChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
    borderRadius: radius.card,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 100,
  },
  benchChipName: { fontSize: 12, fontWeight: '700', color: Colors.white, flex: 1 },
  benchChipPos: { fontSize: 10, fontWeight: '600', color: Colors.grey2 },
  confirmButton: { flex: 1, paddingVertical: 14, borderRadius: radius.button, backgroundColor: Colors.yellow, alignItems: 'center' },
  confirmButtonText: { color: '#000000', fontSize: 14, fontWeight: '800', fontFamily: fonts.display, textTransform: 'uppercase' },

  // Ready / Locked
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  readyText: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginTop: 20, color: Colors.white },
  pointsText: { fontSize: 32, fontWeight: '800', color: Colors.yellow, marginTop: 12 },
  lockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    backgroundColor: Colors.yellow,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: radius.button,
  },
  lockButtonDisabled: { opacity: 0.6 },
  lockButtonText: { color: '#000000', fontSize: 15, fontWeight: '700', fontFamily: fonts.display, textTransform: 'uppercase' },
  lockedPitchContainer: { padding: 16 },
  captaincyRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 12 },
  captainBadge: {
    backgroundColor: Colors.fantasyGold,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  viceBadge: { backgroundColor: Colors.grey2 },
  captainBadgeText: { fontSize: 12, fontWeight: '700', color: '#000000' },
  benchPitchSection: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  benchLabel: { fontSize: 12, fontWeight: '700', color: Colors.grey2, marginBottom: 8 },
  benchPitchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  benchPitchChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  benchPitchName: { fontSize: 11, color: Colors.grey1 },

  // Hub tabs
  hubTabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  hubTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.button,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hubTabActive: { backgroundColor: Colors.yellow, borderColor: Colors.yellow },
  hubTabText: { fontSize: 13, fontWeight: '600', color: Colors.grey1 },
  hubTabTextActive: { color: '#000000', fontWeight: '700' },
  hubContent: { padding: 16, paddingBottom: 40 },

  // Team Summary
  teamSummary: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  teamSummaryPoints: { fontSize: 40, fontWeight: '800', fontFamily: fonts.display, color: Colors.yellow },
  teamSummaryLabel: { fontSize: 13, color: Colors.grey2, marginTop: 4 },
  teamSummaryRow: { flexDirection: 'row', marginTop: 12, gap: 24 },
  teamSummaryStat: { alignItems: 'center' },
  teamSummaryStatValue: { fontSize: 18, fontWeight: '700', color: Colors.white },
  teamSummaryStatLabel: { fontSize: 11, color: Colors.grey2, marginTop: 2 },

  // Leaderboard
  leaderboardWrap: { flex: 1 },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: radius.card,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  leaderboardRowCurrent: { borderColor: Colors.yellow },
  leaderboardRank: { width: 36, fontSize: 13, fontWeight: '700', color: Colors.grey2 },
  leaderboardAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardAvatarText: { fontSize: 12, fontWeight: '800', color: Colors.white },
  leaderboardInfo: { flex: 1 },
  leaderboardName: { fontSize: 14, fontWeight: '700', color: Colors.white },
  leaderboardClub: { fontSize: 11, color: Colors.grey2, marginTop: 1 },
  leaderboardPointsWrap: { alignItems: 'center' },
  leaderboardPoints: { fontSize: 16, fontWeight: '800', color: Colors.white },
  leaderboardPointsLabel: { fontSize: 9, color: Colors.grey2 },
  leaderboardChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  leaderboardChangeText: { fontSize: 11, fontWeight: '700' },

  // Leagues
  leaguesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  leaguesCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.yellow,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  leaguesCreateText: { color: '#000000', fontSize: 13, fontWeight: '700' },
  leagueCard: {
    backgroundColor: Colors.surface,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  leagueTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  leagueNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  leagueName: { fontSize: 15, fontWeight: '700', color: Colors.white },
  leagueStats: { flexDirection: 'row', gap: 16 },
  leagueStat: { flex: 1, alignItems: 'center' },
  leagueStatValue: { fontSize: 14, fontWeight: '700', color: Colors.white },
  leagueStatLabel: { fontSize: 10, color: Colors.grey2, marginTop: 2 },
});
