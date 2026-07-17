import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import GamesRoot from '../screens/games/GamesRoot';

export type GamesStackParamList = {
  GamesRoot: { defaultTab?: 'fantasy' | 'predictions' } | undefined;
};

const Stack = createNativeStackNavigator<GamesStackParamList>();

export default function GamesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0A0A0A' },
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="GamesRoot" component={GamesRoot} />
    </Stack.Navigator>
  );
}
