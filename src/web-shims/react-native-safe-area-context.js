// Web shim for react-native-safe-area-context
// Note: simplified shim; real insets are zeroed for web simplicity.
// The real 'react-native-safe-area-context/web' provides the providers.

export { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context/web';

export function useSafeAreaInsets() {
  return { top: 0, bottom: 0, left: 0, right: 0 };
}