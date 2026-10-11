/**
 * PlaybackService — background service handler for react-native-track-player.
 * Must be registered with TrackPlayer.registerPlaybackService().
 */
import TrackPlayer, {Event} from 'react-native-track-player';

export default async function PlaybackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.reset());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.RemoteSeek, ({position}) => TrackPlayer.seekTo(position));
  TrackPlayer.addEventListener(Event.RemoteDuck, async ({permanent, paused}) => {
    if (permanent) {
      await TrackPlayer.pause();
    } else if (paused) {
      await TrackPlayer.setVolume(0.5);
    } else {
      await TrackPlayer.setVolume(1);
    }
  });
}
