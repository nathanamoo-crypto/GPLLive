import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RegisterLoginScreen from '../screens/onboarding/RegisterLoginScreen';
import VerifyEmailScreen from '../screens/onboarding/VerifyEmailScreen';
import ForgotPasswordScreen from '../screens/onboarding/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/onboarding/ResetPasswordScreen';
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
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="PickClub" component={PickClubScreen} />
    </Stack.Navigator>
  );
}

export type { AuthStackParamList } from './types';
