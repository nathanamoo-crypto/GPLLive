import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LeagueTableScreen from '../screens/fixtures/LeagueTableScreen';
import type { LeagueTableParams } from './types';

export type TableStackParamList = {
  LeagueTable: LeagueTableParams | undefined;
};

const Stack = createNativeStackNavigator<TableStackParamList>();

export default function TableStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0A0A0A' },
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="LeagueTable" component={LeagueTableScreen} />
    </Stack.Navigator>
  );
}
