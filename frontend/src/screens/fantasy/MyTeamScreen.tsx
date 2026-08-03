import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { fonts, radius, getScrollBottomPadding } from '../../constants/layout';
import { CLUB_COLORS } from '../../constants/clubs';
import { useFantasyStore, FORMATIONS, canApplyFormation } from '../../store/fantasyStore';
import * as fantasyService from '../../services/fantasyService';
import { getApiErrorMessage } from '../../services/api';
import { fetchClubsById, backendClubIdToLocalClub, RealClub } from '../../services/clubService';
import SegmentedControl from '../../components/shared/SegmentedControl';
import PitchView from '../../components/fantasy/PitchView';
import ChipCard from '../../components/fantasy/ChipCard';
import type { GamesStackParamList } from '../../navigation/GamesStack';
import type { FantasyPlayer, FormationKey, ChipType, ChipStatus } from '../../types';

type ViewMode = 'pitch' | 'list';

const CHIPS: { name: string; icon: keyof typeof Ionicons.glyphMap; chipType: ChipType }[] = [
  { name: 'Bench Boost', icon: 'rocket-outline', chipType: 'BenchBoost' },
  { name: 'Triple Captain', icon: 'trophy-outline', chipType: 'TripleCaptain' },
  { name: 'Wildcard', icon: 'shuffle-outline', chipType: 'Wildcard' },
  { name: 'Free Hit', icon: 'flash-outline', chipType: 'FreeHit' },
];

const POSITION_ORDER = ['GK', 'DEF', 'MID', 'FWD'] as const;

function MyTeamScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<GamesStackParamList>>();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const team = useFantasyStore((s) => s.team);
  const hasSquad = useFantasyStore((s) => s.hasSquad);
  const setFormation = useFantasyStore((s) => s.setFormation);
  const [viewMode, setViewMode] = useState<ViewMode>('pitch');
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [formationMsg, setFormationMsg] = useState<string | null>(null);
  // The real current gameweek, fetched from the backend - id is needed for
  // chip activation, number is shown in the header. This used to be a
  // useState(1) local counter with +/- chevrons that never reflected real
  // data (always started at "Gameweek 1" regardless of the actual season),
  // which is what those chevrons did nothing but toggle.
  const [currentGameweekId, setCurrentGameweekId] = useState<number | null>(null);
  const [currentGameweekNumber, setCurrentGameweekNumber] = useState<number | null>(null);
  // player.clubId is the backend's real club id - resolve to the local club
  // (for CLUB_COLORS, which is keyed by local id) via a live-fetched map
  // rather than trusting the id directly, since the two club lists don't
  // share ids (see backendClubMap.ts).
  const [clubsById, setClubsById] = useState<Record<number, RealClub>>({});
  // Club badges/colors are fetched separately from the team itself and
  // PitchView used to render immediately with clubsById still {} - every
  // jersey briefly showed fallback/neutral styling and then "popped" into
  // its real club colors a moment later. Gating the pitch render on this
  // (below) instead shows one loading spinner and then the finished view.
  const [clubsLoading, setClubsLoading] = useState(true);
  // Two-tap swap flow: tap a starter or a bench player to select it, then
  // tap the other side to swap them. Tracks player.id (not
  // fantasyTeamPlayerId) since that's what PlayerChip/PitchView key on.
  const [swapSourceId, setSwapSourceId] = useState<number | null>(null);
  const [swapping, setSwapping] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchClubsById(controller.signal)
      .then((byId) => setClubsById(byId))
      .catch(() => { /* falls back to a neutral color below */ })
      .finally(() => setClubsLoading(false));
    return () => controller.abort();
  }, []);

  // `silent` skips the blocking spinner/error UI - used when the store
  // already has a team to show (e.g. right after Confirm Squad, or just
  // revisiting this tab) so a background refresh doesn't blank the screen
  // out to "Loading your squad..." and then flash the pitch view back in a
  // moment later. Only a genuinely empty store (no team cached at all) gets
  // the full blocking loader.
  const handleFetchTeam = useCallback(async (silent = false) => {
    if (!silent) {
      setFetching(true);
      setFetchError(null);
    }
    try {
      const data = await fantasyService.getMyTeam();
      useFantasyStore.setState({ team: data, hasSquad: data !== null });
    } catch (err) {
      if (!silent) {
        setFetchError(err instanceof Error ? err.message : 'Failed to load team data');
      }
    } finally {
      if (!silent) setFetching(false);
    }
  }, []);

  useEffect(() => {
    const alreadyHaveTeam = useFantasyStore.getState().team != null;
    handleFetchTeam(alreadyHaveTeam);
    fantasyService.getCurrentGameweek()
      .then((gw) => {
        setCurrentGameweekId(gw?.gameweekId ?? null);
        setCurrentGameweekNumber(gw?.gameweekNumber ?? null);
      })
      .catch(() => {
        setCurrentGameweekId(null);
        setCurrentGameweekNumber(null);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleFetchTeam]);

  const handleFormationPress = useCallback(
    (target: FormationKey) => {
      setFormationMsg(null);
      if (!team) return;

      const startingPlayers = team.players.filter((p) =>
        team.startingPlayerIds.includes(p.id)
      );
      const result = canApplyFormation(target, startingPlayers);
      if (result.valid) {
        setFormation(target);
      } else {
        setFormationMsg(result.message ?? null);
      }
    },
    [team, setFormation]
  );

  // Promotes a player to captain or vice-captain. The backend already
  // handles unsetting whoever held the armband before, rejects players not
  // in the starting XI, and rejects a captain/vice-captain overlap (e.g. you
  // must reassign the vice-captaincy elsewhere before promoting them to
  // captain) - surface whatever message it sends back rather than trying to
  // duplicate that logic here.
  const handleSetRole = useCallback(
    (player: FantasyPlayer, role: 'captain' | 'vice') => {
      setSwapping(true);
      const call =
        role === 'captain'
          ? fantasyService.setCaptain(player.fantasyTeamPlayerId)
          : fantasyService.setViceCaptain(player.fantasyTeamPlayerId);
      call
        .then(() => handleFetchTeam())
        .catch((err) => {
          Alert.alert('Cannot update', getApiErrorMessage(err, 'Failed to update captain'));
        })
        .finally(() => setSwapping(false));
    },
    [handleFetchTeam]
  );

  const showPlayerOptions = useCallback(
    (player: FantasyPlayer) => {
      const isCaptain = player.id === team?.captainId;
      const isVice = player.id === team?.viceCaptainId;
      const buttons: { text: string; style?: 'cancel' | 'destructive'; onPress?: () => void }[] = [];
      if (!isCaptain) {
        buttons.push({ text: 'Make Captain', onPress: () => handleSetRole(player, 'captain') });
      }
      if (!isVice) {
        buttons.push({ text: 'Make Vice-Captain', onPress: () => handleSetRole(player, 'vice') });
      }
      buttons.push({ text: 'Swap with Bench', onPress: () => setSwapSourceId(player.id) });
      buttons.push({ text: 'View Details', onPress: () => navigation.navigate('PlayerDetails', { playerId: player.id }) });
      buttons.push({ text: 'Cancel', style: 'cancel' });
      Alert.alert(
        player.name,
        isCaptain ? 'Currently your captain' : isVice ? 'Currently your vice-captain' : undefined,
        buttons
      );
    },
    [team, handleSetRole, navigation]
  );

  // Swaps one starter for one bench player. The min/max-per-position rules
  // (GK-for-GK only, DEF/MID/FWD floors) are enforced server-side by the
  // /squad/{a}/{b}/toggle-bench endpoint - a straight one-for-one swap also
  // keeps the total starters at 11 and the formation shape intact by
  // construction, so there's nothing extra to validate client-side beyond
  // "one side must be starting and the other benched".
  const handlePlayerTap = useCallback(
    (player: FantasyPlayer) => {
      if (!team) return;
      if (team.isLocked) {
        Alert.alert('Team locked', "Your lineup is locked for this gameweek and can't be changed.");
        return;
      }
      if (swapSourceId === player.id) {
        setSwapSourceId(null);
        return;
      }
      if (swapSourceId == null) {
        const isStarter = (team.startingPlayerIds || []).includes(player.id);
        if (isStarter) {
          // Starters get a menu (captain / vice-captain / swap out) instead
          // of immediately entering swap-selection mode, since tapping a
          // starter is now also how you reassign the armband.
          showPlayerOptions(player);
        } else {
          setSwapSourceId(player.id);
        }
        return;
      }
      const source = team.players.find((p) => p.id === swapSourceId);
      if (!source) {
        setSwapSourceId(player.id);
        return;
      }
      const starting = team.startingPlayerIds || [];
      const sourceIsStarting = starting.includes(source.id);
      const targetIsStarting = starting.includes(player.id);
      if (sourceIsStarting === targetIsStarting) {
        Alert.alert('Pick one starter and one bench player', 'Select a Starting XI player and a bench player to swap them.');
        setSwapSourceId(player.id);
        return;
      }
      const startingPlayer = sourceIsStarting ? source : player;
      const benchPlayer = sourceIsStarting ? player : source;
      setSwapSourceId(null);
      setSwapping(true);
      fantasyService
        .swapStartingAndBenchPlayer(startingPlayer.fantasyTeamPlayerId, benchPlayer.fantasyTeamPlayerId)
        .then(() => handleFetchTeam())
        .catch((err) => {
          Alert.alert('Cannot swap', getApiErrorMessage(err, 'Failed to swap players'));
        })
        .finally(() => setSwapping(false));
    },
    [team, swapSourceId, handleFetchTeam, showPlayerOptions]
  );

  // Once a team is created there was previously no way to undo it -
  // createFantasyTeam 409s ("You already have a fantasy team") on any
  // second attempt, permanently blocking a rebuild. This wipes the team
  // (and its squad/transfers/chips) server-side and drops the user back on
  // the Squad Builder.
  const handleDeleteTeam = useCallback(() => {
    // No spinner previously shown while the DELETE call was in flight (which
    // can take a while on a cold backend), so the button stayed tappable and
    // a second tap could fire a second delete against an already-deleted
    // team. Guard + a visible "Deleting..." state fix both.
    if (deleting) return;
    Alert.alert(
      'Delete this team?',
      'This permanently removes your squad, transfers, and chip usage so you can build a new one. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await fantasyService.deleteMyTeam();
              useFantasyStore.setState({ team: null, hasSquad: false });
              useFantasyStore.getState().resetDraft();
              navigation.navigate('GamesRoot', { defaultTab: 'fantasy' });
            } catch (err) {
              Alert.alert('Could not delete team', getApiErrorMessage(err, 'Failed to delete team'));
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }, [navigation, deleting]);

  if (fetching) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.yellow} />
          <Text style={styles.emptySub}>Loading your squad...</Text>
        </View>
      </View>
    );
  }

  if (fetchError) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptySub}>{fetchError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => handleFetchTeam()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!hasSquad || !team) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centered}>
          <Ionicons name="football-outline" size={64} color={colors.grey2} />
          <Text style={styles.emptyTitle}>No Squad Yet</Text>
          <Text style={styles.emptySub}>Build your fantasy team to see it here.</Text>
        </View>
      </View>
    );
  }

  // Club badges/colors feed straight into PitchView's jersey rendering -
  // wait for them so the pitch appears fully styled the first time instead
  // of painting once with fallback colors and again a moment later once
  // clubsById arrives.
  if (clubsLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.yellow} />
          <Text style={styles.emptySub}>Loading your squad...</Text>
        </View>
      </View>
    );
  }

  const formation = team.formation || '4-3-3';
  const startingPlayerIds = team.startingPlayerIds || [];
  const captainId = team.captainId;
  const viceCaptainId = team.viceCaptainId ?? null;
  const totalPoints = team.totalPoints || 0;
  const freeTransfers = team.freeTransfers ?? 0;

  const benchPlayers = team.players.filter((p: FantasyPlayer) => !startingPlayerIds.includes(p.id));

  const groupedList = POSITION_ORDER.map((pos) => ({
    position: pos,
    label: pos === 'GK' ? 'Goalkeeper' : pos === 'DEF' ? 'Defenders' : pos === 'MID' ? 'Midfielders' : 'Forwards',
    color: pos === 'GK' ? colors.roleGk : pos === 'DEF' ? colors.roleDef : pos === 'MID' ? colors.roleMid : colors.roleFwd,
    items: team.players.filter((p: FantasyPlayer) => p.position === pos),
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: getScrollBottomPadding(insets.bottom) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Text style={styles.headerTitle}>{team.teamName}</Text>
            <TouchableOpacity
              onPress={handleDeleteTeam}
              disabled={deleting}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.deleteTeamButton}
            >
              {deleting ? (
                <ActivityIndicator size="small" color={colors.grey2} />
              ) : (
                <Ionicons name="trash-outline" size={16} color={colors.grey2} />
              )}
              <Text style={styles.deleteTeamText}>{deleting ? 'Deleting...' : 'Delete Team'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{totalPoints}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                GH₵{team.budget.toFixed(1)}m
              </Text>
              <Text style={styles.statLabel}>Budget Remaining</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{freeTransfers}</Text>
              <Text style={styles.statLabel}>Free Transfers</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.transfersButton}
            onPress={() => navigation.navigate('Transfers')}
          >
            <Ionicons name="swap-horizontal" size={16} color={colors.black} />
            <Text style={styles.transfersButtonText}>Transfers</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gameweekBar}>
          <Text style={styles.gameweekLabel}>
            {currentGameweekNumber != null ? `Gameweek ${currentGameweekNumber}` : 'Gameweek —'}
          </Text>
        </View>

        <View style={styles.chipStrip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipStripContent}>
            {CHIPS.map((chip) => {
              const chipKey = (chip.chipType.charAt(0).toLowerCase() + chip.chipType.slice(1)) as keyof ChipStatus;
              const used = team.chips?.[chipKey] ?? false;
              // A different chip is already active for this gameweek - only
              // one can be played per gameweek, so lock the rest until the
              // gameweek transitions (team.activeChipKey clears then).
              const locked = !used && !!team.activeChipKey && team.activeChipKey !== chipKey;
              return (
                <ChipCard
                  key={chip.name}
                  name={chip.name}
                  icon={chip.icon}
                  used={used}
                  locked={locked}
                  chipType={chip.chipType}
                  fantasyTeamId={team.teamId}
                  gameweekId={currentGameweekId}
                  onActivated={() => handleFetchTeam()}
                />
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.toggleRow}>
          <SegmentedControl<ViewMode>
            options={[
              { key: 'pitch', label: 'Pitch' },
              { key: 'list', label: 'List' },
            ]}
            selected={viewMode}
            onSelect={setViewMode}
          />
        </View>

        <Text style={styles.currentFormationLabel}>
          Current shape: {formation}
          {!(formation in FORMATIONS) ? ' (not a preset - tap one below to try switching)' : ''}
        </Text>
        <View style={styles.formationRow}>
          {(Object.keys(FORMATIONS) as FormationKey[]).map((key) => {
            const active = formation === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.formationChip, active && styles.formationChipActive]}
                onPress={() => handleFormationPress(key)}
              >
                <Text style={[styles.formationChipText, active && styles.formationChipTextActive]}>
                  {key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {formationMsg ? (
          <View style={styles.formationMsgWrap}>
            <Text style={styles.formationMsgText}>{formationMsg}</Text>
          </View>
        ) : null}

        {viewMode === 'pitch' ? (
          <View style={styles.pitchSection}>
            <Text style={styles.swapHint}>
              {swapping
                ? 'Updating your team...'
                : swapSourceId != null
                ? 'Now tap a player on the other side to swap.'
                : 'Tap a starter for captain/vice-captain options, or tap a bench player to swap them in.'}
            </Text>
            <PitchView
              players={team.players}
              startingPlayerIds={startingPlayerIds}
              captainId={captainId}
              viceCaptainId={viceCaptainId}
              formation={formation}
              showBench
              onPlayerPress={handlePlayerTap}
              selectedPlayerId={swapSourceId}
              clubsById={clubsById}
            />
          </View>
        ) : (
          <View style={styles.listSection}>
            {groupedList.map((group) => (
              <View key={group.position} style={styles.groupBlock}>
                <View style={[styles.groupHeader, { borderLeftColor: group.color }]}>
                  <Text style={styles.groupTitle}>{group.label}</Text>
                  <Text style={styles.groupCount}>{group.items.length}</Text>
                </View>
                {group.items.map((player: FantasyPlayer, idx: number) => {
                  const localClub = backendClubIdToLocalClub(player.clubId, clubsById);
                  const clubColor = (localClub ? CLUB_COLORS[localClub.id] : null) || colors.grey2;
                  const isStarter = startingPlayerIds.includes(player.id);
                  return (
                    <View key={player.id} style={[styles.listRow, idx === group.items.length - 1 && styles.listRowLast]}>
                      <View style={[styles.listPosDot, { backgroundColor: clubColor }]} />
                      <Text style={styles.listName}>{player.name}</Text>
                      <View style={styles.listRight}>
                        {player.id === captainId && (
                          <View style={styles.listCaptainBadge}>
                            <Text style={styles.listCaptainText}>C</Text>
                          </View>
                        )}
                        <Text style={[styles.listPrice, !isStarter && styles.listPriceBench]}>
                          GH₵{player.price}m
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default MyTeamScreen;

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontFamily: fonts.display, color: colors.white, marginTop: 16, textTransform: 'uppercase' },
  emptySub: { fontSize: 14, fontFamily: fonts.body, color: colors.grey1, textAlign: 'center', marginTop: 8 },
  header: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 22, fontFamily: fonts.display, color: colors.yellow, textTransform: 'uppercase', letterSpacing: 0.5 },
  deleteTeamButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deleteTeamText: { fontSize: 11, fontFamily: fonts.bodySemiBold, color: colors.grey2 },
  headerStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, rowGap: 8 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontFamily: fonts.display, color: colors.white },
  statLabel: { fontSize: 10, fontFamily: fonts.bodySemiBold, color: colors.grey1, textTransform: 'uppercase', marginTop: 2 },
  transfersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.yellow,
    borderRadius: 10,
    paddingVertical: 10,
  },
  transfersButtonText: { fontSize: 13, fontFamily: fonts.bodySemiBold, color: colors.black, fontWeight: '800' },
  gameweekBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.black,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  gameweekLabel: { fontSize: 14, fontFamily: fonts.display, color: colors.white, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipStrip: { paddingVertical: 12 },
  chipStripContent: { paddingHorizontal: 20, gap: 8 },
  toggleRow: { paddingHorizontal: 20, marginBottom: 16 },
  pitchSection: { paddingHorizontal: 16 },
  swapHint: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.grey1,
    textAlign: 'center',
    marginBottom: 10,
  },
  listSection: { paddingHorizontal: 16, gap: 16 },
  groupBlock: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderLeftWidth: 3,
    backgroundColor: colors.surface2,
  },
  groupTitle: { fontSize: 13, fontFamily: fonts.bodySemiBold, color: colors.white, textTransform: 'uppercase' },
  groupCount: { fontSize: 12, fontFamily: fonts.bodySemiBold, color: colors.grey1 },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listRowLast: { borderBottomWidth: 0 },
  listPosDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  listName: { flex: 1, fontSize: 14, fontFamily: fonts.bodySemiBold, color: colors.white },
  listRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  listCaptainBadge: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.yellow,
    alignItems: 'center', justifyContent: 'center',
  },
  listCaptainText: { fontSize: 10, fontWeight: '900', color: colors.black },
  listPrice: { fontSize: 13, fontFamily: fonts.bodySemiBold, color: colors.white, minWidth: 40, textAlign: 'right' },
  listPriceBench: { color: colors.grey2 },
  retryButton: {
    marginTop: 20,
    backgroundColor: colors.yellow,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
    textTransform: 'uppercase',
  },
  currentFormationLabel: {
    fontSize: 11,
    fontFamily: fonts.body,
    color: colors.grey1,
    textAlign: 'center',
    marginBottom: 8,
  },
  formationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  formationChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formationChipActive: {
    backgroundColor: colors.yellow,
    borderColor: colors.yellow,
  },
  formationChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.grey1,
  },
  formationChipTextActive: {
    color: '#000000',
  },
  formationMsgWrap: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.yellow,
  },
  formationMsgText: {
    fontSize: 12,
    color: colors.yellow,
    lineHeight: 18,
  },
  });
}
