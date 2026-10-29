/**
 * OkNeighbour design tokens.
 * Identity: the lime "OK" hand (#81BE1C) on deep evergreen, over warm paper surfaces.
 * Every ThemeColor key must exist in both palettes.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#13201A',
    textSecondary: '#55645B',
    textTertiary: '#86948B',
    background: '#F6F4EC',
    backgroundElement: '#ECE9DD',
    backgroundSelected: '#DFDBCB',
    surface: '#FFFFFF',
    border: '#E3DFD0',
    primary: '#81BE1C',
    primaryPressed: '#6EA616',
    onPrimary: '#0E2A1D',
    primarySoft: '#E7F2D0',
    onPrimarySoft: '#2F5A0A',
    forest: '#0E2A1D',
    onForest: '#F4F8EE',
    link: '#3E7A0A',
    danger: '#D64545',
    dangerSoft: '#FBE3E1',
    warning: '#E39A2D',
    warningSoft: '#FBEACB',
    info: '#3B82C4',
    infoSoft: '#DCEAF7',
    skeleton: '#E9E5D6',
    skeletonHighlight: '#F6F3E8',
  },
  dark: {
    text: '#F1F5F0',
    textSecondary: '#A3B2A9',
    textTertiary: '#6F8077',
    background: '#0B120F',
    backgroundElement: '#18231D',
    backgroundSelected: '#233229',
    surface: '#121B16',
    border: '#223028',
    primary: '#9AD532',
    primaryPressed: '#86BC26',
    onPrimary: '#0B120F',
    primarySoft: '#243818',
    onPrimarySoft: '#C4EC82',
    forest: '#0E2A1D',
    onForest: '#F4F8EE',
    link: '#A8DC52',
    danger: '#F0706F',
    dangerSoft: '#3A1B1B',
    warning: '#F0B050',
    warningSoft: '#3B2D14',
    info: '#6CAEE8',
    infoSoft: '#16293A',
    skeleton: '#1A2620',
    skeletonHighlight: '#24332B',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** System font stacks (kept from the starter; used for monospace). */
export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

/** Brand font families (loaded in the root layout). Never combine with fontWeight. */
export const Font = {
  display: 'Lexend_600SemiBold',
  displayBold: 'Lexend_700Bold',
  displayMedium: 'Lexend_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = { sm: 10, md: 16, lg: 24, xl: 32, pill: 999 } as const;

export const Shadow = {
  card: '0px 2px 12px rgba(14, 42, 29, 0.07)',
  raised: '0px 8px 24px rgba(14, 42, 29, 0.18)',
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
