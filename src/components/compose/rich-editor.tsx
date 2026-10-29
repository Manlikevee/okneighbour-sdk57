import {
  CoreBridge,
  RichText,
  TenTapStartKit,
  Toolbar,
  darkEditorCss,
  darkEditorTheme,
  lightEditorCss,
  lightEditorTheme,
  useEditorBridge,
  useEditorContent,
} from '@10play/tentap-editor';
import { useEffect, type ComponentType } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { useIsDark } from '@/hooks/use-theme';

// The toolbar's `actions` accepts action names; typed loosely here to keep the library surface in one place.
const FormatToolbar = Toolbar as unknown as ComponentType<{ editor: unknown; actions: string[] }>;
const ACTIONS = ['bold', 'italic', 'underline', 'orderedList', 'unorderedList', 'link'];

const BASE_CSS = `
  * { font-size: 16px; line-height: 1.5; font-family: -apple-system, Roboto, 'Helvetica Neue', Arial, sans-serif !important; }
  p { margin: 0 0 8px 0; }
`;

type Props = {
  onChangeHtml: (html: string) => void;
  /** Turns the text red when the post is over the length limit. */
  overLimit: boolean;
  keyboardOffset: number;
};

/** WebView-based rich-text editor (same library as the previous app), themed for light/dark. */
export function RichEditor({ onChangeHtml, overLimit, keyboardOffset }: Props) {
  const dark = useIsDark();
  const editor = useEditorBridge({
    autofocus: true,
    avoidIosKeyboard: true,
    initialContent: '',
    editable: true,
    bridgeExtensions: [...TenTapStartKit, CoreBridge.configureCSS(BASE_CSS + (dark ? darkEditorCss : lightEditorCss))],
    theme: dark ? darkEditorTheme : lightEditorTheme,
  });

  const html = useEditorContent(editor, { type: 'html' });
  useEffect(() => {
    if (typeof html === 'string') onChangeHtml(html);
  }, [html, onChangeHtml]);

  useEffect(() => {
    editor.injectCSS(overLimit ? 'p { color: #D64545 !important; }' : '', 'maxLength-exceed-style');
  }, [overLimit, editor]);

  return (
    <View style={styles.flex}>
      <RichText editor={editor} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={keyboardOffset} style={styles.toolbar}>
        <FormatToolbar editor={editor} actions={ACTIONS} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  toolbar: { position: 'absolute', width: '100%', bottom: 0 },
});
