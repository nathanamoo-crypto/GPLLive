import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/home/HomeScreen';
import NotificationInboxScreen from '../screens/home/NotificationInboxScreen';

export type HomeStackParamList = {
  HomeFeed: undefined;
  NotificationInbox: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeFeed" component={HomeScreen} />
      <Stack.Screen name="NotificationInbox" component={NotificationInboxScreen} />
    </Stack.Navigator>
  );
}
