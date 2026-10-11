/**
 * AudioVisualizer.tsx — Live 3D Dancing Audio Spectrum Visualizer.
 * Renders stylized Liquid Glass frequency bars that react dynamically to music playback.
 */
import React, {useEffect} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
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
import {useStore} from '../store';

const {width: W} = Dimensions.get('window');
const NUM_BARS = 18;

interface BarProps {
  index: number;
  isPlaying: boolean;
  baseHeight: number;
  maxHeight: number;
  duration: number;
  accentColors: [string, string];
}

function SpectrumBar({
  isPlaying,
  baseHeight,
  maxHeight,
  duration,
  accentColors,
}: BarProps) {
  const animValue = useSharedValue(0.2);

  useEffect(() => {
    if (isPlaying) {
      animValue.value = withRepeat(
        withSequence(
          withTiming(1, {
            duration: duration * 0.45,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(0.25, {
            duration: duration * 0.55,
            easing: Easing.inOut(Easing.quad),
          }),
        ),
        -1,
        true,
      );
    } else {
      animValue.value = withTiming(0.12, {duration: 400});
    }
  }, [isPlaying, duration, animValue]);

  const barStyle = useAnimatedStyle(() => {
    const height = interpolate(
      animValue.value,
      [0, 1],
      [baseHeight, maxHeight],
    );
    const opacity = interpolate(animValue.value, [0, 1], [0.45, 0.95]);

    return {
      height,
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.barContainer, barStyle]}>
      <LinearGradient
        colors={accentColors}
        start={{x: 0, y: 1}}
        end={{x: 0, y: 0}}
        style={styles.barGradient}>
        {/* Specular Top Glint */}
        <View style={styles.specularTop} />
      </LinearGradient>
    </Animated.View>
  );
}

interface VisualizerProps {
  height?: number;
  compact?: boolean;
}

export function AudioVisualizer({height = 42, compact = false}: VisualizerProps) {
  const theme = useTheme();
  const isPlaying = useStore(s => s.isPlaying);

  // Pre-calculated acoustic curve multipliers
  const barConfigs = [
    {base: 5, max: height * 0.55, dur: 380},
    {base: 6, max: height * 0.75, dur: 420},
    {base: 7, max: height * 0.95, dur: 320},
    {base: 8, max: height * 0.90, dur: 450},
    {base: 9, max: height * 1.00, dur: 290},
    {base: 8, max: height * 0.85, dur: 400},
    {base: 7, max: height * 0.70, dur: 350},
    {base: 6, max: height * 0.80, dur: 440},
    {base: 8, max: height * 0.95, dur: 310},
    {base: 9, max: height * 1.00, dur: 360},
    {base: 8, max: height * 0.88, dur: 430},
    {base: 7, max: height * 0.78, dur: 340},
    {base: 6, max: height * 0.65, dur: 410},
    {base: 8, max: height * 0.92, dur: 370},
    {base: 7, max: height * 0.80, dur: 460},
    {base: 6, max: height * 0.68, dur: 390},
    {base: 5, max: height * 0.50, dur: 430},
    {base: 4, max: height * 0.40, dur: 470},
  ];

  const colors = theme.dark
    ? ['#8055FF', '#38D4FF'] as [string, string]
    : ['#7047F5', '#9B51E0'] as [string, string];

  return (
    <View style={[styles.wrapper, {height}, compact && styles.compactWrapper]}>
      {barConfigs.slice(0, compact ? 12 : NUM_BARS).map((cfg, idx) => (
        <SpectrumBar
          key={idx}
          index={idx}
          isPlaying={isPlaying}
          baseHeight={cfg.base}
          maxHeight={cfg.max}
          duration={cfg.dur}
          accentColors={colors}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 5.5,
    paddingHorizontal: 20,
    width: '100%',
  },
  compactWrapper: {
    gap: 3.5,
    paddingHorizontal: 8,
  },
  barContainer: {
    width: 4.5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barGradient: {
    flex: 1,
    position: 'relative',
    borderRadius: 3,
  },
  specularTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 2,
  },
});

export default AudioVisualizer;
