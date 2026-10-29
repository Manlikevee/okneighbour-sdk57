import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { getBusinesses, getEvents, getNews } from '@/api/discover';
import { getProfilePreviews } from '@/api/profiles';
import { BusinessCard, EventCard, NewsCard, PersonCard } from '@/components/discover/cards';
import { DiscoverSection } from '@/components/discover/section';
import { LocationPill } from '@/components/location-pill';
import { Chip } from '@/components/ui/chip';
import { TextField } from '@/components/ui/text-field';
import { Icon } from '@/components/ui/icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useResource } from '@/hooks/use-resource';
import { useTabInsets } from '@/hooks/use-tab-insets';
import { useTheme } from '@/hooks/use-theme';
import { fullName, localFirst } from '@/lib/format';
import { useLocation } from '@/providers/location-provider';

type Category = 'all' | 'people' | 'places' | 'events' | 'news';
const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'people', label: 'People' },
  { value: 'places', label: 'Businesses' },
  { value: 'events', label: 'Events' },
  { value: 'news', label: 'News' },
];

const has = (text: string | null | undefined, q: string) => !q || (text ?? '').toLowerCase().includes(q);

export default function ExploreScreen() {
  const theme = useTheme();
  const insets = useTabInsets();
  const { place } = useLocation();
  const city = place?.city ?? null;
  const [category, setCategory] = useState<Category>('all');
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const people = useResource('explore:people', getProfilePreviews);
  const businesses = useResource('explore:business', getBusinesses);
  const events = useResource(city ? `explore:events:${city}` : null, () => getEvents(city ?? ''));
  const news = useResource(city ? `explore:news:${city}` : null, () => getNews(city ?? ''));

  const reloadAll = () => {
    people.reload();
    businesses.reload();
    events.reload();
    news.reload();
  };
  const refreshing = people.refreshing || businesses.refreshing || events.refreshing || news.refreshing;

  const peopleItems = localFirst(
    (people.data ?? []).filter((p) => has(fullName(p.user), q) || has(p.bio, q) || has(p.location, q)),
    (p) => p.location,
    city,
  );
  const businessItems = localFirst(
    (businesses.data ?? []).filter((b) => has(b.name, q) || has(b.business_description, q) || has(b.location_town, q)),
    (b) => b.location_town,
    city,
  );
  const eventItems = (events.data ?? []).filter((e) => has(e.title, q) || has(e.description, q) || has(e.location, q));
  const newsItems = (news.data ?? []).filter((a) => has(a.title, q) || has(a.description, q));

  const show = (c: Category) => category === 'all' || category === c;
  const expanded = category !== 'all';
  const where = city ? ` in ${city}` : '';

  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom, gap: Spacing.four }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reloadAll} tintColor={theme.link} colors={[theme.primary]} progressViewOffset={insets.top} />}>
      <View style={[styles.header]}>
        <ThemedText type="headline">Explore</ThemedText>
        <LocationPill />
        <TextField
          icon="search"
          value={query}
          onChangeText={setQuery}
          placeholder="Search people, businesses, events…"
          returnKeyType="search"
          autoCorrect={false}
          right={
            query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Clear search">
                <Icon name="close" size={18} color="textTertiary" />
              </Pressable>
            ) : undefined
          }
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={{ flexGrow: 0 }}>
        {CATEGORIES.map((c) => (
          <Chip key={c.value} label={c.label} selected={category === c.value} onPress={() => setCategory(c.value)} />
        ))}
      </ScrollView>

      {show('people') ? (
        <DiscoverSection
          title="People"
          subtitle={city ? `Neighbours first, starting with ${city}` : 'Neighbours to meet'}
          icon="people"
          resource={people}
          items={peopleItems}
          keyOf={(p) => String(p.id)}
          render={(p, full) => <PersonCard person={p} width={full ? '100%' : 190} />}
          emptyText={q ? 'No people match your search.' : 'No one to show yet.'}
          expanded={expanded}
        />
      ) : null}
      {show('places') ? (
        <DiscoverSection
          title="Local businesses"
          subtitle={city ? `Starting with ${city}` : undefined}
          icon="store"
          resource={businesses}
          items={businessItems}
          keyOf={(b) => String(b.id)}
          render={(b, full) => <BusinessCard business={b} width={full ? '100%' : 250} />}
          emptyText={q ? 'No businesses match your search.' : 'No businesses listed yet.'}
          expanded={expanded}
        />
      ) : null}
      {show('events') ? (
        <DiscoverSection
          title={`Events${where}`}
          icon="calendar"
          resource={events}
          items={eventItems}
          keyOf={(e) => String(e.id)}
          render={(e, full) => <EventCard event={e} width={full ? '100%' : 250} />}
          emptyText={q ? 'No events match your search.' : `No events${where} right now.`}
          expanded={expanded}
          enabled={!!city}
          disabledText="Choose a location to see events near you."
        />
      ) : null}
      {show('news') ? (
        <DiscoverSection
          title={`Local news${where}`}
          icon="news"
          resource={news}
          items={newsItems}
          keyOf={(a, i) => a.url ?? String(i)}
          render={(a, full) => <NewsCard article={a} width={full ? '100%' : 250} />}
          emptyText={q ? 'No articles match your search.' : `No local news${where} right now.`}
          expanded={expanded}
          enabled={!!city}
          disabledText="Choose a location to see local news."
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.three, gap: Spacing.three },
  chips: { paddingHorizontal: Spacing.three, gap: Spacing.two },
});
