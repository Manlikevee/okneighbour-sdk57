import { useMemo } from 'react';
import { StyleSheet, Text, View, type TextStyle } from 'react-native';

import { Font, Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { openLink } from '@/lib/browser';
import { parseHtml, splitSegments, type Block, type Inline } from '@/lib/html';

type Props = { html: string; size?: 'md' | 'sm'; maxLines?: number };

/** Renders post/comment HTML (or plain text) with native text. Links and bare URLs open in the in-app browser. */
export function RichText({ html, size = 'md', maxLines }: Props) {
  const theme = useTheme();
  const blocks = useMemo(() => parseHtml(html), [html]);
  const base: TextStyle = size === 'md' ? { fontSize: 16, lineHeight: 24 } : { fontSize: 15, lineHeight: 22 };

  const renderRuns = (runs: Inline[]) =>
    runs.map((r, i) => {
      const style: TextStyle = {
        fontFamily: r.bold ? Font.bodyBold : r.code ? Fonts?.mono : Font.body,
        fontStyle: r.italic ? 'italic' : 'normal',
        textDecorationLine: r.underline && r.strike ? 'underline line-through' : r.underline || r.href ? 'underline' : r.strike ? 'line-through' : 'none',
        color: r.href ? theme.link : theme.text,
      };
      if (r.href) {
        const href = r.href;
        return (
          <Text key={i} style={style} accessibilityRole="link" onPress={() => void openLink(href)}>
            {r.text}
          </Text>
        );
      }
      return (
        <Text key={i} style={style}>
          {splitSegments(r.text).map((s, j) =>
            s.kind === 'text' ? (
              s.text
            ) : s.kind === 'hashtag' ? (
              <Text key={j} style={{ color: theme.link, fontFamily: Font.bodySemibold }}>
                {s.text}
              </Text>
            ) : (
              <Text key={j} style={{ color: theme.link, textDecorationLine: 'underline' }} accessibilityRole="link" onPress={() => void openLink(s.text)}>
                {s.text}
              </Text>
            ),
          )}
        </Text>
      );
    });

  const renderBlock = (b: Block, i: number, last: boolean) => {
    const gap = last ? 0 : Spacing.two + 2;
    switch (b.type) {
      case 'heading':
        return (
          <Text key={i} accessibilityRole="header" style={[base, { fontFamily: Font.display, fontSize: b.level === 1 ? 22 : 18, lineHeight: b.level === 1 ? 28 : 24, color: theme.text, marginBottom: gap }]}>
            {renderRuns(b.children)}
          </Text>
        );
      case 'quote':
        return (
          <View key={i} style={[styles.quote, { borderLeftColor: theme.primary, marginBottom: gap }]}>
            <Text style={[base, { color: theme.textSecondary }]}>{renderRuns(b.children)}</Text>
          </View>
        );
      case 'list':
        return (
          <View key={i} style={{ gap: 4, marginBottom: gap }}>
            {b.items.map((item, k) => (
              <View key={k} style={styles.item}>
                <Text style={[base, { color: theme.textSecondary, width: 22, textAlign: 'right' }]}>{b.ordered ? `${k + 1}.` : '•'}</Text>
                <Text style={[base, { flex: 1, color: theme.text }]}>{renderRuns(item)}</Text>
              </View>
            ))}
          </View>
        );
      default:
        return (
          <Text key={i} style={[base, { color: theme.text, marginBottom: gap }]} numberOfLines={maxLines}>
            {renderRuns(b.children)}
          </Text>
        );
    }
  };

  if (blocks.length === 0) return null;
  return <View>{blocks.map((b, i) => renderBlock(b, i, i === blocks.length - 1))}</View>;
}

const styles = StyleSheet.create({
  quote: { borderLeftWidth: 3, paddingLeft: Spacing.three },
  item: { flexDirection: 'row', gap: Spacing.two },
});
