/**
 * index.js — app entry point. Registers playback service before anything else.
 */
import {AppRegistry} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import App from './App';
import {name as appName} from './app.json';
import PlaybackService from './src/services/PlaybackService';

// Register background playback service
TrackPlayer.registerPlaybackService(() => PlaybackService);

AppRegistry.registerComponent(appName, () => App);
