import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import type { Post } from '@/api/types';
import { PostMedia } from '@/components/feed/post-media';
import { RichText } from '@/components/feed/rich-text';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Avatar } from '@/components/ui/avatar';
import { ThemedText } from '@/components/themed-text';
import { Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fullName, timeAgo } from '@/lib/format';

type Props = {
  post: Post;
  /** When set the whole card opens the post. Omit on the detail screen. */
  openable?: boolean;
  index?: number;
  /** Hide the author row (e.g. on a profile where the author is obvious). */
  hideAuthor?: boolean;
  fullview?: boolean;
};

export function PostCard({ post, openable = true, index = 0, hideAuthor, fullview }: Props) {
  const theme = useTheme();
  const name = fullName(post.user);
  const profileRef = post.user?.profile?.profile_ref;
  const likes = Array.isArray(post.likes) ? post.likes.length : 0;
  const comments = Array.isArray(post.comments) ? post.comments.length : null;
  const time = timeAgo(post.posted_at);

  const openPost = () => router.push({ pathname: '/post/[ref]', params: { ref: post.ref } });
  const openProfile = () => {
    if (profileRef) router.push({ pathname: '/u/[ref]', params: { ref: profileRef } });
  };

  const card = (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, boxShadow: Shadow.card }]}>
      {hideAuthor ? null : (
        <PressableScale
          disabled={!profileRef}
          onPress={openProfile}
          scaleTo={0.99}
          accessibilityRole={profileRef ? 'button' : 'text'}
          accessibilityLabel={`${name}${profileRef ? ', view profile' : ''}`}
          style={styles.author}>
          <Avatar uri={post.user?.profile?.profile_picture} name={name} size={44} />
          <View style={{ flex: 1 }}>
            <ThemedText type="heading" numberOfLines={1} style={{ fontSize: 16, lineHeight: 22 }}>
              {name}
            </ThemedText>
            <ThemedText type="caption" numberOfLines={1}>
              {post.user?.username ? `@${post.user.username}` : ''}
              {post.user?.username && time ? '  ·  ' : ''}
              {time}
            </ThemedText>
          </View>
        </PressableScale>
      )}

      <RichText html={post.content} />
      <PostMedia media={post.images} fullview={fullview} />

      <View style={styles.footer}>
        <View style={styles.stat} accessible accessibilityLabel={`${likes} likes`}>
          <Icon name="heart" size={16} color="textTertiary" />
          <ThemedText type="small" themeColor="textSecondary">
            {likes}
          </ThemedText>
        </View>
        <View style={styles.stat} accessible accessibilityLabel={comments === null ? 'Comments' : `${comments} comments`}>
          <Icon name="comment" size={16} color="textTertiary" />
          <ThemedText type="small" themeColor="textSecondary">
            {comments === null ? (openable ? 'Discuss' : 'Comments') : comments}
          </ThemedText>
        </View>
        <View style={{ flex: 1 }} />
        {post.location ? (
          <View style={[styles.location, { backgroundColor: theme.primarySoft }]} accessible accessibilityLabel={`Posted in ${post.location}`}>
            <Icon name="location" size={13} tint={theme.onPrimarySoft} />
            <ThemedText type="caption" style={{ color: theme.onPrimarySoft }} numberOfLines={1}>
              {post.location}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </View>
  );

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 50).duration(320)}>
      {openable ? (
        <PressableScale onPress={openPost} scaleTo={0.985} accessibilityRole="button" accessibilityLabel={`Open post by ${name}`}>
          {card}
        </PressableScale>
      ) : (
        card
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.three, gap: Spacing.three - 2 },
  author: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  location: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill, maxWidth: 160 },
});
