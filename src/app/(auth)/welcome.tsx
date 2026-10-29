import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Extrapolation, FadeInDown, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/ui/brand-mark';
import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/providers/session-provider';

const SLIDES = [
  { image: require('@/assets/onboarding/welcome-1.jpg'), title: 'Meet your neighbours', body: 'Connect with the people around you and build a community that feels like home.' },
  { image: require('@/assets/onboarding/welcome-2.jpg'), title: 'Stay in the loop', body: 'Local updates, news and notices from your area, the moment they matter.' },
  { image: require('@/assets/onboarding/welcome-3.jpg'), title: 'Never miss out', body: 'Find markets, meetups and events happening near you this week.' },
  { image: require('@/assets/onboarding/welcome-4.jpg'), title: 'Share what’s on your mind', body: 'Post updates, photos and ideas with the people who live closest to you.' },
  { image: require('@/assets/onboarding/welcome-5.jpg'), title: 'Back local business', body: 'Discover independent shops and services in your town and keep it thriving.' },
];

function Dot({ index, scrollX, width }: { index: number; scrollX: SharedValue<number>; width: number }) {
  const theme = useTheme();
  const style = useAnimatedStyle(() => {
    const p = interpolate(scrollX.get(), [(index - 1) * width, index * width, (index + 1) * width], [0, 1, 0], Extrapolation.CLAMP);
    return { width: 8 + 22 * p, opacity: 0.3 + 0.7 * p };
  });
  return <Animated.View style={[styles.dot, { backgroundColor: theme.link }, style]} />;
}

export default function WelcomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { welcomeSeen, rememberWelcomeSeen } = useSession();
  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.set(e.contentOffset.x);
  });

  // Returning visitors skip the intro.
  if (welcomeSeen) return <Redirect href="/login" />;

  const imageHeight = Math.min(height * 0.42, 380);
  const go = (path: '/register' | '/login') => {
    rememberWelcomeSeen();
    router.push(path);
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.background, paddingTop: insets.top + Spacing.three }]}>
      <View style={styles.brand}>
        <BrandMark size={34} wordmark />
      </View>

      <Animated.FlatList
        data={SLIDES}
        keyExtractor={(s) => s.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.flex}
        renderItem={({ item }) => (
          <View style={{ width, paddingHorizontal: Spacing.four, gap: Spacing.four }}>
            <Image source={item.image} style={[styles.image, { height: imageHeight, backgroundColor: theme.backgroundElement }]} contentFit="cover" transition={250} accessibilityLabel={item.title} />
            <View style={{ gap: Spacing.two }}>
              <ThemedText type="display">{item.title}</ThemedText>
              <ThemedText themeColor="textSecondary">{item.body}</ThemedText>
            </View>
          </View>
        )}
      />

      <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {SLIDES.map((s, i) => (
          <Dot key={s.title} index={i} scrollX={scrollX} width={width} />
        ))}
      </View>

      <Animated.View entering={FadeInDown.delay(150).duration(400)} style={[styles.actions, { paddingBottom: insets.bottom + Spacing.three }]}>
        <Button title="Get started" size="lg" fullWidth onPress={() => go('/register')} iconRight="arrowRight" />
        <Button title="I already have an account" variant="ghost" fullWidth onPress={() => go('/login')} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  brand: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.three },
  image: { width: '100%', borderRadius: Radius.xl },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: Spacing.three },
  dot: { height: 8, borderRadius: 4 },
  actions: { paddingHorizontal: Spacing.four, gap: Spacing.one },
});
