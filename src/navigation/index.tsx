/**
 * navigation/index.tsx — Root Navigation with Liquid Glass Tab Bar.
 */
import React from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  Home,
  Library,
  ListMusic,
  Settings,
} from 'lucide-react-native';
import {useTheme} from '../hooks/useTheme';
import {MiniPlayer} from '../components/MiniPlayer';
import HomeScreen from '../screens/HomeScreen';
import LibraryScreen from '../screens/LibraryScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NowPlayingScreen from '../screens/NowPlayingScreen';
import {RootTabParamList, RootStackParamList} from '../types';
import {LAYOUT, spacing} from '../theme';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabNavigator() {
  const theme = useTheme();

  return (
    <View style={styles.tabContainer}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: LAYOUT.tabBarHeight,
            backgroundColor: theme.tabBar.bg,
            borderTopColor: theme.tabBar.border,
            borderTopWidth: StyleSheet.hairlineWidth,
            paddingBottom: Platform.select({ios: 18, android: 8}) ?? 8,
            paddingTop: spacing['2'],
            elevation: 8,
          },
          tabBarActiveTintColor: theme.tabBar.active,
          tabBarInactiveTintColor: theme.tabBar.inactive,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 0.3,
            marginTop: 2,
          },
        }}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({color, size}) => (
              <Home size={22} color={color} strokeWidth={2} />
            ),
          }}
        />
        <Tab.Screen
          name="Library"
          component={LibraryScreen}
          options={{
            tabBarLabel: 'Library',
            tabBarIcon: ({color, size}) => (
              <Library size={22} color={color} strokeWidth={2} />
            ),
          }}
        />
        <Tab.Screen
          name="Playlists"
          component={PlaylistsScreen}
          options={{
            tabBarLabel: 'Playlists',
            tabBarIcon: ({color, size}) => (
              <ListMusic size={22} color={color} strokeWidth={2} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({color, size}) => (
              <Settings size={22} color={color} strokeWidth={2} />
            ),
          }}
        />
      </Tab.Navigator>
      <MiniPlayer />
    </View>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_bottom',
        }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="NowPlaying"
          component={NowPlayingScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
    position: 'relative',
  },
});

export default AppNavigator;
