import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions, LayoutChangeEvent } from 'react-native';
import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
import PlayerChip from './PlayerChip';
import type { RealClub } from '../../services/clubService';
import type { FantasyPlayer } from '../../types';

// Must match PlayerChip's base (unscaled) pitch-size wrapper width/gap - a
// row of 5 (e.g. a back five) at full size needs 5*78 + 4*4 = 406px, which
// doesn't fit most phone screens and was spilling chips outside the pitch.
const BASE_CHIP_WIDTH = 78;
const CHIP_GAP = 4;
const MIN_CHIP_SCALE = 0.62;

function scaleForRow(count: number, availableWidth: number): number {
  if (count <= 0 || availableWidth <= 0) return 1;
  const needed = count * BASE_CHIP_WIDTH + (count - 1) * CHIP_GAP;
  if (needed <= availableWidth) return 1;
  return Math.max(MIN_CHIP_SCALE, availableWidth / needed);
}

// Real pitch photo/illustration (already has goal boxes, center circle,
// halfway line, corner arcs drawn in) - replaces the old plain solid-green
// background + hand-drawn markings.
const pitchImage = require('../../assets/onboarding/pitch.jpeg');

interface PitchViewProps {
  players: FantasyPlayer[];
  startingPlayerIds: number[];
  captainId: number | null;
  viceCaptainId?: number | null;
  formation: string;
  /** When true, renders a smaller bench row below the pitch. Default false.
   *  NOTE: This bench row is exclusive to the read-only MyTeam screen.
   *  The draft flow (FantasyRoot / LineupStep) does not use this prop,
   *  so setting it here is safe and won't affect squad builder behaviour. */
  showBench?: boolean;
  /** When provided, both the starting-XI chips and the bench chips become
   *  tappable (used by MyTeamScreen's swap-a-starter-with-a-bench-player
   *  flow). Omit to keep the pitch read-only. */
  onPlayerPress?: (player: FantasyPlayer) => void;
  /** fantasyTeamPlayerId of the chip currently selected for a swap. */
  selectedPlayerId?: number | null;
  /** Real-id -> RealClub map (from fetchClubsById()), forwarded to every
   *  PlayerChip so it can resolve player.clubId to a local club id for club
   *  colors and real jersey images. Optional - chips degrade gracefully
   *  (neutral color, generated jersey icon) without it. */
  clubsById?: Record<number, RealClub>;
}

type PositionGroup = 'GK' | 'DEF' | 'MID' | 'FWD';

const GROUP_LABELS: Record<PositionGroup, string> = {
  GK: 'GK',
  DEF: 'DEF',
  MID: 'MID',
  FWD: 'FWD',
};

export default function PitchView({
  players,
  startingPlayerIds,
  captainId,
  viceCaptainId = null,
  formation,
  showBench = false,
  onPlayerPress,
  selectedPlayerId = null,
  clubsById,
}: PitchViewProps) {
  // Sort by id so each player has a fixed slot within their position row -
  // without this, a re-fetch after any update (setCaptain, a swap, etc.)
  // could come back with rows in a different order and make players appear
  // to "jump" to a different spot on the pitch even though nobody's
  // position/starting status actually changed.
  const byIdStable = (a: FantasyPlayer, b: FantasyPlayer) => a.id - b.id;
  const startingPlayers = players.filter((p) => startingPlayerIds.includes(p.id)).sort(byIdStable);
  const benchPlayers = players.filter((p) => !startingPlayerIds.includes(p.id)).sort(byIdStable);

  const grouped = (['GK', 'DEF', 'MID', 'FWD'] as PositionGroup[]).map((pos) => ({
    position: pos,
    items: startingPlayers.filter((p) => p.position === pos),
  }));

  // Seeded with a screen-width estimate (minus this component's typical
  // outer padding) so the very first render is already close to correct -
  // onLayout below then corrects it to the exact measured width. Every row
  // shares one scale (driven by whichever row has the most players) rather
  // than each row picking its own, so chips look consistent size across the
  // whole pitch instead of the back line suddenly looking smaller than the
  // attack.
  const [fieldWidth, setFieldWidth] = useState(() => Dimensions.get('window').width - 32);
  const onRowsLayout = (e: LayoutChangeEvent) => setFieldWidth(e.nativeEvent.layout.width);
  const contentWidth = fieldWidth - styles.rowsContainer.paddingHorizontal * 2;
  const widestRow = Math.max(1, ...grouped.map((g) => g.items.length));
  const chipScale = scaleForRow(widestRow, contentWidth);

  // `formation` is only ever a display label here (e.g. for highlighting a
  // preset formation button elsewhere) - the pitch itself is built purely
  // from the actual starting XI's positions, so a composition that doesn't
  // match one of the 5 named presets (e.g. 5-3-2) still renders correctly
  // instead of hitting an "Unknown formation" dead end.

  return (
    <View style={styles.outterWrap}>
      <ImageBackground
        source={pitchImage}
        style={styles.pitch}
        imageStyle={styles.pitchImage}
        resizeMode="cover"
      >
        <View style={styles.rowsContainer} onLayout={onRowsLayout}>
          {grouped.map((group) => {
            if (group.items.length === 0) return null;
            return (
              <View key={group.position} style={styles.row}>
                <Text style={styles.rowLabel}>{GROUP_LABELS[group.position]}</Text>
                <View style={styles.chipsRow}>
                  {group.items.map((player) => (
                    <PlayerChip
                      key={player.id}
                      player={player}
                      isCaptain={player.id === captainId}
                      isViceCaptain={player.id === viceCaptainId}
                      size="pitch"
                      onPress={onPlayerPress ? () => onPlayerPress(player) : undefined}
                      selected={selectedPlayerId === player.id}
                      scale={chipScale}
                      clubsById={clubsById}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </ImageBackground>

      {showBench && benchPlayers.length > 0 && (
        <View style={styles.benchSection}>
          <Text style={styles.benchLabel}>BENCH</Text>
          <View style={styles.benchRow}>
            {benchPlayers.map((player) => (
              <PlayerChip
                key={player.id}
                player={player}
                isCaptain={player.id === captainId}
                isViceCaptain={player.id === viceCaptainId}
                size="bench"
                onPress={onPlayerPress ? () => onPlayerPress(player) : undefined}
                selected={selectedPlayerId === player.id}
                clubsById={clubsById}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outterWrap: {
    gap: 12,
  },
  pitch: {
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: Colors.pitchGrass,
    minHeight: 340,
    position: 'relative',
  },
  // The image itself already has goal boxes/center circle/halfway line/
  // corner arcs drawn in, so it replaces the old hand-drawn marking Views
  // entirely rather than sitting underneath them.
  pitchImage: {
    borderRadius: radius.card,
  },
  rowsContainer: {
    paddingVertical: 20,
    paddingHorizontal: 8,
    gap: 16,
  },
  row: {
    gap: 6,
  },
  rowLabel: {
    fontSize: 10,
    fontFamily: fonts.bodySemiBold,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  errorText: {
    color: Colors.red,
    fontFamily: fonts.body,
    textAlign: 'center',
    padding: 40,
  },
  benchSection: {
    backgroundColor: Colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  benchLabel: {
    fontSize: 10,
    fontFamily: fonts.bodySemiBold,
    color: Colors.grey2,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  benchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
});
