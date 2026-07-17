import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
import { FORMATIONS } from '../../store/fantasyStore';
import PlayerChip from './PlayerChip';
import type { FantasyPlayer, FormationKey } from '../../types';

interface PitchViewProps {
  players: FantasyPlayer[];
  startingPlayerIds: string[];
  captainId: string | null;
  viceCaptainId?: string | null;
  formation: FormationKey;
  /** When true, renders a smaller bench row below the pitch. Default false.
   *  NOTE: This bench row is exclusive to the read-only MyTeam screen.
   *  The draft flow (FantasyRoot / LineupStep) does not use this prop,
   *  so setting it here is safe and won't affect squad builder behaviour. */
  showBench?: boolean;
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
}: PitchViewProps) {
  const formationDef = FORMATIONS[formation];
  const startingPlayers = players.filter((p) => startingPlayerIds.includes(p.id));
  const benchPlayers = players.filter((p) => !startingPlayerIds.includes(p.id));

  const grouped = (['GK', 'DEF', 'MID', 'FWD'] as PositionGroup[]).map((pos) => ({
    position: pos,
    items: startingPlayers.filter((p) => p.position === pos),
  }));

  if (!formationDef) {
    return (
      <View style={styles.pitch}>
        <Text style={styles.errorText}>Unknown formation: {formation}</Text>
      </View>
    );
  }

  return (
    <View style={styles.outterWrap}>
      <View style={styles.pitch}>
        <View style={styles.fieldMarkings}>
          <View style={styles.centerCircle} />
          <View style={styles.halfwayLine} />
        </View>
        <View style={styles.rowsContainer}>
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
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </View>

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
  fieldMarkings: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  halfwayLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: '50%',
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
