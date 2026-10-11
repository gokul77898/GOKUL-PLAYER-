# GOKUL Player 🎵

> **Ultra-Premium Offline Music Experience for Android**  
> Crafted with React Native, Reanimated 3, Liquid Glass design surfaces, cinematic album depth, and 60 FPS performance.

---

## ✨ Features

- **Liquid Glass Visual System:** Physical layered translucent surfaces with specular edge highlights, ambient blur depth, and restrained elevation shadows.
- **Obsidian Dark & Luminous Light Modes:** Seamless theme switching between deep obsidian (`#08090D`) and pearl luminous (`#F6F5FB`) palettes without interrupting audio playback.
- **Cinematic Now Playing Screen:**
  - Ambient artwork glow derived dynamically from local track metadata.
  - 2.5D vinyl elevation scaling on playback state.
  - Isolated high-performance progress scrubber preventing screen re-renders during playback.
  - Interactive Queue sheet.
- **Floating Glass Mini-Player:**
  - Floats above bottom navigation with track progress indicator, thumbnail art, and tactile spring controls.
  - Fluid spring expansion gesture into the full player.
- **Cohesive Iconography:** Centralized, accessible icon system built with `lucide-react-native`.
- **100% Offline & Local:**
  - 32 bundled high-fidelity MP3 tracks with embedded artwork.
  - SQLite database for persistent playback history, favorites, and custom playlists.
  - Background audio playback with notification & lock screen controls.
  - Zero external network requests or tracking.

---

## 🚀 Tech Stack

- **Framework:** React Native 0.73.6
- **Audio Engine:** `react-native-track-player` 4.1.1
- **Animations:** `react-native-reanimated` 3.8.1
- **Gestures:** `react-native-gesture-handler` 2.16.1
- **Icons:** `lucide-react-native`
- **Database:** `react-native-sqlite-storage`
- **Navigation:** `@react-navigation/native` & `@react-navigation/bottom-tabs`
- **Language:** TypeScript 5.x

---

## 🛠️ Project Structure

```
MusicPlayer/
├── android/                 # Native Android project (AGP 8.3.1, Gradle 8.4)
├── assets/
│   ├── artwork/             # High-res local album artwork
│   ├── music/               # Bundled offline MP3 audio files
│   └── gokul_icon.png       # High-res master app emblem
├── src/
│   ├── components/          # Reusable Liquid Glass & UI components
│   │   ├── LiquidGlass.tsx
│   │   ├── GlassCard.tsx
│   │   ├── ArtworkImage.tsx
│   │   ├── MiniPlayer.tsx
│   │   ├── NowPlayingProgressBar.tsx
│   │   └── TrackRow.tsx
│   ├── screens/             # Application screens
│   │   ├── HomeScreen.tsx
│   │   ├── LibraryScreen.tsx
│   │   ├── NowPlayingScreen.tsx
│   │   ├── PlaylistsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── navigation/          # Glass bottom navigation bar
│   ├── theme/               # Design tokens, colors, spring presets
│   └── hooks/               # Audio engine & player hooks
├── App.tsx                  # Root entry with branded splash screen
└── package.json
```

---

## 📦 Building the Android APK

1. Ensure **JDK 17** and **Android SDK** are configured.
2. Generate the offline bundle:
   ```bash
   npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
   ```
3. Assemble the debug APK:
   ```bash
   cd android && ./gradlew assembleDebug
   ```
4. Output APK location:
   `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📄 License

Private & Personal Project — All rights reserved.
