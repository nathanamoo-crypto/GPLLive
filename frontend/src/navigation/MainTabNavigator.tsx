import React from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeStack from './HomeStack';
import GamesStack from './GamesStack';
import NewsStack from './NewsStack';
import FixturesStack from './FixturesStack';
import ProfileStack from './ProfileStack';
import { useMatches } from '../hooks/useMatches';
import { Colors } from '../constants/colors';

// 'Table' used to be its own bottom tab, but FixturesRoot already has a
// built-in Fixtures/Table toggle at the top of the screen (same pattern as
// Games' Fantasy/Predictions toggle) - having both was redundant and made
// the tab bar cramped at 6 items. Dropped to 5; League Table is still one
// tap away via Fixtures (or the Profile menu, which deep-links straight
// into the Table side).
export type MainTabParamList = {
  Home: undefined;
  Games: undefined;
  News: undefined;
  Fixtures: { screen: 'FixturesRoot'; params?: { defaultTab?: 'fixtures' | 'table' } } | undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const matches = useMatches();
  const hasLiveMatch = matches.some((match) => match.status === 'live');

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        // Base content height (icon + label + breathing room) stays fixed;
        // the device's safe-area inset is added ON TOP of that instead of
        // eaten out of a fixed total height. The previous fixed height=60
        // with insets.bottom squeezed into its paddingBottom meant the
        // label text got compressed/clipped on any phone with a tall
        // bottom safe area (basically every modern iPhone/Android with a
        // gesture bar) - this is why the labels were hard to read.
        tabBarStyle: [
          styles.tabBar,
          { height: 56 + insets.bottom, paddingBottom: insets.bottom + 6 },
        ],
        tabBarActiveTintColor: '#F5C518',
        tabBarInactiveTintColor: '#4B5563',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarAllowFontScaling: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size || 24} color={color} />,
          tabBarBadge: hasLiveMatch ? '' : undefined,
          tabBarBadgeStyle: styles.liveBadge,
        }}
      />
      <Tab.Screen
        name="Games"
        component={GamesStack}
        options={{
          tabBarLabel: 'Games',
          tabBarIcon: ({ color, size }) => <Ionicons name="game-controller" size={size || 24} color={color} />,
        }}
      />
      <Tab.Screen
        name="News"
        component={NewsStack}
        options={{
          tabBarLabel: 'News',
          tabBarIcon: ({ color, size }) => <Ionicons name="newspaper" size={size || 24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Fixtures"
        component={FixturesStack}
        options={{
          tabBarLabel: 'Fixtures',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size || 24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size || 24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#111111',
    borderTopColor: '#2A2A2A',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  tabBarItem: {
    // Explicit space for icon + label so the label never gets squeezed
    // out regardless of screen width - 5 tabs across even a 375pt-wide
    // phone still leaves enough room per item at this size.
    paddingVertical: 2,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginTop: 3,
    includeFontPadding: false,
  },
  liveBadge: {
    backgroundColor: '#D0021B',
    minWidth: 8,
    height: 8,
    borderRadius: 4,
    padding: 0,
  },
});
