/**
 * Zustand global store — library, player state, settings, playlists.
 */
import {create} from 'zustand';
import {Track, Playlist, RepeatMode, ShuffleMode, ThemeMode} from '../types';
import * as DB from '../services/DatabaseService';
import * as PlayerSvc from '../services/PlayerService';

// ─── Library Slice ────────────────────────────────────────────────────────────
interface LibrarySlice {
  tracks: Track[];
  playlists: Playlist[];
  isLoading: boolean;
  error: string | null;
  loadTracks: () => Promise<void>;
  loadPlaylists: () => Promise<void>;
  toggleFavorite: (trackId: string) => Promise<void>;
  createPlaylist: (name: string) => Promise<Playlist>;
  addToPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  removeFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
}

// ─── Player Slice ─────────────────────────────────────────────────────────────
interface PlayerSlice {
  currentTrack: Track | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  repeatMode: RepeatMode;
  shuffleMode: ShuffleMode;
  queue: Track[];
  queueIndex: number;
  setCurrentTrack: (track: Track | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  setQueue: (tracks: Track[], index: number) => void;
  playTrack: (track: Track, queue?: Track[]) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  skipNext: () => Promise<void>;
  skipPrevious: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  cycleRepeat: () => Promise<void>;
  playbackRate: number;
  setPlaybackRate: (rate: number) => Promise<void>;
  sleepTimerMinutes: number | null;
  sleepTimerRemainingSec: number | null;
  sleepTimerActive: boolean;
  setSleepTimer: (minutes: number) => void;
  clearSleepTimer: () => void;
}

// ─── Settings Slice ───────────────────────────────────────────────────────────
interface SettingsSlice {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  loadSettings: () => Promise<void>;
}

// ─── Combined Store ───────────────────────────────────────────────────────────
type AppStore = LibrarySlice & PlayerSlice & SettingsSlice;

let _sleepInterval: ReturnType<typeof setInterval> | null = null;

export const useStore = create<AppStore>((set, get) => ({
  // ── Library ──────────────────────────────────────────────────────────────
  tracks: [],
  playlists: [],
  isLoading: false,
  error: null,

  loadTracks: async () => {
    set({isLoading: true, error: null});
    try {
      const tracks = await DB.getAllTracks();
      set({tracks, isLoading: false});
    } catch (err: any) {
      set({error: err.message, isLoading: false});
    }
  },

  loadPlaylists: async () => {
    try {
      const playlists = await DB.getAllPlaylists();
      set({playlists});
    } catch (err: any) {
      set({error: err.message});
    }
  },

  toggleFavorite: async (trackId: string) => {
    const track = get().tracks.find(t => t.id === trackId);
    if (!track) return;
    const newFav = !track.isFavorite;
    await DB.setTrackFavorite(trackId, newFav);
    set(state => ({
      tracks: state.tracks.map(t =>
        t.id === trackId ? {...t, isFavorite: newFav} : t,
      ),
      currentTrack:
        state.currentTrack?.id === trackId
          ? {...state.currentTrack, isFavorite: newFav}
          : state.currentTrack,
    }));
  },

  createPlaylist: async (name: string) => {
    const pl = await DB.createPlaylist(name);
    set(state => ({playlists: [pl, ...state.playlists]}));
    return pl;
  },

  addToPlaylist: async (playlistId: string, trackId: string) => {
    await DB.addTrackToPlaylist(playlistId, trackId);
    await get().loadPlaylists();
  },

  removeFromPlaylist: async (playlistId: string, trackId: string) => {
    await DB.removeTrackFromPlaylist(playlistId, trackId);
    await get().loadPlaylists();
  },

  deletePlaylist: async (playlistId: string) => {
    await DB.deletePlaylist(playlistId);
    set(state => ({
      playlists: state.playlists.filter(p => p.id !== playlistId),
    }));
  },

  // ── Player ───────────────────────────────────────────────────────────────
  currentTrack: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  repeatMode: 'off',
  shuffleMode: 'off',
  queue: [],
  queueIndex: 0,
  playbackRate: 1.0,
  sleepTimerMinutes: null,
  sleepTimerRemainingSec: null,
  sleepTimerActive: false,

  setCurrentTrack: track => set({currentTrack: track}),
  setIsPlaying: playing => set({isPlaying: playing}),
  setPosition: position => set({position}),
  setDuration: duration => set({duration}),
  setQueue: (tracks, index) => set({queue: tracks, queueIndex: index}),

  playTrack: async (track: Track, queue?: Track[]) => {
    const {tracks} = get();
    const actualQueue = queue ?? tracks;
    const idx = actualQueue.findIndex(t => t.id === track.id);
    const startIdx = idx >= 0 ? idx : 0;
    set({currentTrack: track, queue: actualQueue, queueIndex: startIdx, isPlaying: true});
    await PlayerSvc.playQueue(actualQueue, startIdx);
    // Update play count in local state
    DB.incrementPlayCount(track.id).catch(console.warn);
    set(state => ({
      tracks: state.tracks.map(t =>
        t.id === track.id
          ? {...t, playCount: t.playCount + 1, lastPlayedAt: Date.now()}
          : t,
      ),
    }));
  },

  togglePlayPause: async () => {
    const {isPlaying} = get();
    await PlayerSvc.togglePlayPause();
    set({isPlaying: !isPlaying});
  },

  skipNext: async () => {
    await PlayerSvc.skipToNext();
    const {queue, queueIndex} = get();
    const nextIdx = (queueIndex + 1) % queue.length;
    set({queueIndex: nextIdx, currentTrack: queue[nextIdx] ?? null});
  },

  skipPrevious: async () => {
    await PlayerSvc.skipToPrevious();
    const {queue, queueIndex} = get();
    const prevIdx = queueIndex > 0 ? queueIndex - 1 : 0;
    set({queueIndex: prevIdx, currentTrack: queue[prevIdx] ?? null});
  },

  seekTo: async (seconds: number) => {
    await PlayerSvc.seekTo(seconds);
    set({position: seconds});
  },

  setRepeatMode: (mode: RepeatMode) => {
    set({repeatMode: mode});
    PlayerSvc.setRepeatMode(mode).catch(console.warn);
  },

  cycleRepeat: async () => {
    const {repeatMode} = get();
    const next: RepeatMode =
      repeatMode === 'off' ? 'queue' : repeatMode === 'queue' ? 'track' : 'off';
    get().setRepeatMode(next);
  },

  toggleShuffle: () => {
    const {shuffleMode, queue} = get();
    const next: ShuffleMode = shuffleMode === 'off' ? 'on' : 'off';
    if (next === 'on') {
      // Shuffle queue
      const shuffled = [...queue].sort(() => Math.random() - 0.5);
      set({shuffleMode: next, queue: shuffled, queueIndex: 0});
    } else {
      set({shuffleMode: next});
    }
  },

  setPlaybackRate: async (rate: number) => {
    await PlayerSvc.setRate(rate);
    set({playbackRate: rate});
  },

  setSleepTimer: (minutes: number) => {
    if (_sleepInterval) {
      clearInterval(_sleepInterval);
      _sleepInterval = null;
    }
    const totalSec = minutes * 60;
    set({
      sleepTimerMinutes: minutes,
      sleepTimerRemainingSec: totalSec,
      sleepTimerActive: true,
    });

    _sleepInterval = setInterval(async () => {
      const remaining = get().sleepTimerRemainingSec;
      if (remaining === null || remaining <= 1) {
        if (_sleepInterval) clearInterval(_sleepInterval);
        _sleepInterval = null;
        await PlayerSvc.pause();
        await PlayerSvc.setVolume(1.0);
        set({
          sleepTimerActive: false,
          sleepTimerRemainingSec: null,
          sleepTimerMinutes: null,
          isPlaying: false,
        });
      } else {
        const nextSec = remaining - 1;
        // Smooth audio fade-out in final 15 seconds
        if (nextSec <= 15) {
          const fadeVol = Math.max(0.05, nextSec / 15);
          PlayerSvc.setVolume(fadeVol).catch(() => {});
        }
        set({sleepTimerRemainingSec: nextSec});
      }
    }, 1000);
  },

  clearSleepTimer: () => {
    if (_sleepInterval) {
      clearInterval(_sleepInterval);
      _sleepInterval = null;
    }
    PlayerSvc.setVolume(1.0).catch(() => {});
    set({
      sleepTimerActive: false,
      sleepTimerRemainingSec: null,
      sleepTimerMinutes: null,
    });
  },

  // ── Settings ─────────────────────────────────────────────────────────────
  themeMode: 'system',

  loadSettings: async () => {
    try {
      await DB.initDatabase();
      const theme = await DB.getSetting('theme_mode');
      if (theme === 'light' || theme === 'dark' || theme === 'system') {
        set({themeMode: theme});
      }
    } catch (err) {
      console.warn('[Store] loadSettings error:', err);
    }
  },

  setThemeMode: async (mode: ThemeMode) => {
    set({themeMode: mode});
    await DB.setSetting('theme_mode', mode);
  },
}));

// Convenient selectors
export const selectTracks = (s: AppStore) => s.tracks;
export const selectCurrentTrack = (s: AppStore) => s.currentTrack;
export const selectIsPlaying = (s: AppStore) => s.isPlaying;
export const selectFavorites = (s: AppStore) =>
  s.tracks.filter(t => t.isFavorite);
export const selectPlaylists = (s: AppStore) => s.playlists;
