/**
 * GlassCard.tsx — upgraded to use the Liquid Glass surface engine.
 */
import React from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {LiquidGlass} from './LiquidGlass';
import {radii} from '../theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  intensity?: 'low' | 'medium' | 'high';
  border?: boolean;
  onPress?: () => void;
}

export function GlassCard({
  children,
  style,
  radius = radii.xl,
  intensity = 'medium',
  border = true,
  onPress,
}: Props) {
  const level = intensity === 'low' ? 'subtle' : intensity === 'high' ? 'elevated' : 'card';

  return (
    <LiquidGlass
      style={style}
      radius={radius}
      level={level}
      border={border}
      specular={true}
      onPress={onPress}>
      {children}
    </LiquidGlass>
  );
}

export default GlassCard;
