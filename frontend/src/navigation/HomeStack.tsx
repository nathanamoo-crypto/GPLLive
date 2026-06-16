import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/home/HomeScreen';
import NotificationInboxScreen from '../screens/home/NotificationInboxScreen';
import MatchDetailsScreen from '../screens/match/MatchDetailsScreen';
import NewsDetailScreen from '../screens/news/NewsDetailScreen';
import type { MatchDetailsParams, NewsDetailParams } from './types';

export type HomeStackParamList = {
  HomeFeed: undefined;
  NotificationInbox: undefined;
  MatchDetails: MatchDetailsParams;
  NewsDetail: NewsDetailParams;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeFeed" component={HomeScreen} />
      <Stack.Screen name="NotificationInbox" component={NotificationInboxScreen} />
      <Stack.Screen name="MatchDetails" component={MatchDetailsScreen} />
      <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
    </Stack.Navigator>
  );
}
