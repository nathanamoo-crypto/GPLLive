import React from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeStack from './HomeStack';
import GamesStack from './GamesStack';
import TableStack from './TableStack';
import NewsStack from './NewsStack';
import FixturesStack from './FixturesStack';
import ProfileStack from './ProfileStack';
import { useMatches } from '../hooks/useMatches';
import { Colors } from '../constants/colors';

export type MainTabParamList = {
  Home: undefined;
  Games: undefined;
  Table: undefined;
  News: undefined;
  Fixtures: undefined;
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
        tabBarStyle: [styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }],
        tabBarActiveTintColor: '#F5C518',
        tabBarInactiveTintColor: '#4B5563',
        tabBarLabelStyle: styles.tabBarLabel,
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
        name="Table"
        component={TableStack}
        options={{
          tabBarLabel: 'Table',
          tabBarIcon: ({ color, size }) => <Ionicons name="trophy" size={size || 24} color={color} />,
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
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginTop: 2,
  },
  liveBadge: {
    backgroundColor: '#D0021B',
    minWidth: 8,
    height: 8,
    borderRadius: 4,
    padding: 0,
  },
});
