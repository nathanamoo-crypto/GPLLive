import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';

export type AuthStackParamList = {
  Login: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
