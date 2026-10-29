import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import type { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  icon: IconName;
  label: string;
  onPress?: () => void;
  size?: number;
  iconColor?: ThemeColor;
  /** Fill style: soft tinted circle (default), surface card, or transparent. */
  tone?: 'soft' | 'surface' | 'plain' | 'primary';
  style?: StyleProp<ViewStyle>;
};

export function IconButton({ icon, label, onPress, size = 44, iconColor = 'text', tone = 'soft', style }: Props) {
  const theme = useTheme();
  const bg = tone === 'soft' ? theme.backgroundElement : tone === 'surface' ? theme.surface : tone === 'primary' ? theme.primary : 'transparent';
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={[styles.base, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg, borderColor: tone === 'surface' ? theme.border : 'transparent' }, style]}>
      <Icon name={icon} size={Math.round(size * 0.46)} color={tone === 'primary' ? 'onPrimary' : iconColor} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});
