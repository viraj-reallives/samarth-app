import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';
import { Work } from '../api/client';

const STORAGE_KEY = 'saved-works-v1';

type SavedWork = Pick<Work, 'slug' | 'titleMr' | 'titleEn' | 'kind'>;

let items: SavedWork[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

async function persist() {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // A failed write is not worth interrupting the reader for.
  }
}

export async function hydrateSaved() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) items = JSON.parse(raw);
  } catch {
    items = [];
  }
  emit();
}

export function toggleSaved(work: Work) {
  items = items.some((item) => item.slug === work.slug)
    ? items.filter((item) => item.slug !== work.slug)
    : [{ slug: work.slug, titleMr: work.titleMr, titleEn: work.titleEn, kind: work.kind }, ...items];
  emit();
  void persist();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSavedWorks(): SavedWork[] {
  useEffect(() => {
    void hydrateSaved();
  }, []);
  return useSyncExternalStore(
    subscribe,
    () => items,
    () => items
  );
}

export function useIsSaved(slug?: string): boolean {
  const saved = useSavedWorks();
  return Boolean(slug) && saved.some((item) => item.slug === slug);
}
