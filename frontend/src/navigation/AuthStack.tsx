import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RegisterLoginScreen from '../screens/onboarding/RegisterLoginScreen';
import PickClubScreen from '../screens/onboarding/PickClubScreen';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

interface AuthStackProps {
  initialRouteName?: keyof AuthStackParamList;
}

export default function AuthStack({ initialRouteName = 'RegisterLogin' }: AuthStackProps) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
      <Stack.Screen name="RegisterLogin" component={RegisterLoginScreen} />
      <Stack.Screen name="PickClub" component={PickClubScreen} />
    </Stack.Navigator>
  );
}

export type { AuthStackParamList } from './types';
