/**
 * PlayerService — wraps react-native-track-player for playback operations.
 * Handles queue management, shuffle, repeat, background playback.
 */
import TrackPlayer, {
  Event,
  RepeatMode as RNTPRepeatMode,
  State,
  Track as RNTPTrack,
  Capability,
  AppKilledPlaybackBehavior,
} from 'react-native-track-player';
import {Track} from '../types';
import * as DB from './DatabaseService';

let _isSetup = false;

export async function setup(): Promise<void> {
  if (_isSetup) return;
  try {
    await TrackPlayer.setupPlayer({
      minBuffer: 5,
      playBuffer: 2,
      backBuffer: 2,
      maxBuffer: 50,
      waitForBuffer: true,
    });
  } catch (e: any) {
    if (!e.message?.includes('already been initialized')) {
      throw e;
    }
  }

  await TrackPlayer.updateOptions({
    android: {
      appKilledPlaybackBehavior:
        AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
    },
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo,
      Capability.Stop,
    ],
    compactCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
    ],
    progressUpdateEventInterval: 1,
    notificationCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo,
    ],
  });

  _isSetup = true;
  console.log('[Player] Setup complete');
}

function trackToRNTP(track: Track): RNTPTrack {
  return {
    id: track.id,
    url: track.url,
    title: track.title,
    artist: track.artist,
    album: track.album || undefined,
    artwork: track.artwork ?? undefined,
    duration: track.duration,
  };
}

export async function playQueue(
  tracks: Track[],
  startIndex = 0,
): Promise<void> {
  await TrackPlayer.reset();
  await TrackPlayer.add(tracks.map(trackToRNTP));
  await TrackPlayer.skip(startIndex);
  await TrackPlayer.play();
  // Record play
  if (tracks[startIndex]) {
    DB.incrementPlayCount(tracks[startIndex].id).catch(console.warn);
  }
}

export async function playTrack(track: Track, queue: Track[]): Promise<void> {
  const idx = queue.findIndex(t => t.id === track.id);
  await playQueue(queue, idx >= 0 ? idx : 0);
}

export async function play(): Promise<void> {
  await TrackPlayer.play();
}

export async function pause(): Promise<void> {
  await TrackPlayer.pause();
}

export async function togglePlayPause(): Promise<void> {
  const state = await TrackPlayer.getState();
  if (state === State.Playing) {
    await TrackPlayer.pause();
  } else {
    await TrackPlayer.play();
  }
}

export async function skipToNext(): Promise<void> {
  try {
    await TrackPlayer.skipToNext();
  } catch {
    // End of queue
  }
}

export async function skipToPrevious(): Promise<void> {
  const pos = await TrackPlayer.getPosition();
  if (pos > 3) {
    await TrackPlayer.seekTo(0);
  } else {
    try {
      await TrackPlayer.skipToPrevious();
    } catch {
      await TrackPlayer.seekTo(0);
    }
  }
}

export async function seekTo(seconds: number): Promise<void> {
  await TrackPlayer.seekTo(seconds);
}

export async function setRepeatMode(mode: 'off' | 'track' | 'queue'): Promise<void> {
  const rnMode =
    mode === 'track'
      ? RNTPRepeatMode.Track
      : mode === 'queue'
      ? RNTPRepeatMode.Queue
      : RNTPRepeatMode.Off;
  await TrackPlayer.setRepeatMode(rnMode);
}

export async function getState(): Promise<State> {
  return TrackPlayer.getState();
}

export async function getCurrentTrack(): Promise<RNTPTrack | null | undefined> {
  const index = await TrackPlayer.getCurrentTrack();
  if (index === null || index === undefined) return null;
  return TrackPlayer.getTrack(index);
}

export async function getProgress(): Promise<{position: number; duration: number; buffered: number}> {
  return TrackPlayer.getProgress();
}

export async function setRate(rate: number): Promise<void> {
  await TrackPlayer.setRate(rate);
}

export async function setVolume(volume: number): Promise<void> {
  await TrackPlayer.setVolume(Math.max(0, Math.min(1, volume)));
}

export async function getVolume(): Promise<number> {
  return TrackPlayer.getVolume();
}

export async function stop(): Promise<void> {
  await TrackPlayer.stop();
}

export async function reset(): Promise<void> {
  await TrackPlayer.reset();
}

export default {
  setup,
  playQueue,
  playTrack,
  play,
  pause,
  togglePlayPause,
  skipToNext,
  skipToPrevious,
  seekTo,
  setRepeatMode,
  setRate,
  setVolume,
  getVolume,
  getState,
  getCurrentTrack,
  getProgress,
  stop,
  reset,
};
