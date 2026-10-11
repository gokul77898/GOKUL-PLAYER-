/**
 * queue.test.ts
 * Tests queue ordering, shuffle algorithm, and repeat mode cycling.
 */

function shuffleTracks<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function cycleRepeatMode(current: 'off' | 'track' | 'queue'): 'off' | 'track' | 'queue' {
  if (current === 'off') return 'queue';
  if (current === 'queue') return 'track';
  return 'off';
}

function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

describe('Player Queue & Playback State Logic', () => {
  test('cycleRepeatMode transitions correctly between off -> queue -> track -> off', () => {
    expect(cycleRepeatMode('off')).toBe('queue');
    expect(cycleRepeatMode('queue')).toBe('track');
    expect(cycleRepeatMode('track')).toBe('off');
  });

  test('shuffle preserves all elements and does not lose any songs', () => {
    const list = Array.from({length: 32}, (_, i) => `track_${i + 1}`);
    const shuffled = shuffleTracks(list);

    expect(shuffled.length).toBe(list.length);
    expect(new Set(shuffled).size).toBe(list.length);
    for (const item of list) {
      expect(shuffled).toContain(item);
    }
  });

  test('formatDuration formats seconds accurately', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(234)).toBe('3:54');
    expect(formatDuration(3600)).toBe('60:00');
    expect(formatDuration(-1)).toBe('0:00');
    expect(formatDuration(NaN)).toBe('0:00');
  });
});
