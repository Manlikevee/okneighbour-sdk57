import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import type { PostMedia as Media } from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mediaUrl } from '@/lib/media';

type Item = { key: string; kind: 'image' | 'video'; uri: string };

function toItems(media: Media[]): Item[] {
  const out: Item[] = [];
  media.forEach((m, i) => {
    const key = String(m.id ?? i);
    if (m.is_video && m.video) {
      const uri = mediaUrl(m.video);
      if (uri) out.push({ key, kind: 'video', uri });
    } else {
      const uri = mediaUrl(m.image);
      if (uri) out.push({ key, kind: 'image', uri });
    }
  });
  return out;
}

function VideoItem({ uri, width, height }: { uri: string; width: number; height: number }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });
  return <VideoView player={player} style={{ width, height }} nativeControls contentFit="contain" />;
}

export function PostMedia({ media }: { media?: Media[] }) {
  const theme = useTheme();
  const items = toItems(media ?? []);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  if (items.length === 0) return null;
  const height = Math.round(width * 0.75);

  return (
    <View style={[styles.wrap, { backgroundColor: theme.backgroundElement }]} onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))}>
      {width > 0 ? (
        <FlatList
          data={items}
          keyExtractor={(i) => i.key}
          horizontal
          pagingEnabled
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
          style={{ height }}
          renderItem={({ item }) =>
            item.kind === 'video' ? (
              <VideoItem uri={item.uri} width={width} height={height} />
            ) : (
              <Image source={{ uri: item.uri }} style={{ width, height }} contentFit="cover" transition={220} recyclingKey={item.uri} accessibilityLabel="Post photo" />
            )
          }
        />
      ) : (
        <View style={{ height: 220 }} />
      )}
      {items.length > 1 && width > 0 ? (
        <>
          <View style={styles.counter} pointerEvents="none">
            <ThemedText type="caption" style={{ color: '#F4F8EE' }}>
              {index + 1}/{items.length}
            </ThemedText>
          </View>
          <View style={styles.dots} pointerEvents="none">
            {items.map((it, i) => (
              <View key={it.key} style={[styles.dot, { backgroundColor: i === index ? '#FFFFFF' : 'rgba(255,255,255,0.5)', width: i === index ? 16 : 6 }]} />
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: Radius.md, overflow: 'hidden' },
  counter: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(8,24,17,0.65)', borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  dots: { position: 'absolute', bottom: 10, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot: { height: 6, borderRadius: 3 },
});
