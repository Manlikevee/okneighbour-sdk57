import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'forest';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  iconRight?: IconName;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

const HEIGHT: Record<Size, number> = { sm: 38, md: 50, lg: 58 };

export function Button({ title, onPress, variant = 'primary', size = 'md', loading, disabled, icon, iconRight, fullWidth, style, accessibilityHint }: Props) {
  const theme = useTheme();
  const palette: Record<Variant, { bg: ThemeColor | 'transparent'; fg: ThemeColor; border?: ThemeColor }> = {
    primary: { bg: 'primary', fg: 'onPrimary' },
    secondary: { bg: 'backgroundElement', fg: 'text' },
    outline: { bg: 'transparent', fg: 'text', border: 'border' },
    ghost: { bg: 'transparent', fg: 'link' },
    danger: { bg: 'dangerSoft', fg: 'danger' },
    forest: { bg: 'forest', fg: 'onForest' },
  };
  const p = palette[variant];
  const inactive = disabled || loading;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={() => {
        if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      style={[
        styles.base,
        {
          height: HEIGHT[size],
          backgroundColor: p.bg === 'transparent' ? 'transparent' : theme[p.bg],
          borderColor: p.border ? theme[p.border] : 'transparent',
          opacity: disabled ? 0.45 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          paddingHorizontal: size === 'sm' ? Spacing.three : Spacing.four,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={theme[p.fg]} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={size === 'sm' ? 16 : 20} color={p.fg} /> : null}
          <ThemedText type={size === 'sm' ? 'label' : 'heading'} themeColor={p.fg} style={size === 'sm' ? undefined : styles.title}>
            {title}
          </ThemedText>
          {iconRight ? <Icon name={iconRight} size={size === 'sm' ? 16 : 20} color={p.fg} /> : null}
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: Radius.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  title: { fontSize: 16, lineHeight: 22 },
});
