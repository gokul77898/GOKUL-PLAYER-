// ─── Track ───────────────────────────────────────────────────────────────────
export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // seconds
  durationFormatted: string;
  url: string; // local file URI
  artwork?: string; // local artwork URI or undefined
  hasArtwork: boolean;
  safeFilename: string;
  originalFilename: string;
  fileSizeBytes: number;
  addedAt: number; // timestamp
  playCount: number;
  lastPlayedAt?: number;
  isFavorite: boolean;
}

// ─── Playlist ─────────────────────────────────────────────────────────────────
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  trackIds: string[];
  coverArtwork?: string;
}

// ─── Player State ─────────────────────────────────────────────────────────────
export type RepeatMode = 'off' | 'track' | 'queue';
export type ShuffleMode = 'off' | 'on';

export interface PlayerState {
  currentTrackId: string | null;
  isPlaying: boolean;
  position: number; // seconds
  duration: number; // seconds
  repeatMode: RepeatMode;
  shuffleMode: ShuffleMode;
  queue: string[]; // track IDs
  queueIndex: number;
}

// ─── Manifest Track (raw from JSON asset) ─────────────────────────────────────
export interface ManifestTrack {
  id: string;
  originalFilename: string;
  safeFilename: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  durationFormatted: string;
  hasArtwork: boolean;
  artworkFile: string | null;
  fileSizeBytes: number;
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export type ThemeMode = 'system' | 'light' | 'dark';

export interface AppSettings {
  themeMode: ThemeMode;
  libraryInitialized: boolean;
  appVersion: string;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
export type RootTabParamList = {
  Home: undefined;
  Library: undefined;
  Playlists: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  NowPlaying: undefined;
  PlaylistDetail: { playlistId: string };
};
