/**
 * LibraryService — copies bundled assets to app storage on first launch
 * and populates the SQLite database. Idempotent: safe to call on every restart.
 *
 * Strategy:
 *  1. Check if library is already initialized (settings table flag).
 *  2. For each track in track_manifest.json, verify the destination file exists.
 *  3. If not, copy from the bundled asset directory.
 *  4. Upsert track metadata into SQLite.
 *  5. Set initialized flag.
 */
import RNFS from 'react-native-fs';
import {Platform} from 'react-native';
import {Track, ManifestTrack} from '../types';
import * as DB from './DatabaseService';

// Bundled manifest (static require — bundled at build time)
const MANIFEST: ManifestTrack[] = require('../../assets/track_manifest.json');

// Where we copy tracks to inside the app private storage
const MUSIC_DIR = `${RNFS.DocumentDirectoryPath}/music`;
const ARTWORK_DIR = `${RNFS.DocumentDirectoryPath}/artwork`;

// Android asset base path for bundled files
// react-native-fs uses asset:// prefix for Android assets
function bundledMusicPath(filename: string): string {
  if (Platform.OS === 'android') {
    return `asset:/music/${filename}`;
  }
  // iOS: files are in main bundle
  return `${RNFS.MainBundlePath}/music/${filename}`;
}

function bundledArtworkPath(filename: string): string {
  if (Platform.OS === 'android') {
    return `asset:/artwork/${filename}`;
  }
  return `${RNFS.MainBundlePath}/artwork/${filename}`;
}

function destMusicPath(filename: string): string {
  return `${MUSIC_DIR}/${filename}`;
}

function destArtworkPath(filename: string): string {
  return `${ARTWORK_DIR}/${filename}`;
}

function trackUrl(filename: string): string {
  return `file://${destMusicPath(filename)}`;
}

function artworkUrl(filename: string): string {
  return `file://${destArtworkPath(filename)}`;
}

export interface LibraryInitProgress {
  total: number;
  current: number;
  currentTrack: string;
  phase: 'copying' | 'indexing' | 'done';
}

type ProgressCallback = (progress: LibraryInitProgress) => void;

export async function initLibrary(
  onProgress?: ProgressCallback,
): Promise<{added: number; skipped: number}> {
  await DB.initDatabase();

  // Ensure directories exist
  await RNFS.mkdir(MUSIC_DIR).catch(() => {});
  await RNFS.mkdir(ARTWORK_DIR).catch(() => {});

  const INIT_KEY = 'library_initialized_v1';
  const initialized = await DB.getSetting(INIT_KEY);

  let added = 0;
  let skipped = 0;
  const total = MANIFEST.length;

  for (let i = 0; i < MANIFEST.length; i++) {
    const item = MANIFEST[i];

    onProgress?.({
      total,
      current: i + 1,
      currentTrack: item.title,
      phase: 'copying',
    });

    const destPath = destMusicPath(item.safeFilename);
    const srcPath = bundledMusicPath(item.safeFilename);

    // Copy music file if not already present
    const musicExists = await RNFS.exists(destPath);
    if (!musicExists) {
      try {
        await RNFS.copyFileAssets(`music/${item.safeFilename}`, destPath);
        added++;
      } catch (err) {
        console.warn(`[Library] Failed to copy ${item.safeFilename}:`, err);
        // Still add to DB with missing file flag — handle gracefully in player
      }
    } else {
      skipped++;
    }

    // Copy artwork if available and not already present
    let artworkUri: string | undefined;
    if (item.artworkFile) {
      const destArt = destArtworkPath(item.artworkFile);
      const artExists = await RNFS.exists(destArt);
      if (!artExists) {
        try {
          await RNFS.copyFileAssets(`artwork/${item.artworkFile}`, destArt);
        } catch (err) {
          console.warn(`[Library] Failed to copy artwork ${item.artworkFile}:`, err);
        }
      }
      const artworkOk = await RNFS.exists(destArt);
      if (artworkOk) {
        artworkUri = artworkUrl(item.artworkFile);
      }
    }

    // Upsert into DB — preserve play count and favorites if re-initializing
    const existing = await DB.getTrackById(item.id);
    const track: Track = {
      id: item.id,
      safeFilename: item.safeFilename,
      originalFilename: item.originalFilename,
      title: cleanTitle(item.title),
      artist: cleanArtist(item.artist),
      album: item.album === 'Unknown Album' ? '' : item.album,
      duration: item.duration,
      durationFormatted: item.durationFormatted,
      url: trackUrl(item.safeFilename),
      artwork: artworkUri ?? (existing?.artwork),
      hasArtwork: !!(artworkUri ?? existing?.artwork),
      fileSizeBytes: item.fileSizeBytes,
      addedAt: existing?.addedAt ?? Date.now(),
      playCount: existing?.playCount ?? 0,
      lastPlayedAt: existing?.lastPlayedAt,
      isFavorite: existing?.isFavorite ?? false,
    };
    await DB.upsertTrack(track);
  }

  onProgress?.({
    total,
    current: total,
    currentTrack: '',
    phase: 'done',
  });

  await DB.setSetting(INIT_KEY, 'true');
  console.log(`[Library] Init complete — ${added} added, ${skipped} already existed`);
  return {added, skipped};
}

/**
 * Remove MassTamilan / SenSongsMp3 / mp3.pm suffixes from titles.
 */
function cleanTitle(title: string): string {
  return title
    .replace(/\s*-\s*MassTamilan\s*$/i, '')
    .replace(/\s*::\s*SenSongsMp3\.Com\s*$/i, '')
    .replace(/\s*\(KoshalWorld\.Com\)\s*$/i, '')
    .trim();
}

function cleanArtist(artist: string): string {
  return artist
    .replace(/\s*-\s*MassTamilan\s*$/i, '')
    .replace(/\s*,\s*MassTamilan\s*$/i, '')
    .replace(/Koshalworld\.Com/gi, 'Unknown Artist')
    .trim();
}

export async function isLibraryInitialized(): Promise<boolean> {
  try {
    await DB.initDatabase();
    const val = await DB.getSetting('library_initialized_v1');
    const count = await DB.getTrackCount();
    return val === 'true' && count > 0;
  } catch {
    return false;
  }
}

export default {initLibrary, isLibraryInitialized};
