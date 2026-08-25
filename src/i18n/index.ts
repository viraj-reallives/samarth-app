import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { Work, WorkKind } from '../api/client';
import { Lang, STRINGS, StringKey } from './strings';

const STORAGE_KEY = 'app-language-v1';

/** Marathi is the default: it is the language of the corpus and of most readers. */
let current: Lang = 'mr';
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function hydrateLang() {
  if (hydrated) return;
  hydrated = true;
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored === 'mr' || stored === 'en') {
      current = stored;
      emit();
    }
  } catch {
    // Default stays.
  }
}

export function setLang(lang: Lang) {
  if (lang === current) return;
  current = lang;
  emit();
  AsyncStorage.setItem(STORAGE_KEY, lang).catch(() => {});
}

export function getLang(): Lang {
  return current;
}

export function useLang(): Lang {
  useEffect(() => {
    void hydrateLang();
  }, []);
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => current
  );
}

/**
 * Translation. Falls back to Marathi when an English string is missing, and to
 * the key itself if both are, so a typo shows up loudly instead of blanking.
 *
 *   const t = useT();
 *   t('browse.count', { count: 500 })
 */
export function useT() {
  const lang = useLang();
  return useCallback(
    (key: StringKey, vars?: Record<string, string | number>) => {
      let text = STRINGS[lang][key] ?? STRINGS.mr[key] ?? key;
      if (vars) {
        for (const [name, value] of Object.entries(vars)) {
          text = text.replace(`{${name}}`, String(value));
        }
      }
      return text;
    },
    [lang]
  );
}

/**
 * Which of a work's two titles to show.
 *
 * Show the title in the interface language when it exists, otherwise show
 * whichever exists, and offer the other as a secondary line only when both
 * are present. Interface language does not filter the corpus.
 */
export function titlesFor(lang: Lang, work?: Pick<Work, 'titleMr' | 'titleEn'>) {
  if (!work) return { primary: '', secondary: undefined as string | undefined };

  const preferred = lang === 'en' ? work.titleEn : work.titleMr;
  const other = lang === 'en' ? work.titleMr : work.titleEn;

  const primary = preferred?.trim() || other?.trim() || '';
  const secondary = preferred?.trim() ? other?.trim() || undefined : undefined;

  return { primary, secondary };
}

export function useTitles(work?: Pick<Work, 'titleMr' | 'titleEn'>) {
  const lang = useLang();
  return titlesFor(lang, work);
}

/** The string key for a work's type, so callers write t(kindKey(work.kind)). */
export function kindKey(kind: WorkKind): StringKey {
  return kind === 'audio' ? 'kind.audio' : 'kind.pdf';
}
