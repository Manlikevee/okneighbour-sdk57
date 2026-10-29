
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Image as RNImage,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import type { PostMedia as Media } from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { mediaUrl } from '@/lib/media';

type Item = {
  key: string;
  kind: 'image' | 'video';
  uri: string;
};

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

function VideoItem({
  uri,
  width,
  height,
}: {
  uri: string;
  width: number;
  height: number;
}) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });

  return (
    <VideoView
      player={player}
      style={{ width, height }}
      nativeControls
      contentFit="contain"
    />
  );
}

export function PostMedia({
  media,
  fullview = false,
}: {
  media?: Media[];
  fullview?: boolean;
}) {
  const theme = useTheme();
  const { width: screenWidth, height: screenHeight } =
    useWindowDimensions();

  const items = toItems(media ?? []);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [imageSizes, setImageSizes] = useState<
    Record<string, { width: number; height: number }>
  >({});

  useEffect(() => {
    items.forEach((item) => {
      if (item.kind !== 'image' || imageSizes[item.uri]) return;

      RNImage.getSize(
        item.uri,
        (imageWidth, imageHeight) => {
          if (imageWidth > 0 && imageHeight > 0) {
            setImageSizes((previous) => ({
              ...previous,
              [item.uri]: {
                width: imageWidth,
                height: imageHeight,
              },
            }));
          }
        },
        () => {
          // Keep the fallback layout if image dimensions cannot be loaded.
        },
      );
    });
  }, [items, imageSizes]);

  if (items.length === 0) return null;

  const availableWidth = width || screenWidth;
  const maxHeight = screenHeight;

  const getMediaHeight = (item: Item) => {
    if (!fullview) {
      return Math.round(availableWidth * 0.75);
    }

    if (item.kind === 'image') {
      const size = imageSizes[item.uri];

      if (size) {
        const aspectRatio = size.width / size.height;

        return Math.min(
          maxHeight,
          Math.round(availableWidth / aspectRatio),
        );
      }
    }

    // Fallback for videos or images whose dimensions are not yet known.
    return maxHeight;
  };

  const activeItem = items[index] ?? items[0];
  const containerHeight = getMediaHeight(activeItem);

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.backgroundElement,
          height: fullview ? containerHeight : undefined,
        },
      ]}
      onLayout={(e) =>
        setWidth(Math.round(e.nativeEvent.layout.width))
      }
    >
      {width > 0 ? (
        <FlatList
          data={items}
          keyExtractor={(item) => item.key}
          horizontal
          pagingEnabled
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, i) => ({
            length: width,
            offset: width * i,
            index: i,
          })}
          onMomentumScrollEnd={(e) => {
            const nextIndex = Math.round(
              e.nativeEvent.contentOffset.x / width,
            );
            setIndex(nextIndex);
          }}
          style={{
            height: fullview
              ? containerHeight
              : Math.round(width * 0.75),
          }}
          renderItem={({ item }) => {
            const itemHeight = getMediaHeight(item);

            return (
              <View
                style={{
                  width,
                  height: itemHeight,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.kind === 'video' ? (
                  <VideoItem
                    uri={item.uri}
                    width={width}
                    height={itemHeight}
                  />
                ) : (
                  <Image
                    source={{ uri: item.uri }}
                    style={{
                      width,
                      height: itemHeight,
                    }}
                    contentFit={fullview ? 'contain' : 'cover'}
                    transition={220}
                    recyclingKey={item.uri}
                    accessibilityLabel="Post photo"
                  />
                )}
              </View>
            );
          }}
        />
      ) : (
        <View
          style={{
            height: fullview ? containerHeight : 220,
          }}
        />
      )}

      {items.length > 1 && width > 0 ? (
        <>
          <View style={styles.counter} pointerEvents="none">
            <ThemedText
              type="caption"
              style={{ color: '#F4F8EE' }}
            >
              {index + 1}/{items.length}
            </ThemedText>
          </View>

          <View style={styles.dots} pointerEvents="none">
            {items.map((item, i) => (
              <View
                key={item.key}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i === index
                        ? '#FFFFFF'
                        : 'rgba(255,255,255,0.5)',
                    width: i === index ? 16 : 6,
                  },
                ]}
              />
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  counter: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(8,24,17,0.65)',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dots: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
