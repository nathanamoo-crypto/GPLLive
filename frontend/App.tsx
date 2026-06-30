import React from 'react';
import AppProviders from './src/app/AppProviders';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
