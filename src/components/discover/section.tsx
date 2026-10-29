import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';

import { Rail } from '@/components/discover/rail';
import { SectionHeader } from '@/components/ui/section-header';
import { CardRailSkeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/state-views';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { IconName } from '@/components/ui/icon';
import type { Resource } from '@/hooks/use-resource';

type Props<T> = {
  title: string;
  subtitle?: string;
  icon: IconName;
  resource: Resource<unknown>;
  items: T[];
  keyOf: (item: T, index: number) => string;
  /** `full` is true when the section is expanded into a vertical list. */
  render: (item: T, full: boolean) => ReactElement;
  emptyText: string;
  expanded?: boolean;
  /** When false the data source is unavailable (e.g. no location yet). */
  enabled?: boolean;
  disabledText?: string;
};

export function DiscoverSection<T>({ title, subtitle, icon, resource, items, keyOf, render, emptyText, expanded, enabled = true, disabledText }: Props<T>) {
  let body: ReactElement;
  if (!enabled) {
    body = <Note text={disabledText ?? 'Choose a location to see this.'} />;
  } else if (resource.loading) {
    body = <CardRailSkeleton />;
  } else if (resource.error && !resource.data) {
    body = <ErrorState compact message={resource.error} onRetry={resource.reload} />;
  } else if (items.length === 0) {
    body = <Note text={emptyText} />;
  } else if (expanded) {
    body = (
      <View style={styles.list}>
        {items.map((item, i) => (
          <View key={keyOf(item, i)}>{render(item, true)}</View>
        ))}
      </View>
    );
  } else {
    body = <Rail data={items} keyOf={keyOf} render={(item) => render(item, false)} />;
  }

  return (
    <View style={{ gap: Spacing.two + 4 }}>
      <SectionHeader title={title} subtitle={subtitle} icon={icon} />
      {body}
    </View>
  );
}

function Note({ text }: { text: string }) {
  return (
    <ThemedText themeColor="textSecondary" style={styles.note}>
      {text}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: Spacing.three, gap: Spacing.three },
  note: { paddingHorizontal: Spacing.three },
});
