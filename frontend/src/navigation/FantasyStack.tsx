import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import FantasyRoot from '../screens/fantasy/FantasyRoot';

export type FantasyStackParamList = {
  FantasyRoot: undefined;
};

const Stack = createNativeStackNavigator<FantasyStackParamList>();

export default function FantasyStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FantasyRoot" component={FantasyRoot} />
    </Stack.Navigator>
  );
}
