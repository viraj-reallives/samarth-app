import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

/**
 * Where each recording was left off.
 *
 * Written at most once every few seconds while playing, and the whole map is
 * one AsyncStorage key, so the cost stays flat as the collection grows.
 *
 * A position near the very start or the very end is not worth restoring: the
 * first counts as "not really started", the second as "finished".
 */

const STORAGE_KEY = 'playback-positions-v1';
const WRITE_INTERVAL_MS = 5000;
const MIN_RESUME_SECONDS = 20;
const END_MARGIN_SECONDS = 25;

type Positions = Record<string, { position: number; duration: number; at: number }>;

let positions: Positions = {};
let hydrated = false;
let lastWrite = 0;
let pendingWrite: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function flush() {
  if (pendingWrite) {
    clearTimeout(pendingWrite);
    pendingWrite = null;
  }
  lastWrite = Date.now();
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(positions)).catch(() => {});
  emit();
}

export async function hydratePlayback() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      positions = JSON.parse(raw);
      emit();
    }
  } catch {
    positions = {};
  }
}

/** Called from the player on every status tick. Cheap; throttles its own writes. */
export function recordPosition(slug: string, position: number, duration: number) {
  if (!slug || !Number.isFinite(position)) return;

  if (position < MIN_RESUME_SECONDS) {
    clearPosition(slug);
    return;
  }

  const finished = duration > 0 && position > duration - END_MARGIN_SECONDS;
  if (finished) {
    clearPosition(slug);
    return;
  }

  positions = { ...positions, [slug]: { position, duration, at: Date.now() } };

  const elapsed = Date.now() - lastWrite;
  if (elapsed >= WRITE_INTERVAL_MS) {
    flush();
  } else if (!pendingWrite) {
    pendingWrite = setTimeout(flush, WRITE_INTERVAL_MS - elapsed);
  }
}

export function clearPosition(slug: string) {
  if (!positions[slug]) return;
  const { [slug]: _removed, ...rest } = positions;
  positions = rest;
  emit();
  flush();
}

/**
 * Read once, without subscribing. The player needs the stored position exactly
 * once, at load; subscribing would make it re-read its own writes.
 */
export function getPosition(slug?: string): number | undefined {
  if (!slug) return undefined;
  const entry = positions[slug];
  if (!entry) return undefined;
  if (entry.duration > 0 && entry.position > entry.duration - END_MARGIN_SECONDS) return undefined;
  return entry.position;
}

export function usePositions(): Positions {
  useEffect(() => {
    void hydratePlayback();
  }, []);
  return useSyncExternalStore(
    subscribe,
    () => positions,
    () => positions
  );
}

/** 0..1, for the thin resume bar under a list row. Undefined when not started. */
export function useProgressFraction(slug?: string): number | undefined {
  const all = usePositions();
  if (!slug) return undefined;
  const entry = all[slug];
  if (!entry || entry.duration <= 0) return undefined;
  return Math.min(entry.position / entry.duration, 1);
}
