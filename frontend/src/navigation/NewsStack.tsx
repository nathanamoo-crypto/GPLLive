import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import NewsScreen from '../screens/news/NewsScreen';
import NewsDetailScreen from '../screens/news/NewsDetailScreen';
import type { NewsDetailParams } from './types';

export type NewsStackParamList = {
  NewsFeed: undefined;
  NewsDetail: NewsDetailParams;
};

const Stack = createNativeStackNavigator<NewsStackParamList>();

export default function NewsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NewsFeed" component={NewsScreen} />
      <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
    </Stack.Navigator>
  );
}