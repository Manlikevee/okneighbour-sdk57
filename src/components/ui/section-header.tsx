import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function SectionHeader({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: IconName }) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      {icon ? (
        <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
          <Icon name={icon} size={17} tint={theme.onPrimarySoft} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <ThemedText type="subtitle" accessibilityRole="header" style={{ fontSize: 20, lineHeight: 26 }}>
          {title}
        </ThemedText>
        {subtitle ? <ThemedText type="caption">{subtitle}</ThemedText> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 2, paddingHorizontal: Spacing.three },
  icon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
