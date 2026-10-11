/**
 * NowPlayingScreen.tsx — GOKUL Player Signature Experience.
 * Features immersive artwork ambient glow, 2.5D vinyl elevation,
 * Liquid Glass floating control dock, responsive layout and fluid transitions.
 */
import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  ListMusic,
  X,
  Timer,
  Gauge,
} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import {useStore} from '../store';
import {useTheme} from '../hooks/useTheme';
import {ArtworkImage} from '../components/ArtworkImage';
import {NowPlayingProgressBar} from '../components/NowPlayingProgressBar';
import {LiquidGlass} from '../components/LiquidGlass';
import {Forest3DBackground} from '../components/Forest3DBackground';
import {AudioVisualizer} from '../components/AudioVisualizer';
import {SleepTimerModal} from '../components/SleepTimerModal';
import {TrackRow} from '../components/TrackRow';
import {Track} from '../types';
import {spacing, typography, radii, motion} from '../theme';

const {width: W, height: H} = Dimensions.get('window');
// Responsive artwork sizing so it fits short and tall screens alike
const ARTWORK_SIZE = Math.min(W - spacing['8'] * 2, H * 0.38);

export default function NowPlayingScreen() {
  const theme = useTheme();
  const navigation = useNavigation();

  // State subscriptions
  const currentTrack = useStore(s => s.currentTrack);
  const queue = useStore(s => s.queue);
  const isPlaying = useStore(s => s.isPlaying);
  const repeatMode = useStore(s => s.repeatMode);
  const shuffleMode = useStore(s => s.shuffleMode);

  // Actions
  const togglePlayPause = useStore(s => s.togglePlayPause);
  const skipNext = useStore(s => s.skipNext);
  const skipPrevious = useStore(s => s.skipPrevious);
  const cycleRepeat = useStore(s => s.cycleRepeat);
  const toggleShuffle = useStore(s => s.toggleShuffle);
  const toggleFavorite = useStore(s => s.toggleFavorite);
  const playbackRate = useStore(s => s.playbackRate);
  const setPlaybackRate = useStore(s => s.setPlaybackRate);
  const sleepTimerActive = useStore(s => s.sleepTimerActive);

  const [showQueue, setShowQueue] = useState(false);
  const [showSleepTimer, setShowSleepTimer] = useState(false);

  const handleCycleRate = useCallback(() => {
    const rates = [1.0, 1.25, 1.5, 2.0, 0.75];
    const currIdx = rates.indexOf(playbackRate);
    const nextRate = rates[(currIdx + 1) % rates.length];
    setPlaybackRate(nextRate);
  }, [playbackRate, setPlaybackRate]);

  // 2.5D Artwork dimensional scale when playing vs paused
  const artworkScale = useSharedValue(1);
  const heartScale = useSharedValue(1);

  useEffect(() => {
    artworkScale.value = withSpring(
      isPlaying ? 1 : 0.92,
      motion.spring.gentle,
    );
  }, [isPlaying, artworkScale]);

  const animatedArtworkStyle = useAnimatedStyle(() => ({
    transform: [{scale: artworkScale.value}],
  }));

  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{scale: heartScale.value}],
  }));

  const handleFavoritePress = useCallback(() => {
    if (currentTrack) {
      heartScale.value = withSpring(1.3, motion.spring.bouncy, () => {
        heartScale.value = withSpring(1, motion.spring.snappy);
      });
      toggleFavorite(currentTrack.id);
    }
  }, [currentTrack, heartScale, toggleFavorite]);

  if (!currentTrack) {
    return (
      <View style={[styles.container, {backgroundColor: theme.bg.primary}]}>
        <SafeAreaView>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
            <ChevronDown size={28} color={theme.text.primary} />
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  // Dynamic ambient backdrop colors
  const ambientGrad = theme.dark
    ? ['#1C1238', '#0F0B1E', theme.bg.primary]
    : ['#E6DEFF', '#F1EDFC', theme.bg.primary];

  return (
    <Forest3DBackground style={styles.container}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Atmospheric Ambient Glow Layer */}
      <LinearGradient
        colors={ambientGrad}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* ─── Top Bar ────────────────────────────────────────────── */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
            style={styles.iconButton}>
            <ChevronDown size={26} color={theme.text.primary} strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={styles.topBrand}>
            <Text style={[styles.brandText, {color: theme.accent.primary}]}>
              GOKUL PLAYER
            </Text>
            <Text style={[styles.nowPlayingLabel, {color: theme.text.tertiary}]}>
              NOW PLAYING
            </Text>
          </View>

          <View style={styles.topRightActions}>
            <TouchableOpacity
              onPress={() => setShowSleepTimer(true)}
              hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
              style={[
                styles.iconButton,
                sleepTimerActive && {
                  backgroundColor: theme.dark
                    ? 'rgba(128, 85, 255, 0.25)'
                    : 'rgba(112, 71, 245, 0.16)',
                  borderRadius: radii.full,
                },
              ]}>
              <Timer
                size={22}
                color={sleepTimerActive ? theme.accent.primary : theme.text.secondary}
                strokeWidth={sleepTimerActive ? 2.5 : 2}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowQueue(true)}
              hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
              style={styles.iconButton}>
              <ListMusic size={22} color={theme.text.secondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Artwork Section (Cinematic 2.5D Vinyl Elevation) ──── */}
        <View style={styles.artworkSection}>
          <Animated.View style={[styles.artworkWrapper, animatedArtworkStyle]}>
            <ArtworkImage
              track={currentTrack}
              size={ARTWORK_SIZE}
              radius={radii['3xl']}
              showShadow
            />
          </Animated.View>
        </View>

        {/* ─── Live Dancing Audio Spectrum Visualizer ────────────── */}
        <View style={styles.visualizerContainer}>
          <AudioVisualizer height={28} />
        </View>

        {/* ─── Track Info Section ─────────────────────────────────── */}
        <View style={styles.infoSection}>
          <View style={styles.titleColumn}>
            <Text
              style={[styles.trackTitle, {color: theme.text.primary}]}
              numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text
              style={[styles.trackArtist, {color: theme.text.secondary}]}
              numberOfLines={1}>
              {currentTrack.artist}
            </Text>
            {currentTrack.album ? (
              <Text
                style={[styles.trackAlbum, {color: theme.text.tertiary}]}
                numberOfLines={1}>
                {currentTrack.album}
              </Text>
            ) : null}
          </View>

          <Animated.View style={animatedHeartStyle}>
            <TouchableOpacity
              onPress={handleFavoritePress}
              hitSlop={{top: 14, bottom: 14, left: 14, right: 14}}
              style={styles.favButton}>
              <Heart
                size={26}
                color={currentTrack.isFavorite ? theme.error : theme.text.tertiary}
                fill={currentTrack.isFavorite ? theme.error : 'transparent'}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* ─── Isolated High-Performance Scrubber ─────────────────── */}
        <View style={styles.progressContainer}>
          <NowPlayingProgressBar />
        </View>

        {/* ─── Playback Speed Selector ────────────────────────────── */}
        <View style={styles.speedRow}>
          <TouchableOpacity
            onPress={handleCycleRate}
            activeOpacity={0.8}
            hitSlop={{top: 8, bottom: 8, left: 12, right: 12}}>
            <LiquidGlass level="subtle" radius={radii.full} style={styles.speedPill}>
              <Gauge size={13} color={theme.accent.primary} strokeWidth={2.4} />
              <Text style={[styles.speedText, {color: theme.accent.primary}]}>
                {playbackRate.toFixed(2).replace(/\.00$/, '')}x
              </Text>
            </LiquidGlass>
          </TouchableOpacity>
        </View>

        {/* ─── Floating Liquid Glass Controls Deck ────────────────── */}
        <View style={styles.controlsOuter}>
          <LiquidGlass
            level="elevated"
            radius={radii['2xl']}
            style={styles.controlsDeck}>
            {/* Shuffle Button */}
            <TouchableOpacity
              onPress={toggleShuffle}
              hitSlop={{top: 14, bottom: 14, left: 14, right: 14}}
              style={styles.controlPill}>
              <Shuffle
                size={20}
                color={
                  shuffleMode === 'on'
                    ? theme.accent.primary
                    : theme.text.tertiary
                }
                strokeWidth={2}
              />
            </TouchableOpacity>

            {/* Previous Track */}
            <TouchableOpacity
              onPress={skipPrevious}
              hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
              style={styles.controlPill}>
              <SkipBack
                size={28}
                color={theme.text.primary}
                fill={theme.text.primary}
                strokeWidth={1.5}
              />
            </TouchableOpacity>

            {/* Master Play / Pause Button with Radiant Glow */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={togglePlayPause}
              style={[
                styles.masterPlayBtn,
                {backgroundColor: theme.accent.primary},
              ]}>
              <LinearGradient
                colors={theme.accent.gradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.playGradient}>
                {isPlaying ? (
                  <Pause size={28} color="#FFFFFF" fill="#FFFFFF" strokeWidth={1} />
                ) : (
                  <Play size={28} color="#FFFFFF" fill="#FFFFFF" strokeWidth={1} style={{marginLeft: 3}} />
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Next Track */}
            <TouchableOpacity
              onPress={skipNext}
              hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
              style={styles.controlPill}>
              <SkipForward
                size={28}
                color={theme.text.primary}
                fill={theme.text.primary}
                strokeWidth={1.5}
              />
            </TouchableOpacity>

            {/* Repeat Button */}
            <TouchableOpacity
              onPress={cycleRepeat}
              hitSlop={{top: 14, bottom: 14, left: 14, right: 14}}
              style={styles.controlPill}>
              {repeatMode === 'track' ? (
                <Repeat1
                  size={22}
                  color={theme.accent.primary}
                  strokeWidth={2.4}
                />
              ) : (
                <Repeat
                  size={20}
                  color={
                    repeatMode === 'queue'
                      ? theme.accent.primary
                      : theme.text.tertiary
                  }
                  strokeWidth={2}
                />
              )}
            </TouchableOpacity>
          </LiquidGlass>
        </View>
      </SafeAreaView>

      {/* ─── Queue Sheet Modal ──────────────────────────────────── */}
      <Modal
        visible={showQueue}
        animationType="slide"
        transparent
        onRequestClose={() => setShowQueue(false)}>
        <View style={[styles.modalOverlay, {backgroundColor: theme.bg.overlay}]}>
          <LiquidGlass
            level="elevated"
            radius={radii['3xl']}
            style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, {color: theme.text.primary}]}>
                  Up Next ({queue.length})
                </Text>
                <Text style={[styles.modalSubtitle, {color: theme.text.tertiary}]}>
                  Playing from library
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowQueue(false)}
                style={[styles.closeModalBtn, {backgroundColor: theme.bg.glassSubtle}]}>
                <X size={20} color={theme.text.primary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={queue}
              keyExtractor={item => item.id}
              renderItem={({item, index}) => (
                <TrackRow
                  track={item}
                  queue={queue}
                  isCurrentTrack={currentTrack.id === item.id}
                  index={index}
                  showIndex
                  onPress={() => setShowQueue(false)}
                />
              )}
              contentContainerStyle={{paddingBottom: spacing['8']}}
            />
          </LiquidGlass>
        </View>
      </Modal>

      {/* ─── Sleep Timer Modal ───────────────────────────────────── */}
      <SleepTimerModal
        visible={showSleepTimer}
        onClose={() => setShowSleepTimer(false)}
      />
    </Forest3DBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['5'],
    paddingTop: spacing['2'],
    height: 52,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBrand: {
    alignItems: 'center',
  },
  brandText: {
    fontSize: typography.xs,
    fontWeight: typography.heavy,
    letterSpacing: 2,
  },
  nowPlayingLabel: {
    fontSize: 9,
    fontWeight: typography.bold,
    letterSpacing: 1,
    marginTop: 2,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing['4'],
  },
  artworkSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['6'],
    maxHeight: ARTWORK_SIZE + 32,
  },
  artworkWrapper: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualizerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['1'],
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['7'],
    paddingVertical: spacing['2'],
  },
  titleColumn: {
    flex: 1,
    marginRight: spacing['4'],
  },
  trackTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    letterSpacing: -0.3,
  },
  trackArtist: {
    fontSize: typography.md,
    fontWeight: typography.medium,
    marginTop: 3,
  },
  trackAlbum: {
    fontSize: typography.xs,
    marginTop: 2,
  },
  favButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    paddingVertical: spacing['1'],
  },
  speedRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['1'],
  },
  speedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['3.5'],
    paddingVertical: spacing['1.5'],
    gap: spacing['1.5'],
  },
  speedText: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    fontFamily: typography.mono,
  },
  controlsOuter: {
    paddingHorizontal: spacing['5'],
    paddingBottom: spacing['6'],
  },
  controlsDeck: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['2'],
  },
  controlPill: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  masterPlayBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#8055FF',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  playGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    height: H * 0.75,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: spacing['5'],
    paddingHorizontal: spacing['4'],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2'],
    paddingBottom: spacing['4'],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  modalTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
  },
  modalSubtitle: {
    fontSize: typography.xs,
    marginTop: 2,
  },
  closeModalBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
