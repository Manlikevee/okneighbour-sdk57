import type { ReactElement } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';

/** Horizontal, snap-friendly row of cards. */
export function Rail<T>({ data, keyOf, render }: { data: T[]; keyOf: (item: T, index: number) => string; render: (item: T) => ReactElement }) {
  return (
    <FlatList
      data={data}
      horizontal
      nestedScrollEnabled
      keyExtractor={keyOf}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => render(item)}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.three, gap: Spacing.three, paddingVertical: Spacing.one + 2 },
});
