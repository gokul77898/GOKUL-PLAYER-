/**
 * manifest.test.ts
 * Validates integrity of track manifest, audio files, and artwork assets.
 */
import fs from 'fs';
import path from 'path';

const MANIFEST_PATH = path.join(__dirname, '../assets/track_manifest.json');
const MUSIC_DIR = path.join(__dirname, '../assets/music');
const ARTWORK_DIR = path.join(__dirname, '../assets/artwork');
const ANDROID_MUSIC_DIR = path.join(
  __dirname,
  '../android/app/src/main/assets/music'
);
const ANDROID_ARTWORK_DIR = path.join(
  __dirname,
  '../android/app/src/main/assets/artwork'
);

describe('Track Manifest & Bundled Assets Integrity', () => {
  let manifest: any[];

  beforeAll(() => {
    expect(fs.existsSync(MANIFEST_PATH)).toBe(true);
    const content = fs.readFileSync(MANIFEST_PATH, 'utf8');
    manifest = JSON.parse(content);
  });

  test('manifest contains exactly 32 discovered songs', () => {
    expect(manifest.length).toBe(32);
  });

  test('every track has required schema fields with valid types', () => {
    const ids = new Set<string>();

    for (const track of manifest) {
      // Unique stable ID
      expect(typeof track.id).toBe('string');
      expect(track.id.length).toBeGreaterThan(0);
      expect(ids.has(track.id)).toBe(false);
      ids.add(track.id);

      // Metadata
      expect(typeof track.title).toBe('string');
      expect(track.title.length).toBeGreaterThan(0);

      expect(typeof track.artist).toBe('string');
      expect(track.artist.length).toBeGreaterThan(0);

      expect(typeof track.duration).toBe('number');
      expect(track.duration).toBeGreaterThan(0);

      expect(typeof track.safeFilename).toBe('string');
      expect(track.safeFilename.endsWith('.mp3')).toBe(true);

      expect(typeof track.fileSizeBytes).toBe('number');
      expect(track.fileSizeBytes).toBeGreaterThan(0);
    }
  });

  test('every track MP3 file exists in assets/music and android assets', () => {
    for (const track of manifest) {
      const projectPath = path.join(MUSIC_DIR, track.safeFilename);
      expect(fs.existsSync(projectPath)).toBe(true);

      const androidPath = path.join(ANDROID_MUSIC_DIR, track.safeFilename);
      expect(fs.existsSync(androidPath)).toBe(true);

      const stat = fs.statSync(projectPath);
      expect(stat.size).toBe(track.fileSizeBytes);
    }
  });

  test('embedded artwork references exist in assets/artwork and android assets', () => {
    const tracksWithArtwork = manifest.filter(t => t.artworkFile);
    expect(tracksWithArtwork.length).toBeGreaterThan(0);

    for (const track of tracksWithArtwork) {
      const artPath = path.join(ARTWORK_DIR, track.artworkFile);
      expect(fs.existsSync(artPath)).toBe(true);

      const androidArtPath = path.join(ANDROID_ARTWORK_DIR, track.artworkFile);
      expect(fs.existsSync(androidArtPath)).toBe(true);
    }
  });

  test('offline Android bundle index.android.bundle is present and non-empty', () => {
    const bundlePath = path.join(
      __dirname,
      '../android/app/src/main/assets/index.android.bundle'
    );
    expect(fs.existsSync(bundlePath)).toBe(true);
    const stat = fs.statSync(bundlePath);
    expect(stat.size).toBeGreaterThan(1000000); // > 1MB bundled JS
  });
});
