import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeStack from './HomeStack';
import FantasyStack from './FantasyStack';
import PredictStack from './PredictStack';
import NewsStack from './NewsStack';
import FixturesStack from './FixturesStack';
import ProfileStack from './ProfileStack';
import { useMatches } from '../hooks/useMatches';
import { Colors } from '../constants/colors';
import { getTabBarBottomPadding, getTabBarHeight, TAB_BAR_TOP_PADDING } from '../constants/layout';

export type MainTabParamList = {
  Home: undefined;
  Fantasy: undefined;
  Predict: undefined;
  News: undefined;
  Fixtures: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const matches = useMatches();
  const hasLiveMatch = matches.some((match) => match.status === 'live');
  const insets = useSafeAreaInsets();
  const tabBarBottomPadding = getTabBarBottomPadding(insets.bottom);
  const tabBarHeight = getTabBarHeight(insets.bottom);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabBarHeight,
            paddingBottom: tabBarBottomPadding,
            paddingTop: TAB_BAR_TOP_PADDING,
          },
        ],
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
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
        name="Fantasy"
        component={FantasyStack}
        options={{
          tabBarLabel: 'Fantasy',
          tabBarIcon: ({ color, size }) => <Ionicons name="trophy" size={size || 24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Predict"
        component={PredictStack}
        options={{
          tabBarLabel: 'Predict',
          tabBarIcon: ({ color, size }) => <Ionicons name="checkbox" size={size || 24} color={color} />,
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
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  liveBadge: {
    backgroundColor: Colors.live,
    minWidth: 8,
    height: 8,
    borderRadius: 4,
    padding: 0,
  },
});
