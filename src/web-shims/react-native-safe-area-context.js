// Web shim for react-native-safe-area-context
import { useSafeAreaInsets } from './useSafeAreaInsets';

export { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context/web';

export function useSafeAreaInsets() {
  return { top: 0, bottom: 0, left: 0, right: 0 };
}