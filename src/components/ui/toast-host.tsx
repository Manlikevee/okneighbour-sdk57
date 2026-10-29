import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { subscribeToasts, type ToastMessage } from '@/lib/toast';

const ICON: Record<ToastMessage['kind'], IconName> = { success: 'check', error: 'warning', info: 'sparkles' };

export function ToastHost() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToasts((t) => {
      if (timer.current) clearTimeout(timer.current);
      setToast(t);
      timer.current = setTimeout(() => setToast(null), t.kind === 'error' ? 4500 : 3000);
    });
    return () => {
      unsubscribe();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (!toast) return null;
  const accent = toast.kind === 'error' ? theme.danger : theme.primary;

  return (
    <Animated.View key={toast.id} entering={FadeInUp.springify().damping(18)} exiting={FadeOutUp.duration(180)} style={[styles.wrap, { top: insets.top + Spacing.two }]} pointerEvents="box-none">
      <Pressable
        onPress={() => setToast(null)}
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
        style={[styles.toast, { backgroundColor: theme.forest, boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.25)' }]}>
        <Icon name={ICON[toast.kind]} size={18} tint={accent} />
        <ThemedText type="small" style={styles.text} numberOfLines={3}>
          {toast.message}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: Spacing.three, right: Spacing.three, alignItems: 'center', zIndex: 2000 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 2, paddingHorizontal: Spacing.three, paddingVertical: 12, borderRadius: Radius.pill, maxWidth: 520 },
  text: { color: '#F4F8EE', flexShrink: 1 },
});
