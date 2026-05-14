import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';

// This placeholder determines whether the app shows auth flow or main app flow.
// In Phase 1, keep this simple and replace it later with real auth state.
const isSignedIn = false;

export default function AppNavigator() {
  return (
    <NavigationContainer>
      {isSignedIn ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
