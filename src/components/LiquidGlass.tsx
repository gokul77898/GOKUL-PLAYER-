/**
 * LiquidGlass.tsx — Physical Liquid Glass Surface component.
 * Delivers layered depth, subtle specular top-edge illumination,
 * refined translucency and optional tactile press feedback.
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
  activeScale = 0.98,
}: LiquidGlassProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(activeScale, motion.spring.snappy);
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, motion.spring.gentle);
    }
  };

  const getBackground = () => {
    if (level === 'subtle') return theme.bg.glassSubtle;
    if (level === 'elevated') return theme.bg.glassStrong;
    if (level === 'pill') return theme.miniPlayer.bg;
    return theme.bg.glass;
  };

  const getBorderColor = () => {
    if (!border) return 'transparent';
    return theme.border.default;
  };

  const content = (
    <View
      style={[
        styles.surface,
        {
          borderRadius: radius,
          backgroundColor: getBackground(),
          borderColor: getBorderColor(),
          borderWidth: border ? StyleSheet.hairlineWidth : 0,
        },
        theme.dark ? styles.darkShadow : styles.lightShadow,
        style,
      ]}>
      {/* Top Specular Edge Highlight for authentic glass refraction */}
      {specular && (
        <View
          style={[
            styles.specularEdge,
            {
              borderTopLeftRadius: radius,
              borderTopRightRadius: radius,
              backgroundColor: theme.bg.specularLine,
            },
          ]}
          pointerEvents="none"
        />
      )}
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
    height: 1,
    opacity: 0.65,
  },
  darkShadow: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  lightShadow: {
    shadowColor: '#171721',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
});

export default LiquidGlass;
