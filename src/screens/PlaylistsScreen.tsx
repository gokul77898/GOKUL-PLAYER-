/**
 * PlaylistsScreen.tsx — GOKUL Player Playlists & Collections.
 * Features Liquid Glass collection cards, favorite tracks showcase,
 * creation modals and track management.
 */
import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Plus,
  Heart,
  ListMusic,
  Trash2,
  X,
  ChevronLeft,
  Play,
  Music2,
  Flame,
  Sparkles,
} from 'lucide-react-native';
import {useStore} from '../store';
import {useTheme} from '../hooks/useTheme';
import {LiquidGlass} from '../components/LiquidGlass';
import {Forest3DBackground} from '../components/Forest3DBackground';
import {TrackRow} from '../components/TrackRow';
import {ArtworkImage} from '../components/ArtworkImage';
import {Playlist, Track} from '../types';
import {spacing, typography, radii, LAYOUT} from '../theme';

export default function PlaylistsScreen() {
  const theme = useTheme();
  const playlists = useStore(s => s.playlists);
  const tracks = useStore(s => s.tracks);
  const favorites = tracks.filter(t => t.isFavorite);
  const createPlaylist = useStore(s => s.createPlaylist);
  const deletePlaylist = useStore(s => s.deletePlaylist);
  const playTrack = useStore(s => s.playTrack);

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  const heavyRotation = React.useMemo(
    () =>
      [...tracks]
        .sort((a, b) => b.playCount - a.playCount)
        .slice(0, 15),
    [tracks],
  );

  const forgottenGems = React.useMemo(
    () =>
      [...tracks]
        .filter(t => t.playCount === 0 || !t.lastPlayedAt)
        .slice(0, 15),
    [tracks],
  );

  const handleCreate = useCallback(async () => {
    const name = newName.trim();
    if (!name) return;
    await createPlaylist(name);
    setNewName('');
    setShowCreate(false);
  }, [newName, createPlaylist]);

  const handleDeletePlaylist = useCallback(
    (pl: Playlist) => {
      Alert.alert('Delete Playlist', `Delete "${pl.name}"?`, [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePlaylist(pl.id),
        },
      ]);
    },
    [deletePlaylist],
  );

  const playlistTracks = selectedPlaylist
    ? tracks.filter(t => selectedPlaylist.trackIds.includes(t.id))
    : [];

  if (selectedPlaylist) {
    return (
      <PlaylistDetail
        playlist={selectedPlaylist}
        tracks={playlistTracks}
        theme={theme}
        onBack={() => setSelectedPlaylist(null)}
        onPlay={playTrack}
      />
    );
  }

  return (
    <Forest3DBackground style={styles.container}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView edges={['top']} />

      {/* ─── Header ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.heading, {color: theme.text.primary}]}>
            Playlists
          </Text>
          <Text style={[styles.subheading, {color: theme.text.tertiary}]}>
            {playlists.length} custom collections
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setShowCreate(true)}
          style={[styles.addBtn, {backgroundColor: theme.accent.primary}]}>
          <Plus size={20} color="#FFFFFF" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={playlists}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: LAYOUT.tabBarHeight + LAYOUT.miniPlayerHeight + spacing['10'],
        }}
        ListHeaderComponent={
          <>
            <FavoritesHeroCard
              count={favorites.length}
              tracks={favorites}
              onPlay={playTrack}
              theme={theme}
            />
            {/* Smart Auto-Playlists Row */}
            <View style={styles.smartRow}>
              <LiquidGlass
                level="card"
                radius={radii.xl}
                style={styles.smartCard}
                onPress={() =>
                  setSelectedPlaylist({
                    id: 'smart_heavy',
                    name: '🔥 Heavy Rotation',
                    description: 'Your most played tracks',
                    trackIds: heavyRotation.map(t => t.id),
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                  })
                }>
                <View style={[styles.smartIconBox, {backgroundColor: 'rgba(255, 120, 40, 0.18)'}]}>
                  <Flame size={20} color="#FF7828" strokeWidth={2.4} />
                </View>
                <Text style={[styles.smartTitle, {color: theme.text.primary}]}>
                  Heavy Rotation
                </Text>
                <Text style={[styles.smartSub, {color: theme.dark ? '#A5A8B7' : '#555869'}]}>
                  {heavyRotation.length} tracks
                </Text>
              </LiquidGlass>

              <LiquidGlass
                level="card"
                radius={radii.xl}
                style={styles.smartCard}
                onPress={() =>
                  setSelectedPlaylist({
                    id: 'smart_gems',
                    name: '💎 Forgotten Gems',
                    description: 'Tracks to rediscover',
                    trackIds: forgottenGems.map(t => t.id),
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                  })
                }>
                <View style={[styles.smartIconBox, {backgroundColor: 'rgba(60, 200, 255, 0.18)'}]}>
                  <Sparkles size={20} color="#3CC8FF" strokeWidth={2.4} />
                </View>
                <Text style={[styles.smartTitle, {color: theme.text.primary}]}>
                  Forgotten Gems
                </Text>
                <Text style={[styles.smartSub, {color: theme.dark ? '#A5A8B7' : '#555869'}]}>
                  {forgottenGems.length} tracks
                </Text>
              </LiquidGlass>
            </View>

            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, {color: theme.text.primary}]}>
                Custom Playlists
              </Text>
            </View>
          </>
        }
        renderItem={({item}) => {
          const firstTrack = tracks.find(t => item.trackIds.includes(t.id));
          return (
            <LiquidGlass
              level="card"
              radius={radii.xl}
              style={styles.playlistCard}
              onPress={() => setSelectedPlaylist(item)}>
              {firstTrack ? (
                <ArtworkImage track={firstTrack} size={48} radius={radii.md} />
              ) : (
                <View style={[styles.playlistIconBox, {backgroundColor: theme.accent.muted}]}>
                  <ListMusic size={22} color={theme.accent.primary} strokeWidth={2} />
                </View>
              )}

              <View style={styles.playlistInfo}>
                <Text style={[styles.playlistName, {color: theme.text.primary}]}>
                  {item.name}
                </Text>
                <Text style={[styles.playlistCount, {color: theme.text.tertiary}]}>
                  {item.trackIds.length} {item.trackIds.length === 1 ? 'track' : 'tracks'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleDeletePlaylist(item)}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                style={styles.deleteBtn}>
                <Trash2 size={18} color={theme.text.tertiary} strokeWidth={1.8} />
              </TouchableOpacity>
            </LiquidGlass>
          );
        }}
        ListEmptyComponent={
          playlists.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, {color: theme.text.tertiary}]}>
                Create custom playlists to organize your library
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreate(true)}
                style={[styles.createPill, {backgroundColor: theme.accent.primary}]}>
                <Plus size={16} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.createPillText}>New Playlist</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      {/* ─── Create Playlist Modal ───────────────────────────────── */}
      <Modal
        visible={showCreate}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCreate(false)}>
        <View style={[styles.modalOverlay, {backgroundColor: theme.bg.overlay}]}>
          <LiquidGlass
            level="elevated"
            radius={radii['2xl']}
            style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {color: theme.text.primary}]}>
                New Playlist
              </Text>
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <X size={20} color={theme.text.secondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g., Favorites 2026, Gym Vibes"
              placeholderTextColor={theme.text.tertiary}
              style={[
                styles.modalInput,
                {
                  color: theme.text.primary,
                  borderColor: theme.border.default,
                  backgroundColor: theme.bg.glassSubtle,
                },
              ]}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />

            <TouchableOpacity
              onPress={handleCreate}
              style={[styles.modalSubmitBtn, {backgroundColor: theme.accent.primary}]}>
              <Text style={styles.modalSubmitText}>Create Playlist</Text>
            </TouchableOpacity>
          </LiquidGlass>
        </View>
      </Modal>
    </Forest3DBackground>
  );
}

function FavoritesHeroCard({
  count,
  tracks,
  onPlay,
  theme,
}: {
  count: number;
  tracks: Track[];
  onPlay: (t: Track, q: Track[]) => void;
  theme: any;
}) {
  return (
    <LiquidGlass
      level="card"
      radius={radii.xl}
      style={styles.favCard}
      onPress={() => tracks.length && onPlay(tracks[0], tracks)}>
      <View style={[styles.favIconBox, {backgroundColor: 'rgba(255, 71, 133, 0.15)'}]}>
        <Heart size={26} color={theme.error} fill={theme.error} />
      </View>

      <View style={styles.playlistInfo}>
        <Text style={[styles.favTitle, {color: theme.text.primary}]}>
          Loved Tracks
        </Text>
        <Text style={[styles.favSubtitle, {color: theme.text.tertiary}]}>
          {count} {count === 1 ? 'favorite' : 'favorites'}
        </Text>
      </View>

      {count > 0 && (
        <View style={[styles.quickPlayBtn, {backgroundColor: theme.accent.primary}]}>
          <Play size={16} color="#FFFFFF" fill="#FFFFFF" style={{marginLeft: 2}} />
        </View>
      )}
    </LiquidGlass>
  );
}

function PlaylistDetail({
  playlist,
  tracks,
  theme,
  onBack,
  onPlay,
}: {
  playlist: Playlist;
  tracks: Track[];
  theme: any;
  onBack: () => void;
  onPlay: (t: Track, q: Track[]) => void;
}) {
  return (
    <Forest3DBackground style={styles.container}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView edges={['top']} />

      <View style={styles.detailHeader}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <ChevronLeft size={24} color={theme.text.primary} strokeWidth={2.4} />
          <Text style={[styles.backLabel, {color: theme.text.primary}]}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.detailHero}>
        <View style={[styles.detailIconBox, {backgroundColor: theme.accent.muted}]}>
          <ListMusic size={36} color={theme.accent.primary} strokeWidth={2} />
        </View>
        <Text style={[styles.detailTitle, {color: theme.text.primary}]}>
          {playlist.name}
        </Text>
        <Text style={[styles.detailSub, {color: theme.text.tertiary}]}>
          {tracks.length} tracks
        </Text>

        {tracks.length > 0 && (
          <TouchableOpacity
            onPress={() => onPlay(tracks[0], tracks)}
            style={[styles.playAllBtn, {backgroundColor: theme.accent.primary}]}>
            <Play size={18} color="#FFFFFF" fill="#FFFFFF" style={{marginLeft: 2}} />
            <Text style={styles.playAllText}>Play All</Text>
          </TouchableOpacity>
        )}
      </View>

      {tracks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Music2 size={36} color={theme.text.tertiary} strokeWidth={1.5} />
          <Text style={[styles.emptyText, {color: theme.text.tertiary}]}>
            This playlist has no tracks yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={t => t.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: spacing['4'],
            paddingBottom: LAYOUT.tabBarHeight + LAYOUT.miniPlayerHeight + spacing['8'],
          }}
          renderItem={({item, index}) => (
            <TrackRow
              track={item}
              queue={tracks}
              index={index}
              showIndex
            />
          )}
        />
      )}
    </Forest3DBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['5'],
    paddingTop: spacing['3'],
    paddingBottom: spacing['3'],
  },
  heading: {
    fontSize: typography['3xl'],
    fontWeight: typography.heavy,
    letterSpacing: -0.6,
  },
  subheading: {
    fontSize: typography.xs,
    marginTop: 2,
    fontWeight: typography.medium,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#8055FF',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  favCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing['4'],
    marginBottom: spacing['3'],
    marginTop: spacing['1'],
    padding: spacing['4'],
    gap: spacing['3.5'],
  },
  smartRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing['4'],
    gap: spacing['3'],
    marginBottom: spacing['4'],
  },
  smartCard: {
    flex: 1,
    padding: spacing['3.5'],
  },
  smartIconBox: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2'],
  },
  smartTitle: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
  },
  smartSub: {
    fontSize: typography.xs,
    marginTop: 2,
  },
  sectionTitleRow: {
    paddingHorizontal: spacing['5'],
    marginBottom: spacing['2.5'],
  },
  sectionTitle: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    letterSpacing: -0.2,
  },
  favIconBox: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favTitle: {
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
  favSubtitle: {
    fontSize: typography.xs,
    marginTop: 2,
  },
  quickPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing['4'],
    marginBottom: spacing['2.5'],
    padding: spacing['3.5'],
    gap: spacing['3'],
  },
  playlistIconBox: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    letterSpacing: -0.2,
  },
  playlistCount: {
    fontSize: typography.xs,
    marginTop: 2,
  },
  deleteBtn: {
    padding: spacing['2'],
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['12'],
    gap: spacing['3'],
  },
  emptyText: {
    fontSize: typography.sm,
    textAlign: 'center',
  },
  createPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2.5'],
    borderRadius: radii.full,
    gap: spacing['2'],
  },
  createPillText: {
    color: '#FFFFFF',
    fontSize: typography.sm,
    fontWeight: typography.bold,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['6'],
  },
  modalCard: {
    width: '100%',
    padding: spacing['5'],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['4'],
  },
  modalTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing['3.5'],
    paddingVertical: spacing['3'],
    fontSize: typography.base,
    marginBottom: spacing['4'],
  },
  modalSubmitBtn: {
    borderRadius: radii.lg,
    paddingVertical: spacing['3'],
    alignItems: 'center',
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
  detailHeader: {
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
  },
  backLabel: {
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
  detailHero: {
    alignItems: 'center',
    paddingVertical: spacing['4'],
    gap: spacing['2'],
  },
  detailIconBox: {
    width: 72,
    height: 72,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['1'],
  },
  detailTitle: {
    fontSize: typography['2xl'],
    fontWeight: typography.heavy,
    letterSpacing: -0.4,
  },
  detailSub: {
    fontSize: typography.sm,
  },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['6'],
    paddingVertical: spacing['2.5'],
    borderRadius: radii.full,
    marginTop: spacing['2'],
    gap: spacing['2'],
  },
  playAllText: {
    color: '#FFFFFF',
    fontSize: typography.sm,
    fontWeight: typography.bold,
  },
});
