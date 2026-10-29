import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View, type DimensionValue } from 'react-native';

import type { Article, Business, EventItem, ProfilePreview } from '@/api/types';
import { Avatar } from '@/components/ui/avatar';
import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Scrim } from '@/components/ui/scrim';
import { ThemedText } from '@/components/themed-text';
import { Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { openLink } from '@/lib/browser';
import { fullName } from '@/lib/format';
import { mediaUrl } from '@/lib/media';

type W = { width?: DimensionValue };

function Cover({ uri, fallback, height = 130 }: { uri?: string | null; fallback: IconName; height?: number }) {
  const theme = useTheme();
  const src = mediaUrl(uri);
  return (
    <View style={[styles.cover, { height, backgroundColor: theme.forest }]}>
      {src ? (
        <Image source={{ uri: src }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} recyclingKey={src} />
      ) : (
        <View style={styles.coverFallback}>
          <Icon name={fallback} size={34} tint={theme.primary} />
        </View>
      )}
      <Scrim strength={0.35} />
    </View>
  );
}

function Tag({ icon, text }: { icon: IconName; text: string }) {
  const theme = useTheme();
  return (
    <View style={styles.tag}>
      <Icon name={icon} size={13} color="textTertiary" />
      <ThemedText type="caption" numberOfLines={1} style={{ flexShrink: 1, color: theme.textSecondary }}>
        {text}
      </ThemedText>
    </View>
  );
}

export function BusinessCard({ business, width = 250 }: { business: Business } & W) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { width, backgroundColor: theme.surface, borderColor: theme.border, boxShadow: Shadow.card }]} accessible accessibilityLabel={`${business.name ?? 'Business'}, ${business.location_town ?? ''}`}>
      <Cover uri={business.cover_photo} fallback="store" />
      <View style={styles.body}>
        <ThemedText type="heading" numberOfLines={1}>
          {business.name ?? 'Local business'}
        </ThemedText>
        {business.location_town ? <Tag icon="location" text={business.location_town} /> : null}
        {business.business_description ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
            {business.business_description}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

export function EventCard({ event, width = 250 }: { event: EventItem } & W) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { width, backgroundColor: theme.surface, borderColor: theme.border, boxShadow: Shadow.card }]} accessible accessibilityLabel={`Event: ${event.title ?? ''}, ${event.location ?? ''}`}>
      <Cover uri={event.cover_image} fallback="calendar" />
      <View style={[styles.badge, { backgroundColor: theme.warningSoft }]}>
        <Icon name="calendar" size={13} tint={theme.warning} />
        <ThemedText type="caption" style={{ color: theme.warning, fontFamily: 'Inter_700Bold' }}>
          Event
        </ThemedText>
      </View>
      <View style={styles.body}>
        <ThemedText type="heading" numberOfLines={2}>
          {event.title ?? 'Local event'}
        </ThemedText>
        {event.location ? <Tag icon="location" text={event.location} /> : null}
        {event.description ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
            {event.description}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

export function NewsCard({ article, width = 250 }: { article: Article } & W) {
  const theme = useTheme();
  const url = article.url;
  return (
    <PressableScale
      disabled={!url}
      onPress={() => url && void openLink(url)}
      accessibilityRole="link"
      accessibilityLabel={`${article.title ?? 'Article'}${article.source?.name ? `, from ${article.source.name}` : ''}`}
      style={[styles.card, { width, backgroundColor: theme.surface, borderColor: theme.border, boxShadow: Shadow.card }]}>
      <Cover uri={article.urlToImage} fallback="news" />
      <View style={styles.body}>
        <ThemedText type="eyebrow" style={{ color: theme.link }} numberOfLines={1}>
          {article.source?.name ?? 'News'}
        </ThemedText>
        <ThemedText type="heading" numberOfLines={3} style={{ fontSize: 16, lineHeight: 22 }}>
          {article.title}
        </ThemedText>
      </View>
    </PressableScale>
  );
}

/** Only people with a completed profile (a photo) can be opened, as in the previous app. */
export function PersonCard({ person, width = 190 }: { person: ProfilePreview } & W) {
  const theme = useTheme();
  const name = fullName(person.user);
  const active = !!person.profile_picture && !!person.profile_ref;
  return (
    <PressableScale
      disabled={!active}
      onPress={() => person.profile_ref && router.push({ pathname: '/u/[ref]', params: { ref: person.profile_ref } })}
      accessibilityRole={active ? 'button' : 'text'}
      accessibilityLabel={active ? `${name}, view profile` : `${name}, profile not active yet`}
      style={[styles.person, { width, backgroundColor: theme.surface, borderColor: theme.border, boxShadow: Shadow.card }]}>
      <Avatar uri={person.profile_picture} name={name} size={64} />
      <ThemedText type="heading" numberOfLines={1} style={styles.centerText}>
        {name}
      </ThemedText>
      {person.location ? <Tag icon="location" text={person.location} /> : null}
      <ThemedText type="small" themeColor="textSecondary" numberOfLines={2} style={styles.centerText}>
        {active ? (person.bio ?? ' ') : 'Hasn’t finished setting up yet'}
      </ThemedText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.lg, borderWidth: 1, overflow: 'hidden' },
  cover: { width: '100%', overflow: 'hidden' },
  coverFallback: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  body: { padding: Spacing.three - 2, gap: 6 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badge: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  person: { borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.three, alignItems: 'center', gap: 6 },
  centerText: { textAlign: 'center' },
});
