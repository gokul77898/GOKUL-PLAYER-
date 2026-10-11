/**
 * usePlayerProgress.ts — Subscribes directly to TrackPlayer progress events.
 * Lean and decoupled from the global store to prevent redundant store dispatches.
 */
import {useEffect} from 'react';
import {useProgress, usePlaybackState, State} from 'react-native-track-player';
import {useStore} from '../store';

export function usePlayerProgress() {
  const {position, duration, buffered} = useProgress(500);
  const playbackState = usePlaybackState();
  const setIsPlaying = useStore(s => s.setIsPlaying);

  useEffect(() => {
    const playing = playbackState.state === State.Playing;
    setIsPlaying(playing);
  }, [playbackState.state, setIsPlaying]);

  return {position, duration, buffered, state: playbackState.state};
}

export default usePlayerProgress;
