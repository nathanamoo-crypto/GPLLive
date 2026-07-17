import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';

interface ChipCardProps {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  available?: boolean;
}

export default function ChipCard({ name, icon, available = false }: ChipCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => {
        // TODO: wire chip activation
      }}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={20} color={Colors.yellow} />
      </View>
      <Text style={styles.name} numberOfLines={1}>{name}</Text>
      <View style={[styles.pill, available ? styles.pillAvailable : styles.pillUnavailable]}>
        <Text style={[styles.pillText, available ? styles.pillTextAvailable : styles.pillTextUnavailable]}>
          {available ? 'Play' : 'Unavailable'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 80,
    backgroundColor: Colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 6,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 10,
    fontFamily: fonts.bodySemiBold,
    color: Colors.white,
    textAlign: 'center',
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  pillAvailable: {
    borderColor: Colors.yellow,
  },
  pillUnavailable: {
    borderColor: Colors.grey2,
  },
  pillText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: fonts.bodySemiBold,
  },
  pillTextAvailable: {
    color: Colors.yellow,
  },
  pillTextUnavailable: {
    color: Colors.grey2,
  },
});
