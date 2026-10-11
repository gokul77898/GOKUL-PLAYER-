/**
 * App.tsx — GOKUL Player Root Component.
 * Sets up native audio engine, initializes SQLite track library and mounts navigation.
 */
import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import TrackPlayer, {useTrackPlayerEvents, Event} from 'react-native-track-player';
import LinearGradient from 'react-native-linear-gradient';
import {Disc3, Sparkles} from 'lucide-react-native';
import {AppNavigator} from './src/navigation';
import {useStore} from './src/store';
import {initLibrary} from './src/services/LibraryService';
import {setup as setupPlayer} from './src/services/PlayerService';
import {darkTheme, typography, radii, spacing} from './src/theme';
import type {LibraryInitProgress} from './src/services/LibraryService';

const {width: W} = Dimensions.get('window');

// ─── Branded GOKUL Player Splash Screen ───────────────────────────────────────
function LoadingScreen({progress}: {progress: LibraryInitProgress | null}) {
  const pct =
    progress && progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <View style={loadStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Ambient background glow */}
      <LinearGradient
        colors={['rgba(128, 85, 255, 0.18)', 'transparent']}
        style={loadStyles.glow}
        pointerEvents="none"
      />

      {/* Brand Icon Emblem */}
      <View style={loadStyles.emblemContainer}>
        <LinearGradient
          colors={darkTheme.accent.gradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={loadStyles.emblem}>
          <Disc3 size={44} color="#FFFFFF" strokeWidth={2} />
        </LinearGradient>
      </View>

      <Text style={loadStyles.title}>GOKUL PLAYER</Text>
      <Text style={loadStyles.subtitle}>
        {progress?.phase === 'copying'
          ? `Indexing local tracks… ${pct}%`
          : progress?.phase === 'indexing'
          ? 'Synchronizing library…'
          : 'Premium Offline Audio'}
      </Text>

      {/* Glass Progress Bar */}
      {progress && (
        <View style={loadStyles.progressBar}>
          <LinearGradient
            colors={darkTheme.accent.gradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={[loadStyles.progressFill, {width: `${pct}%`}]}
          />
        </View>
      )}

      {progress?.currentTrack ? (
        <Text style={loadStyles.trackName} numberOfLines={1}>
          {progress.currentTrack}
        </Text>
      ) : null}
    </View>
  );
}

const loadStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 350,
  },
  emblemContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    shadowColor: darkTheme.accent.primary,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 20,
  },
  emblem: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: typography.heavy,
    color: darkTheme.text.primary,
    marginBottom: 6,
    letterSpacing: 2.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: typography.medium,
    color: darkTheme.text.secondary,
    marginBottom: 24,
  },
  progressBar: {
    width: W * 0.7,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  trackName: {
    marginTop: 14,
    fontSize: typography.xs,
    color: darkTheme.text.tertiary,
    textAlign: 'center',
    maxWidth: W * 0.8,
  },
});

// ─── App Content ──────────────────────────────────────────────────────────────
function AppContent() {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState<LibraryInitProgress | null>(null);
  const loadTracks = useStore(s => s.loadTracks);
  const loadPlaylists = useStore(s => s.loadPlaylists);
  const loadSettings = useStore(s => s.loadSettings);
  const setCurrentTrack = useStore(s => s.setCurrentTrack);
  const tracks = useStore(s => s.tracks);

  // Sync active track from TrackPlayer events
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async event => {
    if (event.track) {
      const id = event.track.id as string;
      const found = tracks.find(t => t.id === id);
      if (found) {
        setCurrentTrack(found);
      }
    }
  });

  const initialize = useCallback(async () => {
    try {
      await setupPlayer();
      await loadSettings();
      await initLibrary(p => setProgress(p));
      await loadTracks();
      await loadPlaylists();
      setReady(true);
    } catch (err) {
      console.error('[App] Init error:', err);
      setReady(true);
    }
  }, [loadTracks, loadPlaylists, loadSettings]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!ready) {
    return <LoadingScreen progress={progress} />;
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
