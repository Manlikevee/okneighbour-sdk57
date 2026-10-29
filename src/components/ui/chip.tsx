import { StyleSheet } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = { label: string; selected?: boolean; onPress?: () => void; icon?: IconName };

export function Chip({ label, selected, onPress, icon }: Props) {
  const theme = useTheme();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      scaleTo={0.95}
      style={[styles.chip, { backgroundColor: selected ? theme.forest : theme.surface, borderColor: selected ? theme.forest : theme.border }]}>
      {icon ? <Icon name={icon} size={15} tint={selected ? theme.primary : theme.textSecondary} /> : null}
      <ThemedText type="label" style={{ color: selected ? theme.onForest : theme.text }}>
        {label}
      </ThemedText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.three, height: 38, borderRadius: Radius.pill, borderWidth: 1 },
});
