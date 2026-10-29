import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { getPosts } from '@/api/posts';
import type { Post } from '@/api/types';
import { ComposerPrompt } from '@/components/feed/composer-prompt';
import { PostCard } from '@/components/feed/post-card';
import { LocationPill } from '@/components/location-pill';
import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { FeedSkeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/state-views';
import { ThemedText } from '@/components/themed-text';
import { Radius, Shadow, Spacing } from '@/constants/theme';
import { useResource } from '@/hooks/use-resource';
import { useTabInsets } from '@/hooks/use-tab-insets';
import { useTheme } from '@/hooks/use-theme';
import { fullName, greeting } from '@/lib/format';
import { useLocation } from '@/providers/location-provider';
import { useSession } from '@/providers/session-provider';

type Scope = 'local' | 'all';

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useTabInsets();
  const { claims, profile, refreshProfile } = useSession();
  const { place, resolving } = useLocation();
  const [scope, setScope] = useState<Scope>('local');

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const city = place?.city ?? null;
  const key = scope === 'all' ? 'posts:all' : city ? `posts:${city}` : null;
  const feed = useResource<Post[]>(key, () => getPosts(scope === 'all' ? null : city), { watchContent: true });
  const name = fullName(profile?.user ?? { first_name: claims?.first_name, username: claims?.username });
  const firstName = claims?.first_name || profile?.user?.first_name;

  const header = (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={{ flex: 1, gap: Spacing.one }}>
          <ThemedText type="eyebrow">
            {greeting()}
            {firstName ? `, ${firstName}` : ''}
          </ThemedText>
          <LocationPill />
        </View>
        <PressableScale onPress={() => router.navigate('/profile')} accessibilityRole="button" accessibilityLabel="Your profile">
          <Avatar uri={profile?.profile_picture} name={name} size={46} />
        </PressableScale>
      </View>
      <SegmentedControl<Scope>
        value={scope}
        onChange={setScope}
        options={[
          { value: 'local', label: city ? `In ${city}` : 'Near me' },
          { value: 'all', label: 'Everywhere' },
        ]}
      />
      <ComposerPrompt />
    </View>
  );

  let empty = null;
  if (scope === 'local' && !city) {
    empty = resolving ? (
      <FeedSkeleton />
    ) : (
      <EmptyState icon="location" title="Where are you?" message="Choose your area and we’ll show you what’s happening nearby." actionLabel="Choose location" onAction={() => router.push('/location')} />
    );
  } else if (feed.loading) {
    empty = <FeedSkeleton slow={feed.slow} />;
  } else if (feed.error && !feed.data) {
    empty = <ErrorState message={feed.error} onRetry={feed.reload} />;
  } else if (feed.data && feed.data.length === 0) {
    empty = (
      <EmptyState
        icon="sparkles"
        title={scope === 'local' ? `Quiet in ${city} so far` : 'Nothing here yet'}
        message="Be the first to share an update, a question or something good."
        actionLabel="Write a post"
        onAction={() => router.push('/compose')}
      />
    );
  }

  return (
    <View style={styles.flex}>
      <FlatList
        data={feed.data ?? []}
        keyExtractor={(p, i) => p.ref ?? String(i)}
        renderItem={({ item, index }) => <PostCard post={item} index={index} />}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.three }} />}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 56, paddingHorizontal: Spacing.three }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={feed.refreshing} onRefresh={feed.reload} tintColor={theme.link} colors={[theme.primary]} progressViewOffset={insets.top} />}
      />

      <Animated.View entering={FadeInUp.delay(400).springify()} style={[styles.fabWrap, { bottom: insets.floating }]} pointerEvents="box-none">
        <PressableScale
          onPress={() => router.push('/compose')}
          accessibilityRole="button"
          accessibilityLabel="Write a post"
          style={[styles.fab, { backgroundColor: theme.primary, boxShadow: Shadow.raised }]}>
          <Icon name="add" size={20} color="onPrimary" />
          <ThemedText type="heading" themeColor="onPrimary" style={{ fontSize: 16 }}>
            Post
          </ThemedText>
        </PressableScale>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { gap: Spacing.three, paddingBottom: Spacing.three },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  fabWrap: { position: 'absolute', right: Spacing.three },
  fab: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 52, paddingHorizontal: Spacing.four - 4, borderRadius: Radius.pill },
});
