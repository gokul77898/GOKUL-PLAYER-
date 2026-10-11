/**
 * ArtworkImage.tsx — Cinematic album artwork component.
 * Displays local album artwork with subtle 2.5D specular bevel,
 * ambient drop shadow and bespoke GOKUL geometric placeholder fallback.
 */
import React, {useState, useMemo} from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  ViewStyle,
  StyleProp,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Music, Disc} from 'lucide-react-native';
import {Track} from '../types';
import {useTheme} from '../hooks/useTheme';
import {radii} from '../theme';

// Harmonic gradient palettes derived from track title
const ART_GRADIENTS = [
  ['#8055FF', '#3878FF'], // Electric Violet -> Azure
  ['#B59AFF', '#8055FF'], // Soft Violet -> Deep Violet
  ['#7047F5', '#FF4785'], // Purple -> Rose
  ['#3878FF', '#00D2B4'], // Azure -> Teal
  ['#6A11CB', '#2575FC'], // Deep Indigo -> Neon Blue
  ['#8A2387', '#E94057'], // Plum -> Crimson
  ['#4776E6', '#8E54E9'], // Royal Blue -> Lavender
  ['#7F00FF', '#E100FF'], // Violet -> Fuchsia
];

function hashToGradient(str: string): [string, string] {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  const idx = Math.abs(h) % ART_GRADIENTS.length;
  return ART_GRADIENTS[idx] as [string, string];
}

interface Props {
  track: Track;
  size?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  showShadow?: boolean;
}

export function ArtworkImage({
  track,
  size = 56,
  radius = radii.lg,
  style,
  showShadow = false,
}: Props) {
  const theme = useTheme();
  const [hasError, setHasError] = useState(false);
  const gradient = useMemo(() => hashToGradient(track.title), [track.title]);

  const shadowStyle = showShadow
    ? {
        shadowColor: gradient[0],
        shadowOffset: {width: 0, height: 10},
        shadowOpacity: theme.dark ? 0.45 : 0.25,
        shadowRadius: 20,
        elevation: 12,
      }
    : null;

  const content = track.artwork && !hasError ? (
    <View style={[{width: size, height: size, borderRadius: radius, overflow: 'hidden'}]}>
      <Image
        source={{uri: track.artwork}}
        style={{width: size, height: size, borderRadius: radius}}
        onError={() => setHasError(true)}
        resizeMode="cover"
      />
      {/* Specular glass sheen on artwork */}
      <View
        style={[
          styles.artworkBevel,
          {
            borderRadius: radius,
            borderColor: theme.dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.40)',
          },
        ]}
        pointerEvents="none"
      />
    </View>
  ) : (
    <LinearGradient
      colors={gradient}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={[
        {width: size, height: size, borderRadius: radius},
        styles.placeholder,
      ]}>
      {size > 70 ? (
        <Disc size={size * 0.38} color="#FFFFFF" strokeWidth={1.8} />
      ) : (
        <Music size={size * 0.42} color="#FFFFFF" strokeWidth={1.8} />
      )}
      <View
        style={[
          styles.artworkBevel,
          {
            borderRadius: radius,
            borderColor: 'rgba(255,255,255,0.25)',
          },
        ]}
        pointerEvents="none"
      />
    </LinearGradient>
  );

  return (
    <View
      style={[
        {width: size, height: size, borderRadius: radius},
        shadowStyle,
        style,
      ]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  artworkBevel: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
  },
});

export default ArtworkImage;
