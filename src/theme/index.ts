/**
 * theme/index.ts — GOKUL Player Design Tokens & Liquid Glass System.
 * Ultra-premium Obsidian Dark & Luminous Light aesthetics.
 */
import {Platform, Dimensions} from 'react-native';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// ─── Primitive Palette ────────────────────────────────────────────────────────
const palette = {
  // Obsidian & Deep Tones
  obsidian: '#08090D',
  charcoal: '#12141B',
  graphite: '#191C25',
  slate: '#222533',
  darkSurface: '#151722',

  // Pure & Near Whites
  white: '#FFFFFF',
  snow: '#F7F7FB',
  fog: '#E4E5EE',
  silver: '#A5A8B7',
  muted: '#656575',

  // Electric Violet / Purple Accents
  violetPrimary: '#8055FF',
  violetLight: '#B59AFF',
  violetDark: '#5E30EB',
  violetGlow: 'rgba(128, 85, 255, 0.35)',
  violetMuted: 'rgba(128, 85, 255, 0.15)',

  // Light Mode Accents
  lightVioletPrimary: '#7047F5',
  lightVioletSecondary: '#9275FF',

  // Secondary Accents
  electricAzure: '#3878FF',
  rose: '#FF4785',
  amber: '#FFA500',
  emerald: '#10B981',

  // Glass Specular & Reflection Tokens
  specularLight: 'rgba(255, 255, 255, 0.18)',
  specularSubtle: 'rgba(255, 255, 255, 0.08)',
  glassDarkFill: 'rgba(18, 20, 27, 0.72)',
  glassDarkBorder: 'rgba(255, 255, 255, 0.10)',
  glassLightFill: 'rgba(255, 255, 255, 0.85)',
  glassLightBorder: 'rgba(0, 0, 0, 0.08)',
};

// ─── Typography ───────────────────────────────────────────────────────────────
export const typography = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
  '4xl': 40,

  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,

  sans: Platform.select({ios: 'SF Pro Display', android: 'sans-serif'}),
  mono: Platform.select({ios: 'SF Mono', android: 'monospace'}),

  tight: 1.15,
  normal: 1.45,
  relaxed: 1.65,
};

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const spacing = {
  '0': 0,
  px: 1,
  '0.5': 2,
  '1': 4,
  '1.5': 6,
  '2': 8,
  '2.5': 10,
  '3': 12,
  '3.5': 14,
  '4': 16,
  '5': 20,
  '6': 24,
  '7': 28,
  '8': 32,
  '9': 36,
  '10': 40,
  '12': 48,
  '14': 56,
  '16': 64,
  '20': 80,
  '24': 96,
  full: '100%' as const,
};

// ─── Radii ────────────────────────────────────────────────────────────────────
export const radii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 26,
  '3xl': 34,
  pill: 9999,
  full: 9999,
};

// ─── Shadows & Elevation ──────────────────────────────────────────────────────
export const shadows = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  artwork: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 16},
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 16,
  },
  glow: (color = palette.violetPrimary) => ({
    shadowColor: color,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  }),
};

// ─── Motion Presets ───────────────────────────────────────────────────────────
export const motion = {
  spring: {
    snappy: {damping: 18, stiffness: 220},
    gentle: {damping: 24, stiffness: 140},
    bouncy: {damping: 12, stiffness: 160},
    tab: {damping: 20, stiffness: 200},
  },
  timing: {
    fast: 150,
    standard: 250,
    smooth: 350,
    ambient: 800,
  },
};

// ─── Dark Theme ───────────────────────────────────────────────────────────────
export const darkTheme = {
  dark: true,
  name: 'dark' as const,

  bg: {
    primary: palette.obsidian,
    secondary: palette.charcoal,
    elevated: palette.graphite,
    card: palette.darkSurface,
    glass: 'rgba(25, 28, 38, 0.70)',
    glassStrong: 'rgba(32, 35, 48, 0.85)',
    glassSubtle: 'rgba(255, 255, 255, 0.04)',
    overlay: 'rgba(8, 9, 13, 0.85)',
    surface: palette.charcoal,
    specular: 'rgba(255, 255, 255, 0.16)',
    specularLine: 'rgba(255, 255, 255, 0.24)',
  },

  text: {
    primary: palette.snow,
    secondary: palette.silver,
    tertiary: '#707487',
    inverse: palette.obsidian,
    accent: palette.violetLight,
    onDark: palette.white,
  },

  border: {
    subtle: 'rgba(255, 255, 255, 0.07)',
    default: 'rgba(255, 255, 255, 0.11)',
    strong: 'rgba(255, 255, 255, 0.22)',
    specularTop: 'rgba(255, 255, 255, 0.28)',
  },

  accent: {
    primary: palette.violetPrimary,
    secondary: palette.violetLight,
    glow: palette.violetGlow,
    muted: palette.violetMuted,
    gradient: [palette.violetPrimary, palette.electricAzure] as [string, string],
  },

  player: {
    bg: 'rgba(10, 11, 16, 0.96)',
    seekBar: 'rgba(255, 255, 255, 0.12)',
    seekFill: palette.violetPrimary,
    seekThumb: palette.white,
    glow: palette.violetGlow,
  },

  miniPlayer: {
    bg: 'rgba(18, 20, 27, 0.88)',
    border: 'rgba(255, 255, 255, 0.12)',
    highlight: 'rgba(255, 255, 255, 0.20)',
    shadow: 'rgba(0, 0, 0, 0.60)',
  },

  tabBar: {
    bg: 'rgba(12, 14, 20, 0.92)',
    border: 'rgba(255, 255, 255, 0.08)',
    active: palette.violetLight,
    inactive: '#626577',
    indicator: 'rgba(128, 85, 255, 0.20)',
  },

  success: palette.emerald,
  warning: palette.amber,
  error: palette.rose,

  palette,
};

// ─── Light Theme ──────────────────────────────────────────────────────────────
export const lightTheme = {
  dark: false,
  name: 'light' as const,

  bg: {
    primary: '#F6F5FB',
    secondary: '#EEECF6',
    elevated: '#FFFFFF',
    card: '#FFFFFF',
    glass: 'rgba(255, 255, 255, 0.84)',
    glassStrong: 'rgba(255, 255, 255, 0.94)',
    glassSubtle: 'rgba(255, 255, 255, 0.50)',
    overlay: 'rgba(15, 16, 26, 0.45)',
    surface: '#FFFFFF',
    specular: 'rgba(255, 255, 255, 0.95)',
    specularLine: 'rgba(255, 255, 255, 1.0)',
  },

  text: {
    primary: '#171721',
    secondary: '#656575',
    tertiary: '#9393A3',
    inverse: palette.snow,
    accent: palette.lightVioletPrimary,
    onDark: palette.white,
  },

  border: {
    subtle: 'rgba(0, 0, 0, 0.05)',
    default: 'rgba(0, 0, 0, 0.09)',
    strong: 'rgba(0, 0, 0, 0.18)',
    specularTop: 'rgba(255, 255, 255, 0.9)',
  },

  accent: {
    primary: palette.lightVioletPrimary,
    secondary: palette.lightVioletSecondary,
    glow: 'rgba(112, 71, 245, 0.28)',
    muted: 'rgba(112, 71, 245, 0.10)',
    gradient: [palette.lightVioletPrimary, '#5A38DB'] as [string, string],
  },

  player: {
    bg: 'rgba(246, 245, 251, 0.98)',
    seekBar: 'rgba(0, 0, 0, 0.08)',
    seekFill: palette.lightVioletPrimary,
    seekThumb: palette.lightVioletPrimary,
    glow: 'rgba(112, 71, 245, 0.28)',
  },

  miniPlayer: {
    bg: 'rgba(255, 255, 255, 0.92)',
    border: 'rgba(0, 0, 0, 0.08)',
    highlight: 'rgba(255, 255, 255, 0.95)',
    shadow: 'rgba(0, 0, 0, 0.12)',
  },

  tabBar: {
    bg: 'rgba(248, 247, 253, 0.94)',
    border: 'rgba(0, 0, 0, 0.06)',
    active: palette.lightVioletPrimary,
    inactive: '#8B8C9C',
    indicator: 'rgba(112, 71, 245, 0.12)',
  },

  success: palette.emerald,
  warning: palette.amber,
  error: palette.rose,

  palette,
};

export type AppTheme = typeof darkTheme | typeof lightTheme;

// ─── Layout Constants ─────────────────────────────────────────────────────────
export const SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
};

export const LAYOUT = {
  tabBarHeight: 74,
  miniPlayerHeight: 66,
  safeBottomPadding: Platform.select({ios: 34, android: 16}) ?? 16,
  headerHeight: 56,
};

export default {
  palette,
  typography,
  spacing,
  radii,
  shadows,
  motion,
  darkTheme,
  lightTheme,
  SCREEN,
  LAYOUT,
};
