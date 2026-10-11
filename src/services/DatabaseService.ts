/**
 * DatabaseService — SQLite adapter for track library, playlists and favorites.
 * Uses react-native-sqlite-storage with async/await API.
 */
import SQLite, {SQLiteDatabase, Transaction, ResultSet} from 'react-native-sqlite-storage';
import {Track, Playlist} from '../types';

SQLite.enablePromise(true);

const DB_NAME = 'music_player.db';
const DB_VERSION = '1';

let _db: SQLiteDatabase | null = null;

async function getDB(): Promise<SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabase({name: DB_NAME, location: 'default'});
  return _db;
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const CREATE_TRACKS = `
  CREATE TABLE IF NOT EXISTS tracks (
    id TEXT PRIMARY KEY,
    safe_filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT NOT NULL,
    duration REAL NOT NULL,
    duration_formatted TEXT NOT NULL,
    url TEXT NOT NULL,
    artwork TEXT,
    has_artwork INTEGER NOT NULL DEFAULT 0,
    file_size_bytes INTEGER NOT NULL DEFAULT 0,
    added_at INTEGER NOT NULL,
    play_count INTEGER NOT NULL DEFAULT 0,
    last_played_at INTEGER,
    is_favorite INTEGER NOT NULL DEFAULT 0
  );
`;

const CREATE_PLAYLISTS = `
  CREATE TABLE IF NOT EXISTS playlists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    cover_artwork TEXT
  );
`;

const CREATE_PLAYLIST_TRACKS = `
  CREATE TABLE IF NOT EXISTS playlist_tracks (
    playlist_id TEXT NOT NULL,
    track_id TEXT NOT NULL,
    position INTEGER NOT NULL,
    added_at INTEGER NOT NULL,
    PRIMARY KEY (playlist_id, track_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
  );
`;

const CREATE_SETTINGS = `
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`;

// ─── DB init ──────────────────────────────────────────────────────────────────
export async function initDatabase(): Promise<void> {
  const db = await getDB();
  await db.executeSql(CREATE_TRACKS);
  await db.executeSql(CREATE_PLAYLISTS);
  await db.executeSql(CREATE_PLAYLIST_TRACKS);
  await db.executeSql(CREATE_SETTINGS);
  console.log('[DB] Database initialized');
}

// ─── Tracks ───────────────────────────────────────────────────────────────────
function rowToTrack(row: any): Track {
  return {
    id: row.id,
    safeFilename: row.safe_filename,
    originalFilename: row.original_filename,
    title: row.title,
    artist: row.artist,
    album: row.album,
    duration: row.duration,
    durationFormatted: row.duration_formatted,
    url: row.url,
    artwork: row.artwork ?? undefined,
    hasArtwork: row.has_artwork === 1,
    fileSizeBytes: row.file_size_bytes,
    addedAt: row.added_at,
    playCount: row.play_count,
    lastPlayedAt: row.last_played_at ?? undefined,
    isFavorite: row.is_favorite === 1,
  };
}

export async function upsertTrack(track: Track): Promise<void> {
  const db = await getDB();
  await db.executeSql(
    `INSERT OR REPLACE INTO tracks (
      id, safe_filename, original_filename, title, artist, album,
      duration, duration_formatted, url, artwork, has_artwork,
      file_size_bytes, added_at, play_count, last_played_at, is_favorite
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      track.id, track.safeFilename, track.originalFilename,
      track.title, track.artist, track.album,
      track.duration, track.durationFormatted,
      track.url, track.artwork ?? null,
      track.hasArtwork ? 1 : 0,
      track.fileSizeBytes, track.addedAt,
      track.playCount, track.lastPlayedAt ?? null,
      track.isFavorite ? 1 : 0,
    ],
  );
}

export async function upsertTracks(tracks: Track[]): Promise<void> {
  const db = await getDB();
  await db.transaction(async (tx: Transaction) => {
    for (const track of tracks) {
      tx.executeSql(
        `INSERT OR REPLACE INTO tracks (
          id, safe_filename, original_filename, title, artist, album,
          duration, duration_formatted, url, artwork, has_artwork,
          file_size_bytes, added_at, play_count, last_played_at, is_favorite
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          track.id, track.safeFilename, track.originalFilename,
          track.title, track.artist, track.album,
          track.duration, track.durationFormatted,
          track.url, track.artwork ?? null,
          track.hasArtwork ? 1 : 0,
          track.fileSizeBytes, track.addedAt,
          track.playCount, track.lastPlayedAt ?? null,
          track.isFavorite ? 1 : 0,
        ],
      );
    }
  });
}

export async function getAllTracks(): Promise<Track[]> {
  const db = await getDB();
  const [result] = await db.executeSql(
    'SELECT * FROM tracks ORDER BY title ASC',
  );
  const tracks: Track[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    tracks.push(rowToTrack(result.rows.item(i)));
  }
  return tracks;
}

export async function getTrackById(id: string): Promise<Track | null> {
  const db = await getDB();
  const [result] = await db.executeSql(
    'SELECT * FROM tracks WHERE id = ?',
    [id],
  );
  if (result.rows.length === 0) return null;
  return rowToTrack(result.rows.item(0));
}

export async function getFavoriteTracks(): Promise<Track[]> {
  const db = await getDB();
  const [result] = await db.executeSql(
    'SELECT * FROM tracks WHERE is_favorite = 1 ORDER BY title ASC',
  );
  const tracks: Track[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    tracks.push(rowToTrack(result.rows.item(i)));
  }
  return tracks;
}

export async function getRecentlyPlayed(limit = 10): Promise<Track[]> {
  const db = await getDB();
  const [result] = await db.executeSql(
    'SELECT * FROM tracks WHERE last_played_at IS NOT NULL ORDER BY last_played_at DESC LIMIT ?',
    [limit],
  );
  const tracks: Track[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    tracks.push(rowToTrack(result.rows.item(i)));
  }
  return tracks;
}

export async function getRecentlyAdded(limit = 20): Promise<Track[]> {
  const db = await getDB();
  const [result] = await db.executeSql(
    'SELECT * FROM tracks ORDER BY added_at DESC LIMIT ?',
    [limit],
  );
  const tracks: Track[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    tracks.push(rowToTrack(result.rows.item(i)));
  }
  return tracks;
}

export async function setTrackFavorite(id: string, isFavorite: boolean): Promise<void> {
  const db = await getDB();
  await db.executeSql(
    'UPDATE tracks SET is_favorite = ? WHERE id = ?',
    [isFavorite ? 1 : 0, id],
  );
}

export async function incrementPlayCount(id: string): Promise<void> {
  const db = await getDB();
  const now = Date.now();
  await db.executeSql(
    'UPDATE tracks SET play_count = play_count + 1, last_played_at = ? WHERE id = ?',
    [now, id],
  );
}

export async function getTrackCount(): Promise<number> {
  const db = await getDB();
  const [result] = await db.executeSql('SELECT COUNT(*) as count FROM tracks');
  return result.rows.item(0).count;
}

// ─── Playlists ────────────────────────────────────────────────────────────────
export async function createPlaylist(name: string, description?: string): Promise<Playlist> {
  const db = await getDB();
  const id = `pl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = Date.now();
  await db.executeSql(
    'INSERT INTO playlists (id, name, description, created_at, updated_at) VALUES (?,?,?,?,?)',
    [id, name, description ?? null, now, now],
  );
  return {id, name, description, createdAt: now, updatedAt: now, trackIds: []};
}

export async function getAllPlaylists(): Promise<Playlist[]> {
  const db = await getDB();
  const [result] = await db.executeSql(
    'SELECT * FROM playlists ORDER BY updated_at DESC',
  );
  const playlists: Playlist[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    const row = result.rows.item(i);
    // Get track IDs
    const [trackResult] = await db.executeSql(
      'SELECT track_id FROM playlist_tracks WHERE playlist_id = ? ORDER BY position ASC',
      [row.id],
    );
    const trackIds: string[] = [];
    for (let j = 0; j < trackResult.rows.length; j++) {
      trackIds.push(trackResult.rows.item(j).track_id);
    }
    playlists.push({
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      coverArtwork: row.cover_artwork ?? undefined,
      trackIds,
    });
  }
  return playlists;
}

export async function addTrackToPlaylist(playlistId: string, trackId: string): Promise<void> {
  const db = await getDB();
  const [posResult] = await db.executeSql(
    'SELECT MAX(position) as maxPos FROM playlist_tracks WHERE playlist_id = ?',
    [playlistId],
  );
  const maxPos = posResult.rows.item(0).maxPos ?? -1;
  const now = Date.now();
  await db.executeSql(
    'INSERT OR IGNORE INTO playlist_tracks (playlist_id, track_id, position, added_at) VALUES (?,?,?,?)',
    [playlistId, trackId, maxPos + 1, now],
  );
  await db.executeSql(
    'UPDATE playlists SET updated_at = ? WHERE id = ?',
    [now, playlistId],
  );
}

export async function removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void> {
  const db = await getDB();
  await db.executeSql(
    'DELETE FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?',
    [playlistId, trackId],
  );
}

export async function deletePlaylist(id: string): Promise<void> {
  const db = await getDB();
  await db.executeSql('DELETE FROM playlist_tracks WHERE playlist_id = ?', [id]);
  await db.executeSql('DELETE FROM playlists WHERE id = ?', [id]);
}

export async function renamePlaylist(id: string, name: string): Promise<void> {
  const db = await getDB();
  await db.executeSql(
    'UPDATE playlists SET name = ?, updated_at = ? WHERE id = ?',
    [name, Date.now(), id],
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export async function getSetting(key: string): Promise<string | null> {
  const db = await getDB();
  const [result] = await db.executeSql(
    'SELECT value FROM settings WHERE key = ?',
    [key],
  );
  if (result.rows.length === 0) return null;
  return result.rows.item(0).value;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDB();
  await db.executeSql(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?,?)',
    [key, value],
  );
}

export default {
  initDatabase,
  upsertTrack,
  upsertTracks,
  getAllTracks,
  getTrackById,
  getFavoriteTracks,
  getRecentlyPlayed,
  getRecentlyAdded,
  setTrackFavorite,
  incrementPlayCount,
  getTrackCount,
  createPlaylist,
  getAllPlaylists,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  deletePlaylist,
  renamePlaylist,
  getSetting,
  setSetting,
};
