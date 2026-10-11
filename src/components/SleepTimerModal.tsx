/**
 * SleepTimerModal.tsx — Floating Liquid Glass Sleep Timer Modal.
 * Offers quick presets (15m, 30m, 45m, 60m), live countdown,
 * and automated smooth volume fade-out before audio stop.
 */
import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {Timer, X, Check, Moon, BellOff} from 'lucide-react-native';
import {useTheme} from '../hooks/useTheme';
import {useStore} from '../store';
import {LiquidGlass} from './LiquidGlass';
import {spacing, typography, radii} from '../theme';

interface SleepTimerModalProps {
  visible: boolean;
  onClose: () => void;
}

const PRESETS = [15, 30, 45, 60];

function formatSec(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function SleepTimerModal({visible, onClose}: SleepTimerModalProps) {
  const theme = useTheme();
  const sleepTimerActive = useStore(s => s.sleepTimerActive);
  const sleepTimerMinutes = useStore(s => s.sleepTimerMinutes);
  const sleepTimerRemainingSec = useStore(s => s.sleepTimerRemainingSec);
  const setSleepTimer = useStore(s => s.setSleepTimer);
  const clearSleepTimer = useStore(s => s.clearSleepTimer);

  const handleSelect = (mins: number) => {
    setSleepTimer(mins);
    onClose();
  };

  const handleClear = () => {
    clearSleepTimer();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <LiquidGlass
          level="elevated"
          radius={radii['2xl']}
          style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: theme.dark
                      ? 'rgba(128, 85, 255, 0.22)'
                      : 'rgba(112, 71, 245, 0.14)',
                  },
                ]}>
                <Moon size={20} color={theme.accent.primary} strokeWidth={2.2} />
              </View>
              <View>
                <Text style={[styles.title, {color: theme.text.primary}]}>
                  Sleep Timer
                </Text>
                <Text style={[styles.subtitle, {color: theme.text.tertiary}]}>
                  {sleepTimerActive && sleepTimerRemainingSec !== null
                    ? `Fading out in ${formatSec(sleepTimerRemainingSec)}`
                    : 'Gently fades out audio when timer ends'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              style={styles.closeBtn}>
              <X size={20} color={theme.text.tertiary} />
            </TouchableOpacity>
          </View>

          {/* Active Timer Indicator */}
          {sleepTimerActive && sleepTimerRemainingSec !== null && (
            <View
              style={[
                styles.activeBadge,
                {
                  backgroundColor: theme.dark
                    ? 'rgba(128, 85, 255, 0.18)'
                    : 'rgba(112, 71, 245, 0.12)',
                  borderColor: theme.accent.primary,
                },
              ]}>
              <Timer size={18} color={theme.accent.primary} strokeWidth={2.4} />
              <Text style={[styles.activeTime, {color: theme.accent.primary}]}>
                {formatSec(sleepTimerRemainingSec)}
              </Text>
              <Text style={[styles.activeLabel, {color: theme.text.secondary}]}>
                remaining
              </Text>
            </View>
          )}

          {/* Preset Buttons Grid */}
          <View style={styles.presetGrid}>
            {PRESETS.map(mins => {
              const isSelected =
                sleepTimerActive && sleepTimerMinutes === mins;
              return (
                <TouchableOpacity
                  key={mins}
                  onPress={() => handleSelect(mins)}
                  style={[
                    styles.presetBtn,
                    {
                      backgroundColor: isSelected
                        ? theme.accent.primary
                        : theme.dark
                        ? 'rgba(32, 38, 54, 0.60)'
                        : 'rgba(255, 255, 255, 0.65)',
                      borderColor: isSelected
                        ? theme.accent.primary
                        : theme.dark
                        ? 'rgba(255, 255, 255, 0.10)'
                        : 'rgba(255, 255, 255, 0.70)',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.presetText,
                      {
                        color: isSelected ? '#FFFFFF' : theme.text.primary,
                      },
                    ]}>
                    {mins} min
                  </Text>
                  {isSelected && (
                    <Check size={14} color="#FFFFFF" strokeWidth={2.6} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Cancel Button */}
          {sleepTimerActive ? (
            <TouchableOpacity
              onPress={handleClear}
              style={[styles.cancelTimerBtn, {borderColor: theme.error}]}>
              <BellOff size={16} color={theme.error} strokeWidth={2} />
              <Text style={[styles.cancelTimerText, {color: theme.error}]}>
                Turn Off Sleep Timer
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onClose} style={styles.dismissBtn}>
              <Text style={[styles.dismissText, {color: theme.text.tertiary}]}>
                Cancel
              </Text>
            </TouchableOpacity>
          )}
        </LiquidGlass>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['5'],
  },
  modalCard: {
    width: '100%',
    padding: spacing['5'],
    maxWidth: 360,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing['4'],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: typography.xs,
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing['1'],
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['2.5'],
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing['4'],
  },
  activeTime: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    fontFamily: typography.mono,
  },
  activeLabel: {
    fontSize: typography.xs,
    fontWeight: typography.medium,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2.5'],
    marginBottom: spacing['4'],
  },
  presetBtn: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3.5'],
    borderRadius: radii.xl,
    borderWidth: 1.2,
    gap: spacing['1.5'],
  },
  presetText: {
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
  cancelTimerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3'],
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing['2'],
  },
  cancelTimerText: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
  },
  dismissBtn: {
    alignItems: 'center',
    paddingVertical: spacing['2'],
  },
  dismissText: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
  },
});

export default SleepTimerModal;
