import { ImageSourcePropType } from 'react-native';
import { FacetType } from '../api/client';

export const SITE_LOGO = require('../../assets/brand/logo-main.jpeg') as ImageSourcePropType;
export const LANDING_IMAGE = require('../../assets/landing-image.png') as ImageSourcePropType;
export const LANDING_SOUND = require('../../assets/landing-sound.mp3');

export const PATH_CARD_IMAGES: Record<FacetType, ImageSourcePropType> = {
  subject: require('../../assets/brand/cards/subject.jpg'),
  author: require('../../assets/brand/cards/author.jpg'),
  language: require('../../assets/brand/cards/language.jpg'),
};

const PORTRAITS: Record<string, ImageSourcePropType> = {
  sushamatai: require('../../assets/brand/authors/sushamatai.jpg'),
  swarnalata: require('../../assets/brand/authors/swarnalata.jpg'),
  chaitanya: require('../../assets/brand/authors/chaitanya.jpg'),
  shridhar: require('../../assets/brand/authors/shridhar.jpg'),
  shivaji: require('../../assets/brand/authors/shivaji.jpg'),
  chincholkar: require('../../assets/brand/authors/chincholkar.jpg'),
  mohanbua: require('../../assets/brand/authors/mohanbua.jpg'),
  varadanand: require('../../assets/brand/authors/varadanand.jpg'),
  dharmendra: require('../../assets/brand/authors/dharmendra.jpg'),
  mujaffar: require('../../assets/brand/authors/mujaffar.jpg'),
  dadajadhav: require('../../assets/brand/authors/dadajadhav.jpg'),
  makarandnath: require('../../assets/brand/authors/makarandnath.jpg'),
  kalyani: require('../../assets/brand/authors/kalyani.jpg'),
  sansthan: require('../../assets/brand/authors/sansthan.jpg'),
  shriniwas: require('../../assets/brand/authors/shriniwas.jpg'),
  caphale: require('../../assets/brand/authors/caphale.jpg'),
  dekhane: require('../../assets/brand/authors/dekhane.jpg'),
  other: require('../../assets/brand/authors/other-authors.jpg'),
};

const AUTHOR_ALIASES: Record<string, keyof typeof PORTRAITS> = {
  sushamatai: 'sushamatai',
  'sushamatai-watve': 'sushamatai',
  swarnalata: 'swarnalata',
  'swarnalata-bhishikar': 'swarnalata',
  'dr-swarnalata-bhishikar': 'swarnalata',
  chaitanya: 'chaitanya',
  'chaitanya-maharaj': 'chaitanya',
  'chaitanya_maharaj': 'chaitanya',
  shridhar: 'shridhar',
  'shridhar-swami': 'shridhar',
  'shridhar_swami': 'shridhar',
  'shreedhar-swami': 'shridhar',
  shivaji: 'shivaji',
  'shivaji-bhosale': 'shivaji',
  chincholkar: 'chincholkar',
  'sunil-chincholkar': 'chincholkar',
  mohanbua: 'mohanbua',
  'mohanbua-ramadasi': 'mohanbua',
  mohabua_ramdasi: 'mohanbua',
  varadanand: 'varadanand',
  'varadanand-bharati': 'varadanand',
  varadanand_bhrati: 'varadanand',
  dharmendra: 'dharmendra',
  dharmendraji: 'dharmendra',
  mujaffar: 'mujaffar',
  'mujaffar-hussain': 'mujaffar',
  dadajadhav: 'dadajadhav',
  'dada-jadhav': 'dadajadhav',
  makarandnath: 'makarandnath',
  kalyani: 'kalyani',
  'kalyani-namjoshi': 'kalyani',
  sansthan: 'sansthan',
  shriniwas: 'shriniwas',
  'shrinivas-rairikar': 'shriniwas',
  shriniwas_rairikar: 'shriniwas',
  caphale: 'caphale',
  'charudatta-aphle': 'caphale',
  dekhane: 'dekhane',
  'ramchandra-dekhane': 'dekhane',
  'acharya-dharmendraji': 'dharmendra',
  other: 'other',
  'other-authors': 'other',
  'transparent-writer-icon-png': 'other',
};

const NAME_HINTS: [string, keyof typeof PORTRAITS][] = [
  ['सुषमा', 'sushamatai'],
  ['स्वर्णलता', 'swarnalata'],
  ['चैतन्य', 'chaitanya'],
  ['श्रीधर', 'shridhar'],
  ['शिवाजी', 'shivaji'],
  ['चिंचोळकर', 'chincholkar'],
  ['मोहनबुवा', 'mohanbua'],
  ['वरदानंद', 'varadanand'],
  ['धर्मेन्द्र', 'dharmendra'],
  ['धर्मेंद्र', 'dharmendra'],
  ['मुज्जफ्फर', 'mujaffar'],
  ['जाधव', 'dadajadhav'],
  ['मकरंदनाथ', 'makarandnath'],
  ['कल्याणी', 'kalyani'],
  ['संस्थान', 'sansthan'],
  ['रायरीकर', 'shriniwas'],
  ['आफळे', 'caphale'],
  ['देखणे', 'dekhane'],
];

export function authorPortrait(slugOrName?: string): ImageSourcePropType | undefined {
  if (!slugOrName?.trim()) return undefined;
  const key = slugOrName.toLowerCase().replace(/_/g, '-');
  const aliased = AUTHOR_ALIASES[key] ?? AUTHOR_ALIASES[slugOrName];
  if (aliased) return PORTRAITS[aliased];

  const stem = (Object.keys(PORTRAITS) as (keyof typeof PORTRAITS)[]).find(
    (name) => name !== 'other' && name.length >= 5 && key.includes(name)
  );
  if (stem) return PORTRAITS[stem];

  const hinted = NAME_HINTS.find(([hint]) => slugOrName.includes(hint));
  return hinted ? PORTRAITS[hinted[1]] : undefined;
}

export function portraitForWork(work?: {
  titleMr?: string;
  titleEn?: string;
  facets: { type: string; value: string; slug?: string }[];
}) {
  if (!work) return undefined;
  const author = work.facets.find((facet) => facet.type === 'author');
  return (
    authorPortrait(author?.slug) ??
    authorPortrait(author?.value) ??
    authorPortrait(work.titleMr) ??
    authorPortrait(work.titleEn)
  );
}
