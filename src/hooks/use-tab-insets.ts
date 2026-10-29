import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset, Spacing } from '@/constants/theme';

/**
 * Tab screens manage their own insets (automatic content insets are disabled in the tab layout),
 * so iOS and Android behave identically: clear the status bar on top and the tab bar below.
 */
export function useTabInsets() {
  const safe = useSafeAreaInsets();
  return {
    top: safe.top + Spacing.two,
    bottom: safe.bottom + BottomTabInset + Spacing.four,
    /** Offset for floating buttons that sit above the tab bar. */
    floating: safe.bottom + BottomTabInset + Spacing.three,
  };
}
