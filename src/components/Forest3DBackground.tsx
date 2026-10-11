/**
 * Forest3DBackground.tsx — Cinematic 3D Nature Forest Animated Backdrop.
 * Delivers living 3D camera pan, floating bioluminescent/sunlight particles,
 * and atmospheric depth that powers the true Liquid Glass visual system.
 */
import React, {useEffect} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../hooks/useTheme';

const {width: W, height: H} = Dimensions.get('window');

// ─── Particle Specification ──────────────────────────────────────────────────
interface ParticleProps {
  index: number;
  isDark: boolean;
  startX: number;
  delay: number;
  size: number;
  duration: number;
}

function FloatingParticle({
  isDark,
  startX,
  delay,
  size,
  duration,
}: ParticleProps) {
  const progress = useSharedValue(0);
  const sway = useSharedValue(0);

  useEffect(() => {
    // Upward float animation with repeat
    progress.value = withRepeat(
      withSequence(
        withTiming(0, {duration: delay}),
        withTiming(1, {
          duration,
          easing: Easing.linear,
        }),
      ),
      -1,
      false,
    );

    // Horizontal sway animation
    sway.value = withRepeat(
      withSequence(
        withTiming(1, {duration: duration * 0.45, easing: Easing.inOut(Easing.quad)}),
        withTiming(-1, {duration: duration * 0.45, easing: Easing.inOut(Easing.quad)}),
      ),
      -1,
      true,
    );
  }, [progress, sway, delay, duration]);

  const animStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [H * 0.95, -20]);
    const opacity = interpolate(
      progress.value,
      [0, 0.15, 0.7, 1],
      [0, 0.85, 0.85, 0],
    );
    const translateX = startX + sway.value * 22;
    const scale = interpolate(progress.value, [0, 0.5, 1], [0.6, 1.2, 0.8]);

    return {
      opacity,
      transform: [
        {translateX},
        {translateY},
        {scale},
      ],
    };
  });

  const particleColor = isDark
    ? startX % 2 === 0
      ? 'rgba(100, 240, 255, 0.95)' // Cyan bioluminescence
      : 'rgba(190, 140, 255, 0.95)' // Electric Violet fairy spore
    : 'rgba(255, 230, 130, 0.90)'; // Warm golden sun mote

  const glowColor = isDark
    ? startX % 2 === 0
      ? 'rgba(70, 200, 255, 0.45)'
      : 'rgba(150, 90, 255, 0.45)'
    : 'rgba(255, 200, 80, 0.40)';

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: particleColor,
          shadowColor: glowColor,
        },
        animStyle,
      ]}
      pointerEvents="none"
    />
  );
}

// ─── Main 3D Forest Backdrop ─────────────────────────────────────────────────
interface Forest3DBackgroundProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  dimArtwork?: boolean;
}

export function Forest3DBackground({
  children,
  style,
  dimArtwork = false,
}: Forest3DBackgroundProps) {
  const theme = useTheme();

  // 3D Cinematic Camera Motion
  const camScale = useSharedValue(1);
  const camPanX = useSharedValue(0);
  const camPanY = useSharedValue(0);

  useEffect(() => {
    // Slow breathing 3D zoom (simulates slow drone push-in)
    camScale.value = withRepeat(
      withTiming(1.05, {
        duration: 12000,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    );

    // Subtle lateral 3D drift
    camPanX.value = withRepeat(
      withTiming(8, {
        duration: 16000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );

    // Subtle vertical 3D tilt/drift
    camPanY.value = withRepeat(
      withTiming(-10, {
        duration: 20000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, [camScale, camPanX, camPanY]);

  const camera3DStyle = useAnimatedStyle(() => ({
    transform: [
      {perspective: 1000},
      {scale: camScale.value},
      {translateX: camPanX.value},
      {translateY: camPanY.value},
    ],
  }));

  // Particles config for organic depth
  const particles = [
    {startX: W * 0.12, delay: 0, size: 5, duration: 8000},
    {startX: W * 0.28, delay: 1800, size: 7, duration: 10000},
    {startX: W * 0.45, delay: 3500, size: 4, duration: 7500},
    {startX: W * 0.62, delay: 900, size: 8, duration: 9200},
    {startX: W * 0.78, delay: 2400, size: 6, duration: 8600},
    {startX: W * 0.88, delay: 4200, size: 5, duration: 11000},
    {startX: W * 0.20, delay: 5000, size: 6, duration: 8200},
    {startX: W * 0.54, delay: 6200, size: 7, duration: 9500},
    {startX: W * 0.70, delay: 7100, size: 4, duration: 7800},
    {startX: W * 0.35, delay: 8400, size: 9, duration: 12000},
  ];

  return (
    <View style={[styles.rootContainer, style]}>
      {/* 3D Animated Image Canvas */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View style={[styles.cameraContainer, camera3DStyle]}>
          <Image
            source={
              theme.dark
                ? require('../../assets/nature_forest_dark.jpg')
                : require('../../assets/nature_forest_day.jpg')
            }
            style={styles.forestImage}
            resizeMode="cover"
          />
        </Animated.View>

        {/* ─── Glass Protective Readability Gradient ──────────────────────── */}
        <LinearGradient
          colors={
            theme.dark
              ? [
                  'rgba(8, 9, 13, 0.42)',
                  'rgba(8, 9, 13, 0.60)',
                  'rgba(8, 9, 13, 0.82)',
                ]
              : [
                  'rgba(255, 255, 255, 0.15)',
                  'rgba(245, 248, 254, 0.38)',
                  'rgba(235, 242, 252, 0.58)',
                ]
          }
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* ─── 3D Floating Bioluminescent Light Particles ─────────────────── */}
        {particles.map((p, i) => (
          <FloatingParticle
            key={i}
            index={i}
            isDark={theme.dark}
            startX={p.startX}
            delay={p.delay}
            size={p.size}
            duration={p.duration}
          />
        ))}

        {/* Ambient Top Light Beam Reflection */}
        <LinearGradient
          colors={
            theme.dark
              ? ['rgba(128, 85, 255, 0.18)', 'transparent']
              : ['rgba(255, 245, 180, 0.22)', 'transparent']
          }
          style={styles.topSunlightBeam}
        />
      </View>

      {/* Screen Interactive Content Mounted Over 3D Forest Glass */}
      <View style={styles.contentLayer}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#08090D',
  },
  cameraContainer: {
    ...StyleSheet.absoluteFillObject,
    // Add margin buffer for scale/pan without edge clipping
    top: -24,
    bottom: -24,
    left: -24,
    right: -24,
  },
  forestImage: {
    width: '100%',
    height: '100%',
  },
  contentLayer: {
    flex: 1,
  },
  topSunlightBeam: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default Forest3DBackground;
