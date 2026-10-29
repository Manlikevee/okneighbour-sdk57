import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  const theme = useTheme();
  return (
    <View accessibilityRole="tablist" style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={[styles.item, active && { backgroundColor: theme.surface, boxShadow: '0px 1px 4px rgba(14, 42, 29, 0.12)' }]}>
            <ThemedText type="label" themeColor={active ? 'text' : 'textSecondary'} numberOfLines={1}>
              {o.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', padding: 4, borderRadius: Radius.pill },
  item: { flex: 1, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.pill, paddingHorizontal: Spacing.two },
});
