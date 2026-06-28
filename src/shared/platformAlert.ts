import { Alert, Platform } from 'react-native';

export type PlatformAlertButton = {
  text: string;
  style?: 'cancel' | 'default' | 'destructive';
  onPress?: () => void;
};

/** RN Web Alert is a no-op; use native confirm/alert on web. */
export function platformAlert(
  title: string,
  message?: string,
  buttons?: PlatformAlertButton[],
): void {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }

  const body = message ? `${title}\n\n${message}` : title;
  const opts = buttons && buttons.length > 0 ? buttons : [{ text: 'OK' }];
  const cancel = opts.find((b) => b.style === 'cancel');
  const primary = opts.find((b) => b.style !== 'cancel') ?? opts[opts.length - 1];

  if (cancel && primary && cancel !== primary) {
    if (typeof window !== 'undefined' && window.confirm(body)) {
      primary.onPress?.();
    } else {
      cancel.onPress?.();
    }
    return;
  }

  if (typeof window !== 'undefined') window.alert(body);
  opts[0]?.onPress?.();
}