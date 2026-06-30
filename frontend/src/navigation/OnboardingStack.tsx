import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingSlides from '../screens/onboarding/OnboardingSlides';
import RegisterLoginScreen from '../screens/onboarding/RegisterLoginScreen';
import PickClubScreen from '../screens/onboarding/PickClubScreen';
import type { OnboardingStackParamList } from './types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0A0A0A' },
        animation: 'slide_from_right',
      }}
      initialRouteName="Slides">
      <Stack.Screen name="Slides" component={OnboardingSlides} />
      <Stack.Screen name="RegisterLogin" component={RegisterLoginScreen} />
      <Stack.Screen name="PickClub" component={PickClubScreen} />
    </Stack.Navigator>
  );
}

export type { OnboardingStackParamList } from './types';
