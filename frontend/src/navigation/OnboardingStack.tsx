import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingSlides from '../screens/onboarding/OnboardingSlides';
import RegisterLoginScreen from '../screens/onboarding/RegisterLoginScreen';
import VerifyEmailScreen from '../screens/onboarding/VerifyEmailScreen';
import ForgotPasswordScreen from '../screens/onboarding/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/onboarding/ResetPasswordScreen';
import PickClubScreen from '../screens/onboarding/PickClubScreen';
import type { OnboardingStackParamList } from './types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Slides">
      <Stack.Screen name="Slides" component={OnboardingSlides} />
      <Stack.Screen name="RegisterLogin" component={RegisterLoginScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="PickClub" component={PickClubScreen} />
    </Stack.Navigator>
  );
}

export type { OnboardingStackParamList } from './types';
