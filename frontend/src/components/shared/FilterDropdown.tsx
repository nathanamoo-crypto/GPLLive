import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { fonts } from '../../constants/layout';
import { useTheme } from '../../context/ThemeContext';

export interface FilterDropdownOption<T extends string | number> {
  label: string;
  value: T;
}

interface Props<T extends string | number> {
  // Shown as the modal's title, and as the trigger's label when nothing is
  // selected (e.g. an "All ..." option should normally be in `options`
  // instead of relying on this fallback).
  label: string;
  options: FilterDropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: object;
}

// A compact tap-to-open dropdown (trigger button + modal option list) used
// in place of a horizontal row of filter chips, which take up a full row of
// vertical space per filter regardless of how many chips fit. Two of these
// side by side take less height than one chip row did.
export default function FilterDropdown<T extends string | number>({
  label,
  options,
  value,
  onChange,
  style,
}: Props<T>) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <TouchableOpacity style={[styles.trigger, style]} activeOpacity={0.7} onPress={() => setOpen(true)}>
        <Text style={styles.triggerText} numberOfLines={1}>
          {selected?.label ?? label}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.textTertiary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)}>
          {/* Swallows taps so they don't fall through to the backdrop and
              close the modal when tapping inside the panel itself. */}
          <View style={styles.panel} onStartShouldSetResponder={() => true}>
            <Text style={styles.panelTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(o) => String(o.value)}
              style={styles.optionsList}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    style={[styles.option, isSelected && styles.optionActive]}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextActive]} numberOfLines={1}>
                      {item.label}
                    </Text>
                    {isSelected ? <Ionicons name="checkmark" size={18} color={colors.yellow} /> : null}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 40,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    triggerText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textPrimary,
      flexShrink: 1,
      marginRight: 6,
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    panel: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      paddingTop: 16,
      paddingBottom: 24,
      maxHeight: '65%',
      borderTopWidth: 1,
      borderColor: colors.border,
    },
    panelTitle: {
      fontSize: 13,
      fontWeight: '700',
      fontFamily: fonts.display,
      color: colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      paddingHorizontal: 20,
      marginBottom: 8,
    },
    optionsList: { paddingHorizontal: 12 },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 10,
    },
    optionActive: { backgroundColor: colors.background },
    optionText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
    optionTextActive: { color: colors.textPrimary, fontWeight: '800' },
  });
}
