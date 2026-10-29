import { useState, type ReactNode, type Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { ThemedText } from '@/components/themed-text';
import { Font, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = TextInputProps & {
  label?: string;
  error?: string | null;
  icon?: IconName;
  right?: ReactNode;
  hint?: string;
  inputRef?: Ref<TextInput>;
};

export function TextField({ label, error, icon, right, hint, inputRef, multiline, style, onFocus, onBlur, editable = true, ...rest }: Props) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? theme.danger : focused ? theme.primary : theme.border;

  return (
    <View style={styles.wrap}>
      {label ? (
        <ThemedText type="label" themeColor="textSecondary">
          {label}
        </ThemedText>
      ) : null}
      <View
        style={[
          styles.field,
          { backgroundColor: editable ? theme.surface : theme.backgroundElement, borderColor, borderWidth: focused || error ? 2 : 1 },
          multiline && styles.multiline,
        ]}>
        {icon ? <Icon name={icon} size={18} color="textTertiary" /> : null}
        <TextInput
          ref={inputRef}
          accessibilityLabel={label}
          placeholderTextColor={theme.textTertiary}
          selectionColor={theme.primary}
          cursorColor={theme.primary}
          multiline={multiline}
          editable={editable}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, { color: editable ? theme.text : theme.textSecondary }, multiline && styles.inputMultiline, style]}
          {...rest}
        />
        {right}
      </View>
      {error ? (
        <ThemedText type="caption" themeColor="danger" accessibilityLiveRegion="polite">
          {error}
        </ThemedText>
      ) : hint ? (
        <ThemedText type="caption">{hint}</ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.one + 2 },
  field: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 2, borderRadius: Radius.md, paddingHorizontal: Spacing.three, minHeight: 52 },
  multiline: { alignItems: 'flex-start', paddingVertical: Spacing.two + 2 },
  input: { flex: 1, fontFamily: Font.body, fontSize: 16, paddingVertical: 12 },
  inputMultiline: { minHeight: 96, textAlignVertical: 'top', paddingTop: 4 },
});
