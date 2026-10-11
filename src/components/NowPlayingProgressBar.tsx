/**
 * NowPlayingProgressBar.tsx — High-performance isolated scrubber.
 * Isolates playback progress updates to prevent entire NowPlayingScreen re-renders.
 */
import React, {useCallback, useState} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {usePlayerProgress} from '../hooks/usePlayerProgress';
import {useTheme} from '../hooks/useTheme';
import {useStore} from '../store';
import {typography, spacing, radii} from '../theme';

const {width: W} = Dimensions.get('window');
const SCRUB_WIDTH = W - spacing['6'] * 2;

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function NowPlayingProgressBar() {
  const theme = useTheme();
  const {position, duration} = usePlayerProgress();
  const seekTo = useStore(s => s.seekTo);

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPosition, setScrubPosition] = useState(0);

  const currentPos = isScrubbing ? scrubPosition : position;
  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, currentPos / duration)) : 0;

  const handleGrant = useCallback(
    (x: number) => {
      setIsScrubbing(true);
      const ratio = Math.max(0, Math.min(1, x / SCRUB_WIDTH));
      setScrubPosition(ratio * duration);
    },
    [duration],
  );

  const handleMove = useCallback(
    (x: number) => {
      const ratio = Math.max(0, Math.min(1, x / SCRUB_WIDTH));
      setScrubPosition(ratio * duration);
    },
    [duration],
  );

  const handleRelease = useCallback(
    (x: number) => {
      const ratio = Math.max(0, Math.min(1, x / SCRUB_WIDTH));
      const targetSec = ratio * duration;
      seekTo(targetSec);
      setIsScrubbing(false);
    },
    [duration, seekTo],
  );

  return (
    <View style={styles.container}>
      {/* Interactive Track Area with generous touch hit target */}
      <View
        style={styles.touchArea}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={e => handleGrant(e.nativeEvent.locationX)}
        onResponderMove={e => handleMove(e.nativeEvent.locationX)}
        onResponderRelease={e => handleRelease(e.nativeEvent.locationX)}>
        {/* Track Background */}
        <View style={[styles.trackBg, {backgroundColor: theme.player.seekBar}]}>
          {/* Active Fill with vibrant gradient color */}
          <View
            style={[
              styles.trackFill,
              {
                width: `${progressRatio * 100}%`,
                backgroundColor: theme.accent.primary,
              },
            ]}
          />
        </View>

        {/* Specular Glow Thumb */}
        <View
          style={[
            styles.thumb,
            {
              left: `${progressRatio * 100}%`,
              backgroundColor: theme.player.seekThumb,
              borderColor: theme.accent.primary,
            },
            isScrubbing && styles.thumbActive,
          ]}
        />
      </View>

      {/* Time Labels */}
      <View style={styles.timeRow}>
        <Text style={[styles.timeText, {color: theme.text.tertiary}]}>
          {formatTime(currentPos)}
        </Text>
        <Text style={[styles.timeText, {color: theme.text.tertiary}]}>
          -{formatTime(Math.max(0, duration - currentPos))}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: spacing['6'],
  },
  touchArea: {
    height: 36,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBg: {
    height: 4,
    borderRadius: radii.full,
    overflow: 'hidden',
    width: '100%',
  },
  trackFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  thumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    marginLeft: -7,
    borderWidth: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  thumbActive: {
    transform: [{scale: 1.4}],
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  timeText: {
    fontSize: typography.xs,
    fontFamily: typography.mono,
    letterSpacing: 0.2,
  },
});

export default React.memo(NowPlayingProgressBar);
