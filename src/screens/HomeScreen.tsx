/**
 * HomeScreen.tsx — GOKUL Player "Your Music" Experience.
 * Features brand header, greeting, stats pill, glowing Shuffle All action,
 * and horizontally scrolling carousels for recently played & favorites.
 */
import React, {useMemo, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  FlatList,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  Shuffle,
  Heart,
  Clock,
  Sparkles,
  Music2,
  HardDrive,
  Play,
} from 'lucide-react-native';
import {useStore} from '../store';
import {useTheme} from '../hooks/useTheme';
import {ArtworkImage} from '../components/ArtworkImage';
import {LiquidGlass} from '../components/LiquidGlass';
import {TrackRow} from '../components/TrackRow';
import {Forest3DBackground} from '../components/Forest3DBackground';
import {Track} from '../types';
import {spacing, typography, radii, LAYOUT, motion} from '../theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_W = Math.max(140, SCREEN_WIDTH * 0.36);

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export default function HomeScreen() {
  const theme = useTheme();
  const tracks = useStore(s => s.tracks);
  const currentTrack = useStore(s => s.currentTrack);
  const playTrack = useStore(s => s.playTrack);

  const recentlyPlayed = useMemo(
    () =>
      [...tracks]
        .filter(t => t.lastPlayedAt)
        .sort((a, b) => (b.lastPlayedAt ?? 0) - (a.lastPlayedAt ?? 0))
        .slice(0, 10),
    [tracks],
  );

  const recentlyAdded = useMemo(
    () =>
      [...tracks]
        .sort((a, b) => b.addedAt - a.addedAt)
        .slice(0, 8),
    [tracks],
  );

  const favorites = useMemo(
    () => tracks.filter(t => t.isFavorite).slice(0, 10),
    [tracks],
  );

  const handleShuffleAll = useCallback(() => {
    if (tracks.length === 0) return;
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
    playTrack(shuffled[0], shuffled);
  }, [tracks, playTrack]);

  return (
    <Forest3DBackground style={styles.container}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView edges={['top']} style={styles.safeTop} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: LAYOUT.tabBarHeight + LAYOUT.miniPlayerHeight + spacing['10'],
        }}>
        {/* ─── Brand & Header Row ───────────────────────────────── */}
        <View style={styles.brandRow}>
          <LiquidGlass level="subtle" radius={radii.full} style={styles.brandBadge}>
            <View style={[styles.brandDot, {backgroundColor: theme.accent.primary}]} />
            <Text style={[styles.brandTitle, {color: theme.accent.primary}]}>
              GOKUL PLAYER
            </Text>
            <Text style={[styles.brandTag, {color: theme.dark ? '#A5A8B7' : '#45495E'}]}>
              • OFFLINE
            </Text>
          </LiquidGlass>
        </View>

        <View style={styles.heroSection}>
          <View>
            <Text style={[styles.greeting, {color: theme.text.tertiary}]}>
              Good {getTimeOfDay()}
            </Text>
            <Text style={[styles.heading, {color: theme.text.primary}]}>
              Your Music
            </Text>
          </View>

          {/* Quick Stats Pill */}
          <LiquidGlass level="subtle" radius={radii.full} style={styles.statsPill}>
            <Music2 size={13} color={theme.accent.primary} strokeWidth={2.2} />
            <Text style={[styles.statsText, {color: theme.text.secondary}]}>
              {tracks.length} tracks
            </Text>
            <Text style={[styles.statsSep, {color: theme.border.default}]}>|</Text>
            <Heart size={13} color={theme.error} fill={theme.error} />
            <Text style={[styles.statsText, {color: theme.text.secondary}]}>
              {tracks.filter(t => t.isFavorite).length}
            </Text>
          </LiquidGlass>
        </View>

        {/* ─── Hero "Shuffle All" Action ────────────────────────── */}
        <View style={styles.shuffleHeroContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleShuffleAll}
            style={[styles.shuffleButton, {shadowColor: theme.accent.primary}]}>
            <LinearGradient
              colors={theme.accent.gradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.shuffleGradient}>
              <View style={styles.shuffleContent}>
                <Shuffle size={20} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.shuffleText}>Shuffle All 32 Tracks</Text>
              </View>
              <View style={styles.shufflePlayIcon}>
                <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ─── Recently Played (Horizontal Carousel) ────────────── */}
        {recentlyPlayed.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Clock size={18} color={theme.accent.primary} strokeWidth={2.2} />
                <Text style={[styles.sectionTitle, {color: theme.text.primary}]}>
                  Recently Played
                </Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}>
              {recentlyPlayed.map((item, idx) => (
                <LiquidGlass
                  key={item.id}
                  level="card"
                  radius={radii.xl}
                  style={styles.card}
                  onPress={() => playTrack(item, recentlyPlayed)}>
                  <ArtworkImage
                    track={item}
                    size={CARD_W - spacing['5']}
                    radius={radii.lg}
                    showShadow
                  />
                  <Text
                    style={[styles.cardTitle, {color: theme.text.primary}]}
                    numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.cardArtist,
                      {color: theme.dark ? '#A5A8B7' : '#45495E'},
                    ]}
                    numberOfLines={1}>
                    {item.artist}
                  </Text>
                </LiquidGlass>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ─── Favorites Section ─────────────────────────────────── */}
        {favorites.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Heart size={18} color={theme.error} fill={theme.error} />
                <Text style={[styles.sectionTitle, {color: theme.text.primary}]}>
                  Favorites
                </Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}>
              {favorites.map(item => (
                <LiquidGlass
                  key={item.id}
                  level="card"
                  radius={radii.xl}
                  style={styles.card}
                  onPress={() => playTrack(item, favorites)}>
                  <ArtworkImage
                    track={item}
                    size={CARD_W - spacing['5']}
                    radius={radii.lg}
                    showShadow
                  />
                  <Text
                    style={[styles.cardTitle, {color: theme.text.primary}]}
                    numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.cardArtist,
                      {color: theme.dark ? '#A5A8B7' : '#45495E'},
                    ]}
                    numberOfLines={1}>
                    {item.artist}
                  </Text>
                </LiquidGlass>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ─── Recently Added Section ───────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Sparkles size={18} color={theme.accent.secondary} strokeWidth={2.2} />
              <Text style={[styles.sectionTitle, {color: theme.text.primary}]}>
                Bundled Library
              </Text>
            </View>
          </View>

          <View style={styles.verticalList}>
            {recentlyAdded.map((item, index) => (
              <TrackRow
                key={item.id}
                track={item}
                queue={tracks}
                isCurrentTrack={currentTrack?.id === item.id}
                index={index}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </Forest3DBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  safeTop: {
    paddingBottom: spacing['1'],
  },
  scroll: {
    flex: 1,
  },
  brandRow: {
    paddingHorizontal: spacing['5'],
    paddingTop: spacing['2'],
    marginBottom: spacing['1'],
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  brandDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  brandTitle: {
    fontSize: typography.xs,
    fontWeight: typography.heavy,
    letterSpacing: 2,
  },
  brandTag: {
    fontSize: 10,
    fontWeight: typography.bold,
    letterSpacing: 0.5,
  },
  heroSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['5'],
    marginTop: spacing['2'],
    marginBottom: spacing['4'],
  },
  greeting: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    letterSpacing: 0.3,
  },
  heading: {
    fontSize: typography['3xl'],
    fontWeight: typography.heavy,
    letterSpacing: -0.6,
    marginTop: 2,
  },
  statsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['1.5'],
    gap: spacing['1.5'],
  },
  statsText: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
  },
  statsSep: {
    fontSize: 12,
  },
  shuffleHeroContainer: {
    paddingHorizontal: spacing['5'],
    marginBottom: spacing['5'],
  },
  shuffleButton: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  shuffleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['4'],
  },
  shuffleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  shuffleText: {
    color: '#FFFFFF',
    fontSize: typography.base,
    fontWeight: typography.bold,
    letterSpacing: 0.2,
  },
  shufflePlayIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: spacing['6'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['5'],
    marginBottom: spacing['3'],
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    letterSpacing: -0.3,
  },
  horizontalScroll: {
    paddingHorizontal: spacing['5'],
    gap: spacing['3.5'],
  },
  card: {
    width: CARD_W,
    padding: spacing['2.5'],
  },
  cardTitle: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    marginTop: spacing['2'],
    letterSpacing: -0.2,
  },
  cardArtist: {
    fontSize: typography.xs,
    fontWeight: typography.regular,
    marginTop: 2,
  },
  verticalList: {
    paddingHorizontal: spacing['4'],
  },
});
