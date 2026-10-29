import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = { label: string; onPress: () => void; primary?: boolean; disabled?: boolean; loading?: boolean };

/** Text button for native stack headers. */
export function HeaderButton({ label, onPress, primary, disabled, loading }: Props) {
  const theme = useTheme();
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      style={[styles.base, primary && { backgroundColor: theme.primary, opacity: inactive && !loading ? 0.4 : 1 }]}>
      {loading ? (
        <ActivityIndicator size="small" color={theme.onPrimary} />
      ) : (
        <ThemedText type="label" style={{ color: primary ? theme.onPrimary : theme.link, opacity: disabled && !primary ? 0.4 : 1 }}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 34, minWidth: 44, paddingHorizontal: 14, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
});
