import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Approximate height of a native stack header (status bar + bar), used as the
 * KeyboardAvoidingView offset on screens that sit below one.
 */
export function useHeaderOffset(): number {
  const { top } = useSafeAreaInsets();
  return top + (Platform.OS === 'ios' ? 44 : 56);
}
