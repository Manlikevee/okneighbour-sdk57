import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BRAND } from '@/constants/config';
import { Spacing } from '@/constants/theme';

/** The lime OK-hand mark, optionally with the wordmark. Use `onDark` on forest backgrounds. */
export function BrandMark({ size = 40, wordmark, onDark }: { size?: number; wordmark?: boolean; onDark?: boolean }) {
  return (
    <View style={styles.row} accessible accessibilityRole="image" accessibilityLabel={BRAND.name}>
      <Image
        source={onDark ? require('@/assets/images/logo-lime.png') : require('@/assets/images/logo-forest.png')}
        style={{ width: size, height: size }}
        contentFit="contain"
      />
      {wordmark ? (
        <ThemedText type="subtitle" style={{ fontSize: size * 0.55, lineHeight: size * 0.7, color: onDark ? '#F4F8EE' : undefined }}>
          {BRAND.name}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
