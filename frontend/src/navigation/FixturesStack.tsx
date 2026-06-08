import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import FixturesRoot from '../screens/fixtures/FixturesRoot';

export type FixturesStackParamList = {
  FixturesRoot: undefined;
};

const Stack = createNativeStackNavigator<FixturesStackParamList>();

export default function FixturesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FixturesRoot" component={FixturesRoot} />
    </Stack.Navigator>
  );
}
