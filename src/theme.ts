/**
 * Design tokens.
 *
 * Direction: a printed granth, not a media app. Warm uncoated paper, dark ink,
 * one saffron accent used only where something is active. The signature element
 * is the danda rule (॥) that opens every screen header.
 *
 * Type follows the interface language:
 *   Marathi — Tiro Devanagari Marathi for titles, Noto Sans Devanagari for UI
 *   English — Source Serif 4 for titles, Source Sans 3 for UI
 * The Devanagari faces carry very thin Latin, which is why English does not
 * reuse them. `type` and `font` read the live language, so prefer them in
 * render (not inside StyleSheet.create) or they will freeze on Marathi.
 */

import { getLang, useLang } from './i18n';
import { Lang } from './i18n/strings';

export const colors = {
  paper: '#FBF6EC',
  card: '#FFFDF8',
  ink: '#241C16',
  inkSoft: '#6E6055',
  inkFaint: '#A2937F',
  rule: '#E6D9C3',
  saffron: '#BC4F17',
  saffronWash: '#F6E6D6',
  danger: '#8C2F1D',
};

export type FontTokens = {
  display: string;
  displayItalic: string;
  body: string;
  bodyMedium: string;
  bodyBold: string;
};

const fontsMr: FontTokens = {
  display: 'TiroDevanagariMarathi_400Regular',
  displayItalic: 'TiroDevanagariMarathi_400Regular_Italic',
  body: 'NotoSansDevanagari_400Regular',
  bodyMedium: 'NotoSansDevanagari_500Medium',
  bodyBold: 'NotoSansDevanagari_600SemiBold',
};

const fontsEn: FontTokens = {
  display: 'SourceSerif4_600SemiBold',
  displayItalic: 'SourceSerif4_600SemiBold',
  body: 'SourceSans3_400Regular',
  bodyMedium: 'SourceSans3_500Medium',
  bodyBold: 'SourceSans3_600SemiBold',
};

export function fontsFor(lang: Lang): FontTokens {
  return lang === 'en' ? fontsEn : fontsMr;
}

function typeFrom(font: FontTokens) {
  return {
    screenTitle: { fontFamily: font.display, fontSize: 26, lineHeight: 38, color: colors.ink },
    workTitle: { fontFamily: font.display, fontSize: 19, lineHeight: 30, color: colors.ink },
    workTitleLarge: { fontFamily: font.display, fontSize: 26, lineHeight: 42, color: colors.ink },
    body: { fontFamily: font.body, fontSize: 15, lineHeight: 26, color: colors.ink },
    meta: { fontFamily: font.body, fontSize: 13, lineHeight: 20, color: colors.inkSoft },
    eyebrow: {
      fontFamily: font.bodyMedium,
      fontSize: 11,
      letterSpacing: 1.1,
      textTransform: 'uppercase' as const,
      color: colors.inkFaint,
    },
    button: { fontFamily: font.bodyBold, fontSize: 15, color: colors.ink },
  };
}

export type TypeTokens = ReturnType<typeof typeFrom>;

function live<T extends object>(resolve: () => T): T {
  return new Proxy({} as T, {
    get(_, prop) {
      return resolve()[prop as keyof T];
    },
  });
}

/** Live tokens — read these during render, not inside StyleSheet.create. */
export const font = live(() => fontsFor(getLang()));
export const type = live(() => typeFrom(fontsFor(getLang())));

export function useFont() {
  const lang = useLang();
  return fontsFor(lang);
}

export function useType() {
  const lang = useLang();
  return typeFrom(fontsFor(lang));
}

export const space = { xs: 4, sm: 8, md: 14, lg: 20, xl: 28, xxl: 40 };
export const radius = { sm: 6, md: 10, lg: 16, pill: 999 };
