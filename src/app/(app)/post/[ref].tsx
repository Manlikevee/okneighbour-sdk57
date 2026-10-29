import { useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getErrorMessage } from '@/api/client';
import { addComment, getPost } from '@/api/posts';
import type { Comment } from '@/api/types';
import { CommentRow } from '@/components/feed/comment-row';
import { PostCard } from '@/components/feed/post-card';
import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { Skeleton, PostSkeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/state-views';
import { ThemedText } from '@/components/themed-text';
import { Font, Radius, Spacing } from '@/constants/theme';
import { useHeaderOffset } from '@/hooks/use-header-offset';
import { useResource } from '@/hooks/use-resource';
import { useTheme } from '@/hooks/use-theme';
import { fullName, plural } from '@/lib/format';
import { showToast } from '@/lib/toast';
import { useSession } from '@/providers/session-provider';

export default function PostScreen() {
  const { ref } = useLocalSearchParams<{ ref: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const offset = useHeaderOffset();
  const { profile, claims } = useSession();
  const post = useResource(ref ? `post:${ref}` : null, () => getPost(String(ref)));
  const [added, setAdded] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const input = useRef<TextInput>(null);

  const me = profile?.user ?? { first_name: claims?.first_name, last_name: claims?.last_name, username: claims?.username };
  const comments = [...(post.data?.comments ?? []), ...added];

  const send = async () => {
    const content = text.trim();
    if (!content || sending || !ref) return;
    setSending(true);
    try {
      const created = await addComment(String(ref), content);
      // Use the server's comment when it has an author; otherwise show it as ours.
      const comment: Comment = created?.user ? created : { content, posted_at: new Date().toISOString(), user: { ...me, profile: { profile_picture: profile?.profile_picture, profile_ref: profile?.profile_ref } } };
      setAdded((cur) => [...cur, comment]);
      setText('');
    } catch (e) {
      showToast(getErrorMessage(e, 'Couldn’t post your comment. Please try again.'), 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={offset} style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={post.refreshing}
            onRefresh={() => {
              setAdded([]);
              post.reload();
            }}
            tintColor={theme.link}
            colors={[theme.primary]}
          />
        }>
        {post.loading ? (
          <PostSkeleton />
        ) : post.error && !post.data ? (
          <ErrorState message={post.error} onRetry={post.reload} />
        ) : post.data ? (
          <>
            <PostCard post={post.data} openable={false} fullview />
            <View style={styles.commentsHead}>
              <ThemedText type="subtitle" style={{ fontSize: 19 }} accessibilityRole="header">
                Comments
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {plural(comments.length, 'reply', 'replies')}
              </ThemedText>
            </View>
            {comments.length === 0 ? (
              <EmptyState compact icon="comment" title="Start the conversation" message="Be the first to reply to this post." />
            ) : (
              <View style={{ gap: Spacing.three }}>
                {comments.map((c, i) => (
                  <CommentRow key={c.id ?? `${c.posted_at}-${i}`} comment={c} />
                ))}
              </View>
            )}
          </>
        ) : (
          <Skeleton height={120} />
        )}
      </ScrollView>

      {post.data ? (
        <View style={[styles.composer, { backgroundColor: theme.surface, borderTopColor: theme.border, paddingBottom: Math.max(insets.bottom, Spacing.two + 2) }]}>
          <Avatar uri={profile?.profile_picture} name={fullName(me)} size={36} />
          <TextInput
            ref={input}
            value={text}
            onChangeText={setText}
            placeholder="Write a reply…"
            placeholderTextColor={theme.textTertiary}
            selectionColor={theme.primary}
            multiline
            maxLength={500}
            accessibilityLabel="Write a reply"
            style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
          />
          <Pressable
            onPress={send}
            disabled={!text.trim() || sending}
            accessibilityRole="button"
            accessibilityLabel="Send reply"
            style={[styles.send, { backgroundColor: theme.primary, opacity: !text.trim() ? 0.4 : 1 }]}>
            {sending ? <ActivityIndicator size="small" color={theme.onPrimary} /> : <Icon name="send" size={17} color="onPrimary" />}
          </Pressable>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.four },
  commentsHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: Spacing.two },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.two + 2, paddingHorizontal: Spacing.three, paddingTop: Spacing.two + 2, borderTopWidth: StyleSheet.hairlineWidth },
  input: { flex: 1, maxHeight: 110, minHeight: 40, borderRadius: Radius.lg, paddingHorizontal: Spacing.three, paddingTop: 10, paddingBottom: 10, fontFamily: Font.body, fontSize: 16 },
  send: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
