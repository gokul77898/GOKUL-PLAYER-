/**
 * TrackRow.tsx — Virtualized track row with tactile press and playing state.
 * Memoized to ensure 60fps buttery-smooth list scrolling.
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
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {Heart, Play, Volume2} from 'lucide-react-native';
import {Track} from '../types';
import {useTheme} from '../hooks/useTheme';
import {useStore} from '../store';
import {ArtworkImage} from './ArtworkImage';
import {radii, spacing, typography, motion} from '../theme';

interface Props {
  track: Track;
  isCurrentTrack?: boolean;
  showIndex?: boolean;
  index?: number;
  queue?: Track[];
  onPress?: () => void;
}

export const TrackRow = React.memo(
  function TrackRow({
    track,
    isCurrentTrack = false,
    showIndex = false,
    index,
    queue,
    onPress,
  }: Props) {
    const theme = useTheme();
    const playTrack = useStore(s => s.playTrack);
    const toggleFavorite = useStore(s => s.toggleFavorite);
    const isPlaying = useStore(s => s.isPlaying);

    const scale = useSharedValue(1);

    const animStyle = useAnimatedStyle(() => ({
      transform: [{scale: scale.value}],
    }));

    const handlePress = useCallback(() => {
      scale.value = withSpring(0.97, motion.spring.snappy, () => {
        scale.value = withSpring(1, motion.spring.gentle);
      });
      if (onPress) {
        onPress();
      } else {
        playTrack(track, queue);
      }
    }, [track, queue, onPress, playTrack, scale]);

    const handleFavorite = useCallback(() => {
      toggleFavorite(track.id);
    }, [track.id, toggleFavorite]);

    const titleColor = isCurrentTrack
      ? theme.accent.primary
      : theme.text.primary;

    return (
      <Animated.View style={[styles.rowContainer, animStyle]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePress}
          style={[
            styles.row,
            {
              backgroundColor: isCurrentTrack
                ? theme.dark
                  ? 'rgba(128, 85, 255, 0.26)'
                  : 'rgba(112, 71, 245, 0.20)'
                : theme.dark
                  ? 'rgba(22, 26, 38, 0.52)'
                  : 'rgba(255, 255, 255, 0.65)',
              borderColor: isCurrentTrack
                ? theme.accent.primary
                : theme.dark
                  ? 'rgba(255, 255, 255, 0.12)'
                  : 'rgba(255, 255, 255, 0.70)',
              borderWidth: 1.2,
              borderRadius: radii.xl,
            },
          ]}>
          {/* Top Specular Edge Line */}
          <View
            style={[
              styles.rowSpecular,
              {
                backgroundColor: theme.dark
                  ? 'rgba(255, 255, 255, 0.22)'
                  : 'rgba(255, 255, 255, 0.85)',
              },
            ]}
            pointerEvents="none"
          />
          {/* Index or Artwork */}
          {showIndex && index !== undefined ? (
            <View style={styles.indexContainer}>
              {isCurrentTrack ? (
                <Volume2
                  size={16}
                  color={theme.accent.primary}
                  strokeWidth={2.4}
                />
              ) : (
                <Text style={[styles.index, {color: theme.text.tertiary}]}>
                  {index + 1}
                </Text>
              )}
            </View>
          ) : (
            <ArtworkImage
              track={track}
              size={50}
              radius={radii.md}
              style={styles.artwork}
            />
          )}

          {/* Metadata */}
          <View style={styles.info}>
            <Text
              style={[styles.title, {color: titleColor}]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {track.title}
            </Text>
            <Text
              style={[styles.artist, {color: theme.text.secondary}]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {track.artist}
              {track.album ? ` · ${track.album}` : ''}
            </Text>
          </View>

          {/* Trailing Info: Duration and Favorite */}
          <View style={styles.trailing}>
            <Text style={[styles.duration, {color: theme.text.tertiary}]}>
              {track.durationFormatted}
            </Text>
            <TouchableOpacity
              onPress={handleFavorite}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              style={styles.favBtn}>
              <Heart
                size={16}
                color={track.isFavorite ? theme.error : theme.text.tertiary}
                fill={track.isFavorite ? theme.error : 'transparent'}
                strokeWidth={1.8}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  },
  (prev, next) =>
    prev.track.id === next.track.id &&
    prev.isCurrentTrack === next.isCurrentTrack &&
    prev.track.isFavorite === next.track.isFavorite &&
    prev.index === next.index,
);

const styles = StyleSheet.create({
  rowContainer: {
    marginVertical: 3.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['3.5'],
    paddingVertical: spacing['2.5'],
    position: 'relative',
    overflow: 'hidden',
  },
  rowSpecular: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.2,
  },
  artwork: {
    marginRight: spacing['3.5'],
  },
  indexContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: spacing['3'],
  },
  index: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
  },
  info: {
    flex: 1,
    marginRight: spacing['2'],
  },
  title: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  artist: {
    fontSize: typography.xs,
    fontWeight: typography.medium,
  },
  trailing: {
    alignItems: 'flex-end',
    gap: 4,
  },
  duration: {
    fontSize: typography.xs,
    fontFamily: typography.mono,
  },
  favBtn: {
    padding: 3,
  },
});

export default TrackRow;
