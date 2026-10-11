/**
 * theme.test.ts
 * Validates GOKUL Player design system tokens, themes, contrast, and layout constants.
 */
import {darkTheme, lightTheme, spacing, typography, radii, LAYOUT} from '../src/theme';

describe('Design System & Themes', () => {
  test('dark theme has high-contrast Obsidian dark surfaces', () => {
    expect(darkTheme.dark).toBe(true);
    expect(darkTheme.bg.primary).toBe('#08090D');
    expect(darkTheme.text.primary).toBe('#F7F7FB');
    expect(darkTheme.accent.primary).toBeDefined();
    expect(darkTheme.bg.glass).toContain('rgba');
  });

  test('light theme has clean frosted light surfaces', () => {
    expect(lightTheme.dark).toBe(false);
    expect(lightTheme.bg.primary).toBe('#F6F5FB');
    expect(lightTheme.text.primary).toBe('#171721');
    expect(lightTheme.accent.primary).toBeDefined();
    expect(lightTheme.bg.glass).toContain('rgba');
  });

  test('layout constants accommodate bottom tab bar and persistent mini player', () => {
    expect(LAYOUT.tabBarHeight).toBe(74);
    expect(LAYOUT.miniPlayerHeight).toBe(66);
    expect(LAYOUT.headerHeight).toBe(56);
  });

  test('spacing, radii, and typography tokens are well defined', () => {
    expect(spacing['4']).toBe(16);
    expect(spacing['8']).toBe(32);
    expect(typography.base).toBe(15);
    expect(typography.lg).toBe(20);
    expect(radii.lg).toBe(16);
    expect(radii.full).toBe(9999);
  });
});
