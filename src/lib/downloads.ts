import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { Work, WorkKind } from '../api/client';

/**
 * On-device copies of works.
 *
 * Files go in the document directory, not the cache directory: the OS may evict
 * the cache under storage pressure, and a discourse vanishing mid-listen on a
 * train is exactly the failure this feature exists to prevent.
 *
 * Only the manifest lives in AsyncStorage. The files themselves are the source
 * of truth, so on hydrate we drop any record whose file has gone missing.
 */

const STORAGE_KEY = 'downloads-v1';

const FOLDER: Record<WorkKind, string> = { audio: 'audio', pdf: 'literature' };

export type DownloadRecord = {
  slug: string;
  titleMr: string;
  titleEn?: string;
  kind: WorkKind;
  uri: string;
  bytes: number;
  at: number;
};

type State = {
  records: DownloadRecord[];
  /** slug -> 0..1, or -1 when the size is unknown and progress is indeterminate */
  active: Record<string, number>;
  errors: Record<string, string>;
};

let state: State = { records: [], active: {}, errors: {} };
let hydrated = false;
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function persist() {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.records)).catch(() => {});
}

function safeName(slug: string, url: string) {
  const extension = (url.split('?')[0].match(/\.([a-z0-9]{2,5})$/i)?.[1] ?? 'bin').toLowerCase();
  const stem = slug.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
  return `${stem}.${extension}`;
}

function folderFor(kind: WorkKind) {
  const directory = new Directory(Paths.document, FOLDER[kind]);
  if (!directory.exists) directory.create({ intermediates: true, idempotent: true });
  return directory;
}

export async function hydrateDownloads() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const stored: DownloadRecord[] = raw ? JSON.parse(raw) : [];
    // Drop records whose file is gone (app reinstall, manual clear, OS cleanup).
    const surviving = stored.filter((record) => {
      try {
        return new File(record.uri).exists;
      } catch {
        return false;
      }
    });
    set({ records: surviving });
    if (surviving.length !== stored.length) persist();
  } catch {
    set({ records: [] });
  }
}

/**
 * The progress callback's payload shape has changed across expo-file-system
 * versions, so accept whatever arrives and give up on progress rather than
 * crashing if it is something else entirely.
 *
 * SDK 57 documents `{ bytesWritten, totalBytes }` with `totalBytes === -1`
 * when the server omitted Content-Length.
 */
function readProgress(event: unknown): number {
  if (typeof event === 'number') return event > 1 ? -1 : event;
  if (!event || typeof event !== 'object') return -1;
  const payload = event as Record<string, unknown>;
  const written = payload.totalBytesWritten ?? payload.bytesWritten ?? payload.written;
  const total = payload.totalBytesExpectedToWrite ?? payload.totalBytes ?? payload.total;
  if (typeof written === 'number' && typeof total === 'number' && total > 0) {
    return Math.min(written / total, 1);
  }
  return -1;
}

export async function downloadWork(work: Work): Promise<boolean> {
  if (!work.url) return false;
  if (state.active[work.slug] !== undefined) return false;
  if (state.records.some((record) => record.slug === work.slug)) return true;

  const { [work.slug]: _cleared, ...errors } = state.errors;
  set({
    active: { ...state.active, [work.slug]: -1 },
    errors,
  });

  try {
    const directory = folderFor(work.kind);
    const target = new File(directory, safeName(work.slug, work.url));
    if (target.exists) target.delete();

    let loggedProgress = false;
    const onProgress = (event: unknown) => {
      if (__DEV__ && !loggedProgress) {
        loggedProgress = true;
        console.log('[downloads] first progress event', event);
      }
      const value = readProgress(event);
      set({ active: { ...state.active, [work.slug]: value } });
    };

    let output: File;
    try {
      // Preferred: we control the filename, so two works cannot collide.
      output = await File.downloadFileAsync(work.url, target, { onProgress });
      if (__DEV__) console.log('[downloads] saved as File', target.uri);
    } catch {
      // Fallback for versions that only accept a Directory as the destination.
      const downloaded = await File.downloadFileAsync(work.url, directory);
      downloaded.move(target);
      output = target;
      if (__DEV__) console.log('[downloads] saved via Directory then move', target.uri);
    }

    const record: DownloadRecord = {
      slug: work.slug,
      titleMr: work.titleMr,
      titleEn: work.titleEn,
      kind: work.kind,
      uri: output.uri,
      bytes: output.size ?? work.sizeBytes ?? 0,
      at: Date.now(),
    };

    const { [work.slug]: _removed, ...active } = state.active;
    set({ records: [record, ...state.records], active });
    persist();
    return true;
  } catch (error: unknown) {
    const { [work.slug]: _removed, ...active } = state.active;
    const message = error instanceof Error ? error.message : 'download failed';
    set({
      active,
      errors: { ...state.errors, [work.slug]: message },
    });
    return false;
  }
}

export function removeDownload(slug: string) {
  const record = state.records.find((item) => item.slug === slug);
  if (!record) return;
  try {
    const file = new File(record.uri);
    if (file.exists) file.delete();
  } catch {
    // Record goes regardless: a stale entry is worse than an orphaned file.
  }
  set({ records: state.records.filter((item) => item.slug !== slug) });
  persist();
}

export function removeAllDownloads() {
  for (const record of [...state.records]) removeDownload(record.slug);
}

/* ---------- hooks ---------- */

function useDownloadState(): State {
  useEffect(() => {
    void hydrateDownloads();
  }, []);
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state
  );
}

export function useDownloads(): DownloadRecord[] {
  return useDownloadState().records;
}

export function useDownloadsSize(): number {
  const records = useDownloads();
  return useMemo(() => records.reduce((sum, record) => sum + record.bytes, 0), [records]);
}

export type DownloadStatus =
  | { status: 'idle' }
  | { status: 'downloading'; progress: number }
  | { status: 'done'; uri: string }
  | { status: 'error' };

export function useDownloadStatus(slug?: string): DownloadStatus {
  const current = useDownloadState();
  return useMemo(() => {
    if (!slug) return { status: 'idle' };
    const progress = current.active[slug];
    if (progress !== undefined) return { status: 'downloading', progress };
    const record = current.records.find((item) => item.slug === slug);
    if (record) return { status: 'done', uri: record.uri };
    if (current.errors[slug]) return { status: 'error' };
    return { status: 'idle' };
  }, [current, slug]);
}

/** The local file if it exists, otherwise the remote URL. */
export function usePlayableUri(slug?: string, remote?: string): string | undefined {
  const records = useDownloads();
  return useMemo(
    () => records.find((record) => record.slug === slug)?.uri ?? remote,
    [records, slug, remote]
  );
}

export function formatBytes(bytes: number) {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1000) return `${(mb / 1024).toFixed(1)} GB`;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
