/**
 * LiquidGlass.tsx — Physical Liquid Glass Surface Engine.
 * Delivers layered frosted glass gradients, specular top-edge illumination,
 * crystalline borders, and tactile 3D perspective spring tilt over the 3D forest.
 */
import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../hooks/useTheme';
import {radii, motion} from '../theme';

interface LiquidGlassProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  level?: 'subtle' | 'card' | 'elevated' | 'pill';
  border?: boolean;
  specular?: boolean;
  onPress?: () => void;
  activeScale?: number;
  tiltOnPress?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function LiquidGlass({
  children,
  style,
  radius = radii.xl,
  level = 'card',
  border = true,
  specular = true,
  onPress,
  activeScale = 0.97,
  tiltOnPress = true,
}: LiquidGlassProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const tiltX = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      {perspective: 800},
      {scale: scale.value},
      {rotateX: `${tiltX.value}deg`},
    ],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(activeScale, motion.spring.snappy);
      if (tiltOnPress) {
        tiltX.value = withSpring(-2.5, motion.spring.snappy);
      }
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, motion.spring.gentle);
      if (tiltOnPress) {
        tiltX.value = withSpring(0, motion.spring.gentle);
      }
    }
  };

  // ─── Frosted Liquid Glass Gradients ────────────────────────────────────────
  const getGradientColors = (): string[] => {
    if (theme.dark) {
      if (level === 'subtle') {
        return [
          'rgba(40, 48, 68, 0.45)',
          'rgba(20, 24, 34, 0.40)',
          'rgba(12, 14, 20, 0.55)',
        ];
      }
      if (level === 'elevated') {
        return [
          'rgba(60, 70, 95, 0.70)',
          'rgba(26, 30, 42, 0.65)',
          'rgba(15, 17, 24, 0.85)',
        ];
      }
      if (level === 'pill') {
        return [
          'rgba(50, 60, 85, 0.65)',
          'rgba(22, 26, 38, 0.60)',
          'rgba(14, 16, 22, 0.80)',
        ];
      }
      // card default
      return [
        'rgba(45, 54, 75, 0.55)',
        'rgba(20, 24, 34, 0.48)',
        'rgba(12, 15, 22, 0.72)',
      ];
    } else {
      // Light Mode: crystal frosted glass revealing nature forest greenery
      if (level === 'subtle') {
        return [
          'rgba(255, 255, 255, 0.70)',
          'rgba(255, 255, 255, 0.35)',
          'rgba(240, 248, 255, 0.48)',
        ];
      }
      if (level === 'elevated') {
        return [
          'rgba(255, 255, 255, 0.88)',
          'rgba(255, 255, 255, 0.55)',
          'rgba(240, 248, 255, 0.68)',
        ];
      }
      if (level === 'pill') {
        return [
          'rgba(255, 255, 255, 0.82)',
          'rgba(255, 255, 255, 0.48)',
          'rgba(242, 248, 255, 0.62)',
        ];
      }
      // card default
      return [
        'rgba(255, 255, 255, 0.78)',
        'rgba(255, 255, 255, 0.42)',
        'rgba(240, 248, 255, 0.56)',
      ];
    }
  };

  const getBorderColor = () => {
    if (!border) return 'transparent';
    return theme.dark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.68)';
  };

  const content = (
    <View
      style={[
        styles.surface,
        {
          borderRadius: radius,
          borderColor: getBorderColor(),
          borderWidth: border ? 1.2 : 0,
        },
        theme.dark ? styles.darkShadow : styles.lightShadow,
        style,
      ]}>
      {/* ─── Frosted Glass Refraction Gradient ──────────────────────────── */}
      <LinearGradient
        colors={getGradientColors()}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[StyleSheet.absoluteFill, {borderRadius: radius}]}
      />

      {/* ─── Top Specular Glint Highlight (Sunlight refraction) ─────────── */}
      {specular && (
        <LinearGradient
          colors={
            theme.dark
              ? [
                  'rgba(255, 255, 255, 0.50)',
                  'rgba(255, 255, 255, 0.15)',
                  'transparent',
                ]
              : [
                  'rgba(255, 255, 255, 0.95)',
                  'rgba(255, 255, 255, 0.40)',
                  'transparent',
                ]
          }
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={[
            styles.specularEdge,
            {
              borderTopLeftRadius: radius,
              borderTopRightRadius: radius,
            },
          ]}
          pointerEvents="none"
        />
      )}

      {/* Child elements */}
      {children}
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animStyle}>
        {content}
      </AnimatedPressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  surface: {
    position: 'relative',
    overflow: 'hidden',
  },
  specularEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
  },
  darkShadow: {
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
  },
  lightShadow: {
    shadowColor: '#0d1e2e',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 5,
  },
});

export default LiquidGlass;
