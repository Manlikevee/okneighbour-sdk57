import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLocation } from '@/providers/location-provider';

/** Tappable "where am I looking" control that opens the location sheet. */
export function LocationPill({ onDark }: { onDark?: boolean }) {
  const theme = useTheme();
  const { place, resolving } = useLocation();
  const label = place?.city ?? (resolving ? 'Locating…' : 'Choose area');

  return (
    <PressableScale
      onPress={() => router.push('/location')}
      accessibilityRole="button"
      accessibilityLabel={`Location: ${label}. Change location`}
      style={[styles.pill, { backgroundColor: onDark ? 'rgba(255,255,255,0.12)' : theme.surface, borderColor: onDark ? 'rgba(255,255,255,0.18)' : theme.border }]}>
      <View style={[styles.dot, { backgroundColor: theme.primary }]}>
        <Icon name="location" size={14} tint={theme.onPrimary} />
      </View>
      <ThemedText type="heading" numberOfLines={1} style={{ fontSize: 17, lineHeight: 22, color: onDark ? '#F4F8EE' : theme.text, flexShrink: 1 }}>
        {label}
      </ThemedText>
      <Icon name="chevronDown" size={14} tint={onDark ? '#F4F8EE' : theme.textSecondary} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, alignSelf: 'flex-start', maxWidth: '100%', paddingVertical: 6, paddingLeft: 6, paddingRight: 14, borderRadius: Radius.pill, borderWidth: 1 },
  dot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
});
