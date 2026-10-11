/**
 * SettingsScreen.tsx — GOKUL Player Preferences & About.
 * Features theme mode selection, offline storage inspection,
 * library rescan action and GOKUL Player branding details.
 */
import React, {useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Moon,
  Sun,
  Monitor,
  HardDrive,
  Music2,
  Info,
  RefreshCw,
  WifiOff,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';
import {useStore} from '../store';
import {useTheme} from '../hooks/useTheme';
import {LiquidGlass} from '../components/LiquidGlass';
import {ThemeMode} from '../types';
import {spacing, typography, radii, LAYOUT} from '../theme';

const THEME_OPTIONS: {mode: ThemeMode; label: string; Icon: any}[] = [
  {mode: 'system', label: 'System', Icon: Monitor},
  {mode: 'dark', label: 'Dark', Icon: Moon},
  {mode: 'light', label: 'Light', Icon: Sun},
];

export default function SettingsScreen() {
  const theme = useTheme();
  const tracks = useStore(s => s.tracks);
  const themeMode = useStore(s => s.themeMode);
  const setThemeMode = useStore(s => s.setThemeMode);
  const loadTracks = useStore(s => s.loadTracks);

  const totalSize = tracks.reduce((acc, t) => acc + t.fileSizeBytes, 0);
  const totalMB = (totalSize / (1024 * 1024)).toFixed(1);

  const handleRescan = useCallback(async () => {
    await loadTracks();
    Alert.alert('Library Sync', `Verified ${tracks.length} local bundled audio tracks.`);
  }, [loadTracks, tracks.length]);

  return (
    <View style={[styles.container, {backgroundColor: theme.bg.primary}]}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView edges={['top']} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: LAYOUT.tabBarHeight + LAYOUT.miniPlayerHeight + spacing['10'],
        }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.heading, {color: theme.text.primary}]}>
            Settings
          </Text>
          <Text style={[styles.subheading, {color: theme.text.tertiary}]}>
            GOKUL Player v1.0.0
          </Text>
        </View>

        {/* ─── Appearance Section ───────────────────────────────── */}
        <Text style={[styles.sectionTitle, {color: theme.text.tertiary}]}>
          APPEARANCE
        </Text>
        <LiquidGlass level="card" radius={radii.xl} style={styles.card}>
          <Text style={[styles.cardHeading, {color: theme.text.primary}]}>
            Interface Theme
          </Text>
          <Text style={[styles.cardDescription, {color: theme.text.secondary}]}>
            Obsidian Dark or Luminous Light with Liquid Glass reflection
          </Text>

          <View style={styles.themeGrid}>
            {THEME_OPTIONS.map(opt => {
              const active = themeMode === opt.mode;
              return (
                <TouchableOpacity
                  key={opt.mode}
                  onPress={() => setThemeMode(opt.mode)}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: active
                        ? theme.accent.primary
                        : theme.bg.glassSubtle,
                      borderColor: active
                        ? theme.accent.primary
                        : theme.border.default,
                    },
                  ]}>
                  <opt.Icon
                    size={18}
                    color={active ? '#FFFFFF' : theme.text.secondary}
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.themeOptionLabel,
                      {color: active ? '#FFFFFF' : theme.text.secondary},
                    ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </LiquidGlass>

        {/* ─── Storage & Library Section ────────────────────────── */}
        <Text style={[styles.sectionTitle, {color: theme.text.tertiary}]}>
          STORAGE & LIBRARY
        </Text>
        <LiquidGlass level="card" radius={radii.xl} style={styles.card}>
          <View style={styles.statRow}>
            <View style={styles.statLeft}>
              <Music2 size={20} color={theme.accent.primary} strokeWidth={2} />
              <View>
                <Text style={[styles.statLabel, {color: theme.text.primary}]}>
                  Bundled Music Library
                </Text>
                <Text style={[styles.statSub, {color: theme.text.tertiary}]}>
                  High-fidelity local tracks
                </Text>
              </View>
            </View>
            <Text style={[styles.statValue, {color: theme.text.primary}]}>
              {tracks.length} tracks
            </Text>
          </View>

          <View style={[styles.divider, {backgroundColor: theme.border.subtle}]} />

          <View style={styles.statRow}>
            <View style={styles.statLeft}>
              <HardDrive size={20} color={theme.accent.secondary} strokeWidth={2} />
              <View>
                <Text style={[styles.statLabel, {color: theme.text.primary}]}>
                  Local Storage Used
                </Text>
                <Text style={[styles.statSub, {color: theme.text.tertiary}]}>
                  Internal app private storage
                </Text>
              </View>
            </View>
            <Text style={[styles.statValue, {color: theme.text.primary}]}>
              {totalMB} MB
            </Text>
          </View>

          <View style={[styles.divider, {backgroundColor: theme.border.subtle}]} />

          <TouchableOpacity
            onPress={handleRescan}
            style={styles.actionRow}>
            <View style={styles.statLeft}>
              <RefreshCw size={18} color={theme.text.primary} strokeWidth={2} />
              <Text style={[styles.actionLabel, {color: theme.text.primary}]}>
                Rescan & Verify Audio Index
              </Text>
            </View>
          </TouchableOpacity>
        </LiquidGlass>

        {/* ─── Privacy & Offline Operation ──────────────────────── */}
        <Text style={[styles.sectionTitle, {color: theme.text.tertiary}]}>
          OFFLINE GUARANTEE
        </Text>
        <LiquidGlass level="card" radius={radii.xl} style={styles.card}>
          <View style={styles.statRow}>
            <View style={styles.statLeft}>
              <WifiOff size={20} color={theme.success} strokeWidth={2} />
              <View>
                <Text style={[styles.statLabel, {color: theme.text.primary}]}>
                  100% Offline Architecture
                </Text>
                <Text style={[styles.statSub, {color: theme.text.tertiary}]}>
                  Zero remote tracking, zero network reliance
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.divider, {backgroundColor: theme.border.subtle}]} />

          <View style={styles.statRow}>
            <View style={styles.statLeft}>
              <ShieldCheck size={20} color={theme.success} strokeWidth={2} />
              <View>
                <Text style={[styles.statLabel, {color: theme.text.primary}]}>
                  Private Local Database
                </Text>
                <Text style={[styles.statSub, {color: theme.text.tertiary}]}>
                  Encrypted on-device SQLite database
                </Text>
              </View>
            </View>
          </View>
        </LiquidGlass>

        {/* ─── About GOKUL Player ───────────────────────────────── */}
        <Text style={[styles.sectionTitle, {color: theme.text.tertiary}]}>
          ABOUT
        </Text>
        <LiquidGlass level="card" radius={radii.xl} style={styles.card}>
          <View style={styles.aboutHeader}>
            <Sparkles size={20} color={theme.accent.primary} />
            <Text style={[styles.aboutBrand, {color: theme.text.primary}]}>
              GOKUL Player
            </Text>
          </View>
          <Text style={[styles.aboutText, {color: theme.text.secondary}]}>
            GOKUL Player is an ultra-premium offline audio application engineered with Liquid Glass surfaces, 2.5D artwork depth, and native audio precision.
          </Text>
          <View style={[styles.divider, {backgroundColor: theme.border.subtle}]} />
          <View style={styles.statRow}>
            <Text style={[styles.statSub, {color: theme.text.tertiary}]}>
              Engine
            </Text>
            <Text style={[styles.statSub, {color: theme.text.secondary}]}>
              React Native 0.73.6 • Hermes JS
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statSub, {color: theme.text.tertiary}]}>
              Audio Architecture
            </Text>
            <Text style={[styles.statSub, {color: theme.text.secondary}]}>
              ExoPlayer + SQLite Core
            </Text>
          </View>
        </LiquidGlass>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing['5'],
    paddingTop: spacing['3'],
    paddingBottom: spacing['4'],
  },
  heading: {
    fontSize: typography['3xl'],
    fontWeight: typography.heavy,
    letterSpacing: -0.6,
  },
  subheading: {
    fontSize: typography.xs,
    marginTop: 2,
    fontWeight: typography.medium,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: typography.heavy,
    letterSpacing: 1.2,
    paddingHorizontal: spacing['5'],
    marginBottom: spacing['2'],
    marginTop: spacing['3'],
  },
  card: {
    marginHorizontal: spacing['4'],
    padding: spacing['4'],
    marginBottom: spacing['2'],
  },
  cardHeading: {
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
  cardDescription: {
    fontSize: typography.xs,
    marginTop: 2,
    marginBottom: spacing['3'],
  },
  themeGrid: {
    flexDirection: 'row',
    gap: spacing['2.5'],
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2.5'],
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing['2'],
  },
  themeOptionLabel: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing['1.5'],
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    flex: 1,
  },
  statLabel: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  statSub: {
    fontSize: 11,
    marginTop: 1,
  },
  statValue: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    fontFamily: typography.mono,
  },
  divider: {
    height: 1,
    marginVertical: spacing['2.5'],
  },
  actionRow: {
    paddingVertical: spacing['1'],
  },
  actionLabel: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginBottom: spacing['2'],
  },
  aboutBrand: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    letterSpacing: -0.2,
  },
  aboutText: {
    fontSize: typography.xs,
    lineHeight: 18,
  },
});
