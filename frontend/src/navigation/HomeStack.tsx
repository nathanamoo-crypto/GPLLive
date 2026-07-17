import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/home/HomeScreen';
import NotificationInboxScreen from '../screens/home/NotificationInboxScreen';
import SubscribeScreen from '../screens/home/SubscribeScreen';
import PaymentScreen from '../screens/home/PaymentScreen';
import SearchScreen from '../screens/home/SearchScreen';
import MatchDetailsScreen from '../screens/match/MatchDetailsScreen';
import NewsDetailScreen from '../screens/news/NewsDetailScreen';
import MotmVoteScreen from '../screens/match/MotmVoteScreen';
import DiscussionScreen from '../screens/match/DiscussionScreen';
import type { MatchDetailsParams, NewsDetailParams, MotmVoteParams, DiscussionParams } from './types';

export type HomeStackParamList = {
  HomeFeed: undefined;
  NotificationInbox: undefined;
  Subscribe: undefined;
  Payment: undefined;
  Search: undefined;
  MatchDetails: MatchDetailsParams;
  NewsDetail: NewsDetailParams;
  MotmVote: MotmVoteParams;
  Discussion: DiscussionParams;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0A0A0A' },
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="HomeFeed" component={HomeScreen} />
      <Stack.Screen name="NotificationInbox" component={NotificationInboxScreen} />
      <Stack.Screen name="Subscribe" component={SubscribeScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="MatchDetails" component={MatchDetailsScreen} />
      <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
      <Stack.Screen name="MotmVote" component={MotmVoteScreen} />
      <Stack.Screen name="Discussion" component={DiscussionScreen} />
    </Stack.Navigator>
  );
}
