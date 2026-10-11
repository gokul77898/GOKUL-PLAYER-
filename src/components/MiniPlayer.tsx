/**
 * MiniPlayer.tsx — Floating Liquid Glass Dock above bottom navigation.
 * Displays current track with isolated progress line, tactile spring controls
 * and tap-to-expand into Now Playing screen.
 */
import React, {useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import {Play, Pause, SkipForward} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useStore} from '../store';
import {ArtworkImage} from './ArtworkImage';
import {LiquidGlass} from './LiquidGlass';
import {radii, spacing, typography, LAYOUT, motion} from '../theme';
import {useTheme} from '../hooks/useTheme';
import {RootStackParamList} from '../types';
import {usePlayerProgress} from '../hooks/usePlayerProgress';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

// Isolated progress indicator line
function MiniProgressBar() {
  const theme = useTheme();
  const {position, duration} = usePlayerProgress();
  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, position / duration)) : 0;

  return (
    <View style={[styles.progressTrack, {backgroundColor: theme.player.seekBar}]}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${progressRatio * 100}%`,
            backgroundColor: theme.accent.primary,
          },
        ]}
      />
    </View>
  );
}

const MemoProgressBar = React.memo(MiniProgressBar);

export function MiniPlayer() {
  const theme = useTheme();
  const navigation = useNavigation<NavProp>();
  const currentTrack = useStore(s => s.currentTrack);
  const isPlaying = useStore(s => s.isPlaying);
  const togglePlayPause = useStore(s => s.togglePlayPause);
  const skipNext = useStore(s => s.skipNext);

  const pressScale = useSharedValue(1);

  const handleOpen = useCallback(() => {
    pressScale.value = withSpring(0.96, motion.spring.snappy, () => {
      pressScale.value = withSpring(1, motion.spring.gentle);
    });
    navigation.navigate('NowPlaying');
  }, [navigation, pressScale]);

  if (!currentTrack) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={styles.floatingWrapper}>
      <LiquidGlass
        level="pill"
        radius={radii['2xl']}
        style={styles.dock}>
        <Pressable
          onPress={handleOpen}
          style={styles.content}>
          {/* Album artwork thumbnail with subtle bevel */}
          <ArtworkImage track={currentTrack} size={46} radius={radii.md} />

          {/* Title & Artist */}
          <View style={styles.textContainer}>
            <Text
              style={[styles.title, {color: theme.text.primary}]}
              numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text
              style={[styles.artist, {color: theme.text.secondary}]}
              numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>

          {/* Quick Play/Pause and Next controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              onPress={togglePlayPause}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              style={[
                styles.playBtn,
                {backgroundColor: theme.accent.primary},
              ]}>
              {isPlaying ? (
                <Pause size={18} color="#FFFFFF" fill="#FFFFFF" />
              ) : (
                <Play size={18} color="#FFFFFF" fill="#FFFFFF" style={{marginLeft: 2}} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={skipNext}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              style={styles.nextBtn}>
              <SkipForward
                size={22}
                color={theme.text.primary}
                fill={theme.text.primary}
              />
            </TouchableOpacity>
          </View>
        </Pressable>

        {/* Micro progress hairline at bottom of dock */}
        <MemoProgressBar />
      </LiquidGlass>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    left: spacing['3'],
    right: spacing['3'],
    bottom: LAYOUT.tabBarHeight + 6,
    zIndex: 99,
  },
  dock: {
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['3.5'],
    paddingVertical: spacing['2'],
    gap: spacing['3'],
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    letterSpacing: -0.2,
  },
  artist: {
    fontSize: typography.xs,
    fontWeight: typography.medium,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8055FF',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  nextBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    height: 2,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
});

export default React.memo(MiniPlayer);
