import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/home/HomeScreen';
import NotificationInboxScreen from '../screens/home/NotificationInboxScreen';
import SubscribeScreen from '../screens/home/SubscribeScreen';
import PaymentScreen from '../screens/home/PaymentScreen';
import SearchScreen from '../screens/home/SearchScreen';
import CreateLeagueScreen from '../screens/home/CreateLeagueScreen';
import LeagueDetailScreen from '../screens/home/LeagueDetailScreen';
import MyLeaguesScreen from '../screens/home/MyLeaguesScreen';
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
  // Repurposed from a mock player/club/news search into league search - see
  // SearchScreen.tsx. Browses public leagues, surfaces "My Leagues", and
  // has a "+" entry point into CreateLeague plus a join-by-code box.
  Search: undefined;
  CreateLeague: undefined;
  LeagueDetail: { leagueId: number };
  // Direct entry point into leagues the caller owns/joined, so they don't
  // have to open Search every time - see MyLeaguesScreen.tsx.
  MyLeagues: undefined;
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
      <Stack.Screen name="CreateLeague" component={CreateLeagueScreen} />
      <Stack.Screen name="LeagueDetail" component={LeagueDetailScreen} />
      <Stack.Screen name="MyLeagues" component={MyLeaguesScreen} />
      <Stack.Screen name="MatchDetails" component={MatchDetailsScreen} />
      <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
      <Stack.Screen name="MotmVote" component={MotmVoteScreen} />
      <Stack.Screen name="Discussion" component={DiscussionScreen} />
    </Stack.Navigator>
  );
}
