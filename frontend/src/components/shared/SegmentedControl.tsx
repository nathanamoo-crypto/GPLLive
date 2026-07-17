import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { fonts } from '../../constants/layout';

interface SegmentedControlProps<T extends string> {
  options: { key: T; label: string }[];
  selected: T;
  onSelect: (key: T) => void;
}

export default function SegmentedControl<T extends string>({
  options,
  selected,
  onSelect,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const isActive = opt.key === selected;
        return (
          <TouchableOpacity
            key={opt.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onSelect(opt.key)}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: Colors.surface2,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: Colors.yellow,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: fonts.display,
    color: Colors.grey1,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
  },
  tabTextActive: {
    color: '#000000',
  },
});
