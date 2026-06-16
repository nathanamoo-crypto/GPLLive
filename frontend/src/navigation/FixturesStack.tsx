import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import FixturesRoot from '../screens/fixtures/FixturesRoot';
import MatchDetailsScreen from '../screens/match/MatchDetailsScreen';
import type { MatchDetailsParams } from './types';

export type FixturesStackParamList = {
  FixturesRoot: undefined;
  MatchDetails: MatchDetailsParams;
};

const Stack = createNativeStackNavigator<FixturesStackParamList>();

export default function FixturesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FixturesRoot" component={FixturesRoot} />
      <Stack.Screen name="MatchDetails" component={MatchDetailsScreen} />
    </Stack.Navigator>
  );
}
