import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProfileScreen from '../screens/profile/ProfileScreen';

export type ProfileStackParamList = {
  ProfileRoot: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileRoot" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
