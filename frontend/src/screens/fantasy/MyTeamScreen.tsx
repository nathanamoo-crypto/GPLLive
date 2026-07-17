import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { fonts, radius, getScrollBottomPadding } from '../../constants/layout';
import { CLUB_COLORS } from '../../constants/clubs';
import { useFantasyStore } from '../../store/fantasyStore';
import SegmentedControl from '../../components/shared/SegmentedControl';
import PitchView from '../../components/fantasy/PitchView';
import ChipCard from '../../components/fantasy/ChipCard';
import type { FantasyPlayer } from '../../types';

type ViewMode = 'pitch' | 'list';

const CHIPS = [
  { name: 'Bench Boost', icon: 'rocket-outline' as const },
  { name: 'Triple Captain', icon: 'trophy-outline' as const },
  { name: 'Wildcard', icon: 'shuffle-outline' as const },
  { name: 'Free Hit', icon: 'flash-outline' as const },
];

const POSITION_ORDER = ['GK', 'DEF', 'MID', 'FWD'] as const;

function MyTeamScreen() {
  const insets = useSafeAreaInsets();
  const team = useFantasyStore((s) => s.team);
  const hasSquad = useFantasyStore((s) => s.hasSquad);
  const [gameweek, setGameweek] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('pitch');

  if (!hasSquad || !team) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centered}>
          <Ionicons name="football-outline" size={64} color={Colors.grey2} />
          <Text style={styles.emptyTitle}>No Squad Yet</Text>
          <Text style={styles.emptySub}>Build your fantasy team to see it here.</Text>
        </View>
      </View>
    );
  }

  const formation = team.formation || '4-3-3';
  const startingPlayerIds = team.startingPlayerIds || [];
  const captainId = team.captainId;
  const viceCaptainId = team.viceCaptainId || null;
  const weekPoints = team.weekPoints || 0;
  const totalPoints = team.totalPoints || 0;
  const overallRank = team.overallRank || 0;

  const benchPlayers = team.players.filter((p: FantasyPlayer) => !startingPlayerIds.includes(p.id));

  const groupedList = POSITION_ORDER.map((pos) => ({
    position: pos,
    label: pos === 'GK' ? 'Goalkeeper' : pos === 'DEF' ? 'Defenders' : pos === 'MID' ? 'Midfielders' : 'Forwards',
    color: pos === 'GK' ? Colors.roleGk : pos === 'DEF' ? Colors.roleDef : pos === 'MID' ? Colors.roleMid : Colors.roleFwd,
    items: team.players.filter((p: FantasyPlayer) => p.position === pos),
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: getScrollBottomPadding(insets.bottom) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{team.teamName}</Text>
          <View style={styles.headerStats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{totalPoints}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{weekPoints}</Text>
              <Text style={styles.statLabel}>GW {gameweek}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{overallRank}</Text>
              <Text style={styles.statLabel}>Rank</Text>
            </View>
          </View>
        </View>

        <View style={styles.gameweekBar}>
          <TouchableOpacity
            onPress={() => setGameweek((g) => Math.max(1, g - 1))}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.yellow} />
          </TouchableOpacity>
          <Text style={styles.gameweekLabel}>Gameweek {gameweek}</Text>
          <TouchableOpacity
            onPress={() => setGameweek((g) => g + 1)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-forward" size={20} color={Colors.yellow} />
          </TouchableOpacity>
        </View>

        <View style={styles.chipStrip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipStripContent}>
            {CHIPS.map((chip) => (
              <ChipCard key={chip.name} name={chip.name} icon={chip.icon} />
            ))}
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

        {viewMode === 'pitch' ? (
          <View style={styles.pitchSection}>
            <PitchView
              players={team.players}
              startingPlayerIds={startingPlayerIds}
              captainId={captainId}
              viceCaptainId={viceCaptainId}
              formation={formation}
              showBench
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
                  const clubColor = CLUB_COLORS[player.clubId] || Colors.grey2;
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
                          ${player.price}m
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontFamily: fonts.display, color: Colors.white, marginTop: 16, textTransform: 'uppercase' },
  emptySub: { fontSize: 14, fontFamily: fonts.body, color: Colors.grey1, textAlign: 'center', marginTop: 8 },
  header: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  headerTitle: { fontSize: 22, fontFamily: fonts.display, color: Colors.yellow, textTransform: 'uppercase', letterSpacing: 0.5 },
  headerStats: { flexDirection: 'row', gap: 16 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontFamily: fonts.display, color: Colors.white },
  statLabel: { fontSize: 10, fontFamily: fonts.bodySemiBold, color: Colors.grey1, textTransform: 'uppercase', marginTop: 2 },
  gameweekBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.black,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  gameweekLabel: { fontSize: 14, fontFamily: fonts.display, color: Colors.white, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipStrip: { paddingVertical: 12 },
  chipStripContent: { paddingHorizontal: 20, gap: 8 },
  toggleRow: { paddingHorizontal: 20, marginBottom: 16 },
  pitchSection: { paddingHorizontal: 16 },
  listSection: { paddingHorizontal: 16, gap: 16 },
  groupBlock: {
    backgroundColor: Colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderLeftWidth: 3,
    backgroundColor: Colors.surface2,
  },
  groupTitle: { fontSize: 13, fontFamily: fonts.bodySemiBold, color: Colors.white, textTransform: 'uppercase' },
  groupCount: { fontSize: 12, fontFamily: fonts.bodySemiBold, color: Colors.grey1 },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listRowLast: { borderBottomWidth: 0 },
  listPosDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  listName: { flex: 1, fontSize: 14, fontFamily: fonts.bodySemiBold, color: Colors.white },
  listRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  listCaptainBadge: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.yellow,
    alignItems: 'center', justifyContent: 'center',
  },
  listCaptainText: { fontSize: 10, fontWeight: '900', color: Colors.black },
  listPrice: { fontSize: 13, fontFamily: fonts.bodySemiBold, color: Colors.white, minWidth: 40, textAlign: 'right' },
  listPriceBench: { color: Colors.grey2 },
});
