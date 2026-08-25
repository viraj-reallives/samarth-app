/**
 * Design tokens.
 *
 * Direction: a printed granth, not a media app. Warm uncoated paper, dark ink,
 * one saffron accent used only where something is active. The signature element
 * is the danda rule (॥) that opens every screen header.
 *
 * Type: Tiro Devanagari Marathi for titles (a face cut for Marathi literary
 * publishing, with traditional vertical conjuncts) and Noto Sans Devanagari for
 * UI and body. If you ever need to drop the font packages, set every value in
 * `font` to undefined and the app falls back to the system Devanagari face.
 */

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

export const font = {
  display: 'TiroDevanagariMarathi_400Regular',
  displayItalic: 'TiroDevanagariMarathi_400Regular_Italic',
  body: 'NotoSansDevanagari_400Regular',
  bodyMedium: 'NotoSansDevanagari_500Medium',
  bodyBold: 'NotoSansDevanagari_600SemiBold',
};

export const type = {
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

export const space = { xs: 4, sm: 8, md: 14, lg: 20, xl: 28, xxl: 40 };
export const radius = { sm: 6, md: 10, pill: 999 };

/** Marathi labels for the two content types. */
export const kindLabel = { pdf: 'ग्रंथ', audio: 'श्रवण' } as const;
