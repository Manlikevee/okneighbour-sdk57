import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getMyProfile, getProfileByRef } from '@/api/profiles';
import type { Post, ProfileResponse } from '@/api/types';
import { PostCard } from '@/components/feed/post-card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Scrim } from '@/components/ui/scrim';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { PostSkeleton, Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/state-views';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useResource } from '@/hooks/use-resource';
import { useTabInsets } from '@/hooks/use-tab-insets';
import { useTheme } from '@/hooks/use-theme';
import { loadAppearance, NEXT_APPEARANCE, saveAppearance, type AppearancePref } from '@/lib/appearance';
import { normalizeUrl, openLink } from '@/lib/browser';
import { fullName } from '@/lib/format';
import { mediaUrl } from '@/lib/media';
import { showToast } from '@/lib/toast';
import { useSession } from '@/providers/session-provider';

type Tab = 'posts' | 'media';
const APPEARANCE_ICON: Record<AppearancePref, IconName> = { system: 'auto', light: 'sun', dark: 'moon' };
const APPEARANCE_LABEL: Record<AppearancePref, string> = { system: 'System', light: 'Light', dark: 'Dark' };

/** `profileRef` omitted = the signed-in user's own profile (shown in the Profile tab). */
export function ProfileView({ profileRef }: { profileRef?: string }) {
  const theme = useTheme();
  const tabInsets = useTabInsets();
  const safe = useSafeAreaInsets();
  const { signOut } = useSession();
  const isMe = !profileRef;
  const res = useResource<ProfileResponse>(isMe ? 'profile:me' : `profile:${profileRef}`, () => (isMe ? getMyProfile() : getProfileByRef(String(profileRef))), { watchContent: true });
  const [tab, setTab] = useState<Tab>('posts');
  const [appearance, setAppearance] = useState<AppearancePref>('system');

  useEffect(() => {
    if (isMe) void loadAppearance().then(setAppearance);
  }, [isMe]);

  const profile = res.data?.profile;
  const user = profile?.user;
  const posts = res.data?.posts ?? [];
  const mediaPosts = posts.filter((p) => (p.images?.length ?? 0) > 0);
  const name = fullName(user);
  const topPad = isMe ? tabInsets.top : Spacing.three;

  const cycleAppearance = async () => {
    const next = NEXT_APPEARANCE[appearance];
    setAppearance(next);
    await saveAppearance(next);
    showToast(`Appearance: ${APPEARANCE_LABEL[next]}`, 'info');
  };

  const confirmSignOut = () =>
    Alert.alert('Log out of OkNeighbour?', 'You’ll need to log in again to see your neighbourhood.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => void signOut() },
    ]);

  const coverUri = mediaUrl(profile?.cover_photo);

  const header = (
    <View>
      <View style={[styles.cover, { backgroundColor: theme.forest, height: 150 + (isMe ? safe.top : 0), marginTop: isMe ? -tabInsets.top : -Spacing.three, marginHorizontal: -Spacing.three }]}>
        {coverUri ? <Image source={{ uri: coverUri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} /> : <View style={[styles.orb, { backgroundColor: theme.primary }]} />}
        <Scrim strength={0.3} />
        {isMe ? (
          <View style={[styles.coverActions, { top: safe.top + Spacing.two }]}>
            <IconButton icon={APPEARANCE_ICON[appearance]} label={`Appearance: ${APPEARANCE_LABEL[appearance]}. Tap to change`} size={40} onPress={cycleAppearance} />
            <IconButton icon="logout" label="Log out" size={40} onPress={confirmSignOut} />
          </View>
        ) : null}
      </View>

      <View style={styles.identity}>
        <View style={styles.avatarRow}>
          <Avatar uri={profile?.profile_picture} name={name} size={92} ring />
          {isMe ? <Button title="Edit profile" icon="edit" variant="secondary" size="sm" onPress={() => router.push('/edit-profile')} /> : null}
        </View>

        <View style={{ gap: 2 }}>
          <View style={styles.nameRow}>
            <ThemedText type="headline" style={{ fontSize: 26, lineHeight: 32, flexShrink: 1 }}>
              {name}
            </ThemedText>
            {profile?.is_verified ? <Icon name="seal" size={22} color="link" /> : null}
          </View>
          {user?.username ? <ThemedText themeColor="textSecondary">@{user.username}</ThemedText> : null}
        </View>

        {profile?.bio ? <ThemedText>{profile.bio}</ThemedText> : null}

        <View style={styles.meta}>
          <Meta icon="briefcase" text={profile?.profession} />
          <Meta icon="location" text={profile?.location} />
          {profile?.bio_url ? (
            <PressableScale onPress={() => void openLink(normalizeUrl(profile.bio_url ?? ''))} accessibilityRole="link" accessibilityLabel="Open website" style={styles.metaItem}>
              <Icon name="link" size={15} color="link" />
              <ThemedText type="small" themeColor="link" numberOfLines={1} style={{ flexShrink: 1 }}>
                {(profile.bio_url ?? '').replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </ThemedText>
            </PressableScale>
          ) : null}
        </View>

        <View style={[styles.stats, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ThemedText type="subtitle">{posts.length}</ThemedText>
          <ThemedText themeColor="textSecondary">{posts.length === 1 ? 'post' : 'posts'}</ThemedText>
        </View>

        <SegmentedControl<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'posts', label: 'Posts' },
            { value: 'media', label: 'Photos' },
          ]}
        />
      </View>
    </View>
  );

  let empty = null;
  if (res.loading) {
    empty = (
      <View style={{ gap: Spacing.three }}>
        <Skeleton height={90} radius={Radius.lg} />
        <PostSkeleton />
      </View>
    );
  } else if (res.error && !res.data) {
    empty = <ErrorState message={res.error} onRetry={res.reload} />;
  } else if ((tab === 'posts' ? posts : mediaPosts).length === 0) {
    empty = (
      <EmptyState
        compact
        icon={tab === 'posts' ? 'sparkles' : 'photo'}
        title={tab === 'posts' ? 'No posts yet' : 'No photos yet'}
        message={isMe ? 'Share something with your neighbours.' : `${user?.first_name ?? 'They'} hasn’t shared anything here yet.`}
        actionLabel={isMe ? 'Write a post' : undefined}
        onAction={isMe ? () => router.push('/compose') : undefined}
      />
    );
  }

  const data: Post[] = res.data ? (tab === 'posts' ? posts : mediaPosts) : [];

  return (
    <FlatList
      key={tab}
      data={data}
      keyExtractor={(p, i) => p.ref ?? String(i)}
      numColumns={tab === 'media' ? 3 : 1}
      columnWrapperStyle={tab === 'media' ? { gap: 4 } : undefined}
      renderItem={({ item, index }) =>
        tab === 'media' ? <MediaTile post={item} /> : <PostCard post={item} index={index} hideAuthor />
      }
      ItemSeparatorComponent={() => <View style={{ height: tab === 'media' ? 4 : Spacing.three }} />}
      ListHeaderComponent={header}
      ListHeaderComponentStyle={{ marginBottom: Spacing.three }}
      ListEmptyComponent={empty}
      contentContainerStyle={{ paddingTop: topPad, paddingBottom: isMe ? tabInsets.bottom : safe.bottom + Spacing.four, paddingHorizontal: Spacing.three }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={res.refreshing} onRefresh={res.reload} tintColor={theme.link} colors={[theme.primary]} progressViewOffset={isMe ? tabInsets.top : 0} />}
    />
  );
}

function Meta({ icon, text }: { icon: IconName; text?: string | null }) {
  if (!text) return null;
  return (
    <View style={styles.metaItem}>
      <Icon name={icon} size={15} color="textTertiary" />
      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1} style={{ flexShrink: 1 }}>
        {text}
      </ThemedText>
    </View>
  );
}

function MediaTile({ post }: { post: Post }) {
  const theme = useTheme();
  const first = post.images?.[0];
  const isVideo = !!first?.is_video;
  const uri = isVideo ? null : mediaUrl(first?.image);
  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/post/[ref]', params: { ref: post.ref } })}
      scaleTo={0.96}
      accessibilityRole="button"
      accessibilityLabel={isVideo ? 'Open video post' : 'Open photo post'}
      style={[styles.tile, { backgroundColor: theme.backgroundElement }]}>
      {uri ? <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} recyclingKey={uri} /> : <Icon name="play" size={24} color="textTertiary" />}
      {(post.images?.length ?? 0) > 1 ? (
        <View style={styles.multi}>
          <Icon name="photo" size={12} tint="#FFFFFF" />
        </View>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  cover: { overflow: 'hidden', justifyContent: 'flex-end' },
  orb: { position: 'absolute', width: 260, height: 260, borderRadius: 130, opacity: 0.14, top: -90, right: -60 },
  coverActions: { position: 'absolute', right: Spacing.three, flexDirection: 'row', gap: Spacing.two },
  identity: { gap: Spacing.three, marginTop: -46 },
  avatarRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  meta: { flexDirection: 'row', flexWrap: 'wrap', columnGap: Spacing.three, rowGap: Spacing.two },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5, maxWidth: '100%' },
  stats: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two, alignSelf: 'flex-start', paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: Radius.md, borderWidth: 1 },
  tile: { flex: 1, aspectRatio: 1, borderRadius: Radius.sm, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  multi: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(8,24,17,0.6)', borderRadius: 10, padding: 4 },
});
