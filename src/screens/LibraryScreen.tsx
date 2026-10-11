/**
 * LibraryScreen.tsx — GOKUL Player Library Experience.
 * Fast virtualized FlatList, glass search bar, sorting chips and instant offline filter.
 */
import React, {useState, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Search,
  ArrowUpDown,
  Music2,
  XCircle,
  SlidersHorizontal,
  Check,
  Heart,
  FolderPlus,
} from 'lucide-react-native';
import {useStore} from '../store';
import {useTheme} from '../hooks/useTheme';
import {TrackRow} from '../components/TrackRow';
import {LiquidGlass} from '../components/LiquidGlass';
import {Forest3DBackground} from '../components/Forest3DBackground';
import {importMusicFromDevice} from '../services/ImportService';
import {Track} from '../types';
import {spacing, typography, radii, LAYOUT} from '../theme';

type SortKey = 'title' | 'artist' | 'album' | 'addedAt' | 'playCount' | 'duration';

const SORT_OPTIONS: {key: SortKey; label: string}[] = [
  {key: 'title', label: 'Title (A-Z)'},
  {key: 'artist', label: 'Artist'},
  {key: 'album', label: 'Album'},
  {key: 'addedAt', label: 'Date Added'},
  {key: 'playCount', label: 'Most Played'},
  {key: 'duration', label: 'Song Duration'},
];

type FilterChip = 'all' | 'favorites' | 'albums' | 'artists';

const ITEM_HEIGHT = 72;

export default function LibraryScreen() {
  const theme = useTheme();
  const tracks = useStore(s => s.tracks);
  const currentTrack = useStore(s => s.currentTrack);
  const loadTracks = useStore(s => s.loadTracks);

  const [query, setQuery] = useState('');
  const [filterChip, setFilterChip] = useState<FilterChip>('all');
  const [sortKey, setSortKey] = useState<SortKey>('title');
  const [showSortModal, setShowSortModal] = useState(false);

  const handleImportMusic = useCallback(async () => {
    const res = await importMusicFromDevice();
    if (res.success && res.count > 0) {
      await loadTracks();
      Alert.alert(
        'Music Imported',
        `Successfully added ${res.count} track${res.count === 1 ? '' : 's'} to your GOKUL Player offline library!`,
      );
    } else if (res.error) {
      Alert.alert('Import Notice', res.error);
    }
  }, [loadTracks]);

  const filtered = useMemo(() => {
    let list = [...tracks];

    // Filter chip
    if (filterChip === 'favorites') {
      list = list.filter(t => t.isFavorite);
    }

    // Search query
    const q = query.toLowerCase().trim();
    if (q) {
      list = list.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q),
      );
    }

    // Sorting
    list.sort((a, b) => {
      switch (sortKey) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'artist':
          return a.artist.localeCompare(b.artist);
        case 'album':
          return (a.album || 'zzz').localeCompare(b.album || 'zzz');
        case 'addedAt':
          return b.addedAt - a.addedAt;
        case 'playCount':
          return b.playCount - a.playCount;
        case 'duration':
          return b.duration - a.duration;
        default:
          return 0;
      }
    });

    return list;
  }, [tracks, query, filterChip, sortKey]);

  const renderItem = useCallback(
    ({item, index}: {item: Track; index: number}) => (
      <TrackRow
        track={item}
        queue={filtered}
        isCurrentTrack={currentTrack?.id === item.id}
        index={index}
      />
    ),
    [filtered, currentTrack],
  );

  const keyExtractor = useCallback((item: Track) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

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
            Library
          </Text>
          <Text style={[styles.count, {color: theme.text.tertiary}]}>
            {filtered.length} of {tracks.length} tracks
          </Text>
        </View>

        <View style={styles.headerRightActions}>
          {/* Import Music from Device */}
          <LiquidGlass
            level="subtle"
            radius={radii.full}
            style={styles.headerActionBtn}
            onPress={handleImportMusic}>
            <FolderPlus size={15} color={theme.accent.primary} strokeWidth={2.2} />
            <Text style={[styles.headerActionText, {color: theme.accent.primary}]}>
              Import
            </Text>
          </LiquidGlass>

          {/* Sort Button */}
          <LiquidGlass
            level="subtle"
            radius={radii.full}
            style={styles.headerActionBtn}
            onPress={() => setShowSortModal(true)}>
            <ArrowUpDown size={15} color={theme.text.primary} strokeWidth={2} />
            <Text style={[styles.headerActionText, {color: theme.text.primary}]}>
              Sort
            </Text>
          </LiquidGlass>
        </View>
      </View>

      {/* ─── Search Bar (Liquid Glass) ──────────────────────────── */}
      <View style={styles.searchWrapper}>
        <LiquidGlass
          level="card"
          radius={radii.xl}
          style={styles.searchBar}>
          <Search size={18} color={theme.text.tertiary} strokeWidth={2} />
          <TextInput
            style={[styles.searchInput, {color: theme.text.primary}]}
            placeholder="Search tracks, artists, albums..."
            placeholderTextColor={theme.text.tertiary}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <XCircle size={18} color={theme.text.tertiary} />
            </TouchableOpacity>
          )}
        </LiquidGlass>
      </View>

      {/* ─── Filter Chips Row ───────────────────────────────────── */}
      <View style={styles.chipsRow}>
        <TouchableOpacity
          onPress={() => setFilterChip('all')}
          style={[
            styles.chip,
            filterChip === 'all'
              ? {backgroundColor: theme.accent.primary, borderColor: theme.accent.primary}
              : {backgroundColor: theme.bg.glassSubtle, borderColor: theme.border.default},
          ]}>
          <Text
            style={[
              styles.chipText,
              {color: filterChip === 'all' ? '#FFF' : theme.text.secondary},
            ]}>
            All Tracks ({tracks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilterChip('favorites')}
          style={[
            styles.chip,
            filterChip === 'favorites'
              ? {backgroundColor: theme.accent.primary, borderColor: theme.accent.primary}
              : {backgroundColor: theme.bg.glassSubtle, borderColor: theme.border.default},
          ]}>
          <Heart
            size={13}
            color={filterChip === 'favorites' ? '#FFF' : theme.error}
            fill={filterChip === 'favorites' ? '#FFF' : theme.error}
          />
          <Text
            style={[
              styles.chipText,
              {color: filterChip === 'favorites' ? '#FFF' : theme.text.secondary},
            ]}>
            Favorites
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── Virtualized High-Performance FlatList ──────────────── */}
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing['4'],
          paddingBottom: LAYOUT.tabBarHeight + LAYOUT.miniPlayerHeight + spacing['10'],
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Music2 size={44} color={theme.text.tertiary} strokeWidth={1.5} />
            <Text style={[styles.emptyTitle, {color: theme.text.primary}]}>
              No songs found
            </Text>
            <Text style={[styles.emptySub, {color: theme.text.tertiary}]}>
              Try searching a different title or clearing filters
            </Text>
          </View>
        }
      />

      {/* ─── Sort Modal ─────────────────────────────────────────── */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}>
        <View style={[styles.modalOverlay, {backgroundColor: theme.bg.overlay}]}>
          <LiquidGlass
            level="elevated"
            radius={radii['2xl']}
            style={styles.modalCard}>
            <Text style={[styles.modalTitle, {color: theme.text.primary}]}>
              Sort Library By
            </Text>
            {SORT_OPTIONS.map(opt => {
              const active = sortKey === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => {
                    setSortKey(opt.key);
                    setShowSortModal(false);
                  }}
                  style={[
                    styles.sortRow,
                    active && {backgroundColor: theme.bg.glassStrong},
                  ]}>
                  <Text
                    style={[
                      styles.sortLabel,
                      {
                        color: active ? theme.accent.primary : theme.text.primary,
                        fontWeight: active ? '700' : '500',
                      },
                    ]}>
                    {opt.label}
                  </Text>
                  {active && (
                    <Check size={18} color={theme.accent.primary} strokeWidth={2.5} />
                  )}
                </TouchableOpacity>
              );
            })}
          </LiquidGlass>
        </View>
      </Modal>
    </Forest3DBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing['5'],
    paddingTop: spacing['3'],
    paddingBottom: spacing['2'],
  },
  heading: {
    fontSize: typography['3xl'],
    fontWeight: typography.heavy,
    letterSpacing: -0.6,
  },
  count: {
    fontSize: typography.xs,
    marginTop: 2,
    fontWeight: typography.medium,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1.5'],
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['1.5'],
  },
  headerActionText: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
  },
  searchWrapper: {
    paddingHorizontal: spacing['4'],
    marginVertical: spacing['2'],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['3.5'],
    height: 46,
    gap: spacing['2.5'],
  },
  searchInput: {
    flex: 1,
    fontSize: typography.base,
    paddingVertical: 0,
  },
  chipsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing['4'],
    marginBottom: spacing['3'],
    gap: spacing['2'],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['3.5'],
    paddingVertical: spacing['1.5'],
    borderRadius: radii.full,
    borderWidth: 1,
    gap: spacing['1.5'],
  },
  chipText: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['16'],
    gap: spacing['2'],
  },
  emptyTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    marginTop: spacing['2'],
  },
  emptySub: {
    fontSize: typography.xs,
    textAlign: 'center',
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
  modalTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    marginBottom: spacing['4'],
    letterSpacing: -0.3,
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['3'],
    borderRadius: radii.md,
  },
  sortLabel: {
    fontSize: typography.base,
  },
});
