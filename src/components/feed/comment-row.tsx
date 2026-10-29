import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import type { Comment } from '@/api/types';
import { RichText } from '@/components/feed/rich-text';
import { Avatar } from '@/components/ui/avatar';
import { PressableScale } from '@/components/ui/pressable-scale';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fullName, timeAgo } from '@/lib/format';

export function CommentRow({ comment }: { comment: Comment }) {
  const theme = useTheme();
  const name = fullName(comment.user);
  const ref = comment.user?.profile?.profile_ref;
  return (
    <View style={styles.row}>
      <PressableScale
        disabled={!ref}
        accessibilityLabel={`${name}’s profile`}
        onPress={() => ref && router.push({ pathname: '/u/[ref]', params: { ref } })}>
        <Avatar uri={comment.user?.profile?.profile_picture} name={name} size={36} />
      </PressableScale>
      <View style={[styles.bubble, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.head}>
          <ThemedText type="label" numberOfLines={1} style={{ flexShrink: 1 }}>
            {name}
          </ThemedText>
          <ThemedText type="caption">{timeAgo(comment.posted_at)}</ThemedText>
        </View>
        <RichText html={comment.content} size="sm" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.two + 2, alignItems: 'flex-start' },
  bubble: { flex: 1, borderRadius: Radius.md, borderTopLeftRadius: 6, borderWidth: 1, padding: Spacing.two + 4, gap: 4 },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
