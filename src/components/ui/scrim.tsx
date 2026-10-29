import { StyleSheet, View } from 'react-native';

/** Bottom-weighted dark gradient for text over photos. Place absolutely inside an image container. */
export function Scrim({ strength = 0.72 }: { strength?: number }) {
  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { experimental_backgroundImage: `linear-gradient(180deg, rgba(8,24,17,0) 35%, rgba(8,24,17,${strength}) 100%)` },
      ]}
    />
  );
}
