/**
 * useTheme — returns the active theme based on system/user preference.
 */
import {useColorScheme} from 'react-native';
import {useMemo} from 'react';
import {darkTheme, lightTheme, AppTheme} from '../theme';
import {useStore} from '../store';
import {ThemeMode} from '../types';

export function useTheme(): AppTheme {
  const systemScheme = useColorScheme();
  const themeMode = useStore(s => s.themeMode);

  return useMemo(() => {
    if (themeMode === 'dark') return darkTheme;
    if (themeMode === 'light') return lightTheme;
    // System
    return systemScheme === 'dark' ? darkTheme : lightTheme;
  }, [themeMode, systemScheme]);
}

export default useTheme;
