import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PredictRoot from '../screens/predict/PredictRoot';

export type PredictStackParamList = {
  PredictRoot: undefined;
};

const Stack = createNativeStackNavigator<PredictStackParamList>();

export default function PredictStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PredictRoot" component={PredictRoot} />
    </Stack.Navigator>
  );
}
