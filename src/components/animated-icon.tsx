import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const DURATION = 650;
/** Must match the native splash background and image width in app.json (expo-splash-screen plugin). */
const SPLASH_BG = '#0E2A1D';
const SPLASH_IMAGE_WIDTH = 200;

const exitKeyframe = new Keyframe({
  0: { transform: [{ scale: 1 }], opacity: 1 },
  25: { opacity: 1 },
  100: { opacity: 0, transform: [{ scale: 1.25 }], easing: Easing.out(Easing.cubic) },
});

/**
 * Covers the app with the same artwork as the native splash, hides the native splash once laid out,
 * then fades away to reveal the app.
 */
export function AnimatedSplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const image = <Image style={styles.image} source={require('@/assets/images/splash-icon.png')} contentFit="contain" />;

  return animate ? (
    <Animated.View
      pointerEvents="none"
      entering={exitKeyframe.duration(DURATION).withCallback((finished) => {
        'worklet';
        if (finished) scheduleOnRN(setVisible, false);
      })}
      style={styles.overlay}>
      {image}
    </Animated.View>
  ) : (
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => setAnimate(true));
      }}
      style={styles.overlay}>
      {image}
    </View>
  );
}

const styles = StyleSheet.create({
  image: { width: SPLASH_IMAGE_WIDTH, height: SPLASH_IMAGE_WIDTH },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: SPLASH_BG, alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
});
