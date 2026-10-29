import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Font } from '@/constants/theme';
import { useIsDark, useTheme } from '@/hooks/use-theme';
import { initials } from '@/lib/format';

const TINTS_LIGHT = ['#E7F2D0', '#DCEAF7', '#FBEACB', '#F6DCE3', '#E3DDF3', '#D5EFE6'];
const TINTS_DARK = ['#243818', '#16293A', '#3B2D14', '#3A1B26', '#2A2340', '#17382E'];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

type Props = { uri?: string | null; name?: string | null; size?: number; ring?: boolean };

export function Avatar({ uri, name, size = 44, ring }: Props) {
  const theme = useTheme();
  const dark = useIsDark();
  const tints = dark ? TINTS_DARK : TINTS_LIGHT;
  const bg = tints[hash(name ?? '') % tints.length];
  const radius = size / 2;
  return (
    <View
      accessibilityLabel={name ? `${name}’s photo` : 'Profile photo'}
      style={[styles.base, { width: size, height: size, borderRadius: radius, backgroundColor: bg }, ring && { borderWidth: 3, borderColor: theme.background }]}>
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={180} recyclingKey={uri} />
      ) : (
        <ThemedText style={{ fontFamily: Font.display, fontSize: size * 0.38, lineHeight: size * 0.5, color: theme.onPrimarySoft }}>{initials(name)}</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
