import React from 'react';
import ProcessNavigator from './ProcessNavigator';

// Owner flow: TurboTax-style guided process (ProcessNavigator).
// TabNavigator remains in the repo but is no longer the primary owner entry.
// Worker role in App.tsx stays outside the navigator.

export default function AppNavigator() {
  return <ProcessNavigator />;
}