import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import { Colors } from '../../constants/colors';
import { fonts } from '../../constants/layout';
import FantasyRoot from '../fantasy/FantasyRoot';
import PredictRoot from '../predict/PredictRoot';
import { useTheme } from '../../context/ThemeContext';
import type { GamesStackParamList } from '../../navigation/GamesStack';

type GamesTab = 'fantasy' | 'predictions';
type GamesRootRouteProp = RouteProp<GamesStackParamList, 'GamesRoot'>;

export default function GamesRoot() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const route = useRoute<GamesRootRouteProp>();
  const defaultTab = route.params?.defaultTab;
  const [activeTab, setActiveTab] = useState<GamesTab>(defaultTab || 'fantasy');

  useEffect(() => {
    if (defaultTab === 'fantasy' || defaultTab === 'predictions') {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  return (
    <View style={styles.container}>
      <View style={[styles.toggleContainer, { paddingTop: insets.top + 14 }]}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'fantasy' && styles.tabActive]}
            onPress={() => setActiveTab('fantasy')}
          >
            <Text style={[styles.tabText, activeTab === 'fantasy' && styles.tabTextActive]}>
              Fantasy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'predictions' && styles.tabActive]}
            onPress={() => setActiveTab('predictions')}
          >
            <Text style={[styles.tabText, activeTab === 'predictions' && styles.tabTextActive]}>
              Predictions
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.content}>
        {activeTab === 'fantasy' ? <FantasyRoot /> : <PredictRoot />}
      </View>
    </View>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.black,
    },
    toggleContainer: {
      paddingHorizontal: 20,
      paddingBottom: 8,
    },
    tabRow: {
      flexDirection: 'row',
      borderRadius: 10,
      backgroundColor: colors.surface2,
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
      backgroundColor: colors.yellow,
    },
    tabText: {
      fontSize: 13,
      fontWeight: '700',
      fontFamily: fonts.display,
      color: colors.grey1,
      textTransform: 'uppercase',
      letterSpacing: 0.06,
    },
    tabTextActive: {
      color: '#000000',
    },
    content: {
      flex: 1,
    },
  });
}
