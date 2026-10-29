
import { useEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  overLimit: boolean;
  keyboardOffset: number;
};

export function RichEditor({
  value,
  onChangeText,
  overLimit,
  keyboardOffset,
}: Props) {
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardOffset}
    >
      <View style={styles.flex}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder="What's happening around you?"
          placeholderTextColor={theme.textSecondary}
          multiline
          textAlignVertical="top"
          autoCapitalize="sentences"
          autoCorrect
          maxLength={undefined}
          scrollEnabled
          selectionColor={theme.primary}
          accessibilityLabel="Write your post"
          style={[
            styles.input,
            {
              color: overLimit ? theme.danger : theme.text,
            },
          ]}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    fontSize: 17,
    lineHeight: 27,
    textAlignVertical: 'top',
  },
});
