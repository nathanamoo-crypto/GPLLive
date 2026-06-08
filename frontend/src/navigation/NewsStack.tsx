import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import NewsScreen from '../screens/news/NewsScreen';

export type NewsStackParamList = {
  NewsFeed: undefined;
};

const Stack = createNativeStackNavigator<NewsStackParamList>();

export default function NewsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NewsFeed" component={NewsScreen} />
    </Stack.Navigator>
  );
}