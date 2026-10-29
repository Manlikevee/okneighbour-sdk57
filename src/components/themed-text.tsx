import { StyleSheet, Text, type TextProps } from 'react-native';

import { Font, Fonts, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'title'
    | 'display'
    | 'headline'
    | 'heading'
    | 'subtitle'
    | 'body'
    | 'small'
    | 'smallBold'
    | 'label'
    | 'caption'
    | 'eyebrow'
    | 'link'
    | 'linkPrimary'
    | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const color = themeColor ?? (type === 'linkPrimary' || type === 'link' ? 'link' : type === 'eyebrow' || type === 'caption' ? 'textSecondary' : 'text');

  return <Text style={[{ color: theme[color] }, styles[type], style]} {...rest} />;
}

const styles = StyleSheet.create({
  default: { fontFamily: Font.body, fontSize: 16, lineHeight: 24 },
  body: { fontFamily: Font.body, fontSize: 16, lineHeight: 24 },
  small: { fontFamily: Font.bodyMedium, fontSize: 14, lineHeight: 20 },
  smallBold: { fontFamily: Font.bodyBold, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: Font.bodySemibold, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: Font.bodyMedium, fontSize: 12, lineHeight: 16 },
  eyebrow: { fontFamily: Font.bodyBold, fontSize: 11, lineHeight: 14, letterSpacing: 1, textTransform: 'uppercase' },
  heading: { fontFamily: Font.display, fontSize: 18, lineHeight: 24 },
  subtitle: { fontFamily: Font.display, fontSize: 22, lineHeight: 28 },
  headline: { fontFamily: Font.displayBold, fontSize: 28, lineHeight: 34, letterSpacing: -0.4 },
  display: { fontFamily: Font.displayBold, fontSize: 36, lineHeight: 42, letterSpacing: -0.8 },
  title: { fontFamily: Font.displayBold, fontSize: 44, lineHeight: 50, letterSpacing: -1 },
  link: { fontFamily: Font.bodySemibold, fontSize: 14, lineHeight: 20 },
  linkPrimary: { fontFamily: Font.bodySemibold, fontSize: 14, lineHeight: 20 },
  code: { fontFamily: Fonts.mono, fontSize: 12 },
});
