import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type EmptyProps = { icon: IconName; title: string; message?: string; actionLabel?: string; onAction?: () => void; compact?: boolean };

export function EmptyState({ icon, title, message, actionLabel, onAction, compact }: EmptyProps) {
  const theme = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(300)} style={[styles.wrap, compact && { paddingVertical: Spacing.four }]}>
      <View style={[styles.badge, { backgroundColor: theme.primarySoft }]}>
        <Icon name={icon} size={30} tint={theme.onPrimarySoft} />
      </View>
      <ThemedText type="subtitle" style={styles.center}>
        {title}
      </ThemedText>
      {message ? (
        <ThemedText themeColor="textSecondary" style={styles.center}>
          {message}
        </ThemedText>
      ) : null}
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} style={{ marginTop: Spacing.two }} /> : null}
    </Animated.View>
  );
}

export function ErrorState({ message, onRetry, compact }: { message?: string | null; onRetry?: () => void; compact?: boolean }) {
  const theme = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(300)} style={[styles.wrap, compact && { paddingVertical: Spacing.four }]} accessibilityRole="alert">
      <View style={[styles.badge, { backgroundColor: theme.dangerSoft }]}>
        <Icon name="warning" size={28} tint={theme.danger} />
      </View>
      <ThemedText type="subtitle" style={styles.center}>
        Couldn’t load this
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.center}>
        {message ?? 'Something went wrong. Please try again.'}
      </ThemedText>
      {onRetry ? <Button title="Try again" icon="refresh" variant="secondary" onPress={onRetry} style={{ marginTop: Spacing.two }} /> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: Spacing.two + 2, paddingVertical: Spacing.five, paddingHorizontal: Spacing.four },
  badge: { width: 68, height: 68, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.one },
  center: { textAlign: 'center' },
});
