/**
 * The ONLY file that knows what the backend looks like.
 *
 * It talks to the existing Cloudflare Pages Functions API:
 *   GET /api/facets        -> filter options (subject / author / language + counts)
 *   GET /api/browse        -> faceted, paginated list of works
 *   GET /api/work/:slug    -> one work, with its full R2 URL and tags
 *
 * The normalise* functions below accept several plausible field names so the app
 * keeps working whether the API returns `title_mr` or `title_marathi` etc.
 * Run `npm run check:api` (see scripts/check-api.mjs) to print the real shapes,
 * then delete the alternatives you do not need.
 */

const RAW_BASE = process.env.EXPO_PUBLIC_API_BASE ?? 'https://www.samarthramdas400.in';
export const API_BASE = RAW_BASE.replace(/\/+$/, '');

/** Only used if the API returns bare file keys instead of full URLs. */
const R2_BASE = (process.env.EXPO_PUBLIC_R2_BASE ?? '').replace(/\/+$/, '');

export type FacetType = 'subject' | 'author' | 'language';
export const FACET_TYPES: FacetType[] = ['subject', 'author', 'language'];

export type FacetOption = { type: FacetType; value: string; count: number };
export type Facets = Record<FacetType, FacetOption[]>;

export type WorkKind = 'pdf' | 'audio';

export type Work = {
  slug: string;
  titleMr: string;
  titleEn?: string;
  kind: WorkKind;
  url?: string;
  thumbnail?: string;
  sizeBytes?: number;
  facets: { type: FacetType; value: string }[];
};

export type BrowsePage = {
  items: Work[];
  page: number;
  hasMore: boolean;
  total?: number;
};

export type BrowseFilters = {
  subject?: string;
  author?: string;
  language?: string;
  kind?: WorkKind;
};

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function getJson<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const url = new URL(API_BASE + path);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new ApiError(`${path} returned ${response.status}`, response.status);
    }
    return (await response.json()) as T;
  } catch (error: any) {
    if (error?.name === 'AbortError') throw new ApiError('The request timed out.');
    if (error instanceof ApiError) throw error;
    throw new ApiError('Could not reach the library. Check your connection.');
  } finally {
    clearTimeout(timeout);
  }
}

/* ---------- normalisers ---------- */

function pickString(source: any, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = source?.[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function pickNumber(source: any, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = source?.[key];
    const parsed = typeof value === 'string' ? Number(value) : value;
    if (typeof parsed === 'number' && Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function absolute(value?: string): string | undefined {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  if (R2_BASE) return `${R2_BASE}/${value.replace(/^\/+/, '')}`;
  return undefined;
}

function normaliseKind(raw: any, url?: string): WorkKind {
  const declared = pickString(raw, ['file_type', 'fileType', 'type', 'kind'])?.toLowerCase();
  if (declared === 'audio' || declared === 'mp3') return 'audio';
  if (declared === 'pdf') return 'pdf';
  if (url && /\.mp3(\?|$)/i.test(url)) return 'audio';
  return 'pdf';
}

function normaliseFacetType(value?: string): FacetType | undefined {
  const key = value?.toLowerCase();
  if (key === 'subject' || key === 'author' || key === 'language') return key;
  return undefined;
}

function normaliseTags(raw: any): { type: FacetType; value: string }[] {
  const source = raw?.facets ?? raw?.tags ?? raw?.terms;
  if (!Array.isArray(source)) return [];
  const tags: { type: FacetType; value: string }[] = [];
  for (const entry of source) {
    if (typeof entry === 'string') continue; // untyped tag, nothing useful to show
    const type = normaliseFacetType(pickString(entry, ['type', 'facet_type', 'facetType']));
    const value = pickString(entry, ['value', 'name', 'label', 'term', 'facet_value']);
    if (type && value) tags.push({ type, value });
  }
  return tags;
}

export function normaliseWork(raw: any): Work | null {
  const slug = pickString(raw, ['slug', 'content_slug', 'id']);
  if (!slug) return null;

  const url =
    absolute(pickString(raw, ['url', 'file_url', 'fileUrl', 'href'])) ??
    absolute(pickString(raw, ['file_key', 'fileKey', 'key']));

  const titleMr =
    pickString(raw, ['title_mr', 'title_marathi', 'marathi_title', 'titleMr', 'title']) ?? slug;

  return {
    slug,
    titleMr,
    titleEn: pickString(raw, ['title_en', 'title_english', 'english_title', 'titleEn']),
    kind: normaliseKind(raw, url),
    url,
    thumbnail: absolute(pickString(raw, ['thumbnail', 'thumbnail_url', 'thumb', 'cover'])),
    sizeBytes: pickNumber(raw, ['size', 'file_size', 'sizeBytes', 'bytes']),
    facets: normaliseTags(raw),
  };
}

function normaliseFacets(payload: any): Facets {
  const result: Facets = { subject: [], author: [], language: [] };

  // Shape A: { subject: [...], author: [...], language: [...] }
  for (const type of FACET_TYPES) {
    const bucket = payload?.[type] ?? payload?.facets?.[type] ?? payload?.[`${type}s`];
    if (Array.isArray(bucket)) {
      for (const entry of bucket) {
        const value =
          typeof entry === 'string' ? entry : pickString(entry, ['value', 'name', 'label', 'term']);
        if (!value) continue;
        result[type].push({ type, value, count: pickNumber(entry, ['count', 'total', 'n']) ?? 0 });
      }
    }
  }

  // Shape B: a flat array of typed facets
  const flat = Array.isArray(payload) ? payload : payload?.facets;
  if (Array.isArray(flat)) {
    for (const entry of flat) {
      const type = normaliseFacetType(pickString(entry, ['type', 'facet_type', 'facetType']));
      const value = pickString(entry, ['value', 'name', 'label', 'term']);
      if (!type || !value) continue;
      if (result[type].some((option) => option.value === value)) continue;
      result[type].push({ type, value, count: pickNumber(entry, ['count', 'total', 'n']) ?? 0 });
    }
  }

  for (const type of FACET_TYPES) {
    result[type].sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, 'mr'));
  }
  return result;
}

/* ---------- endpoints ---------- */

export async function fetchFacets(): Promise<Facets> {
  return normaliseFacets(await getJson<any>('/api/facets'));
}

export async function fetchBrowse(
  filters: BrowseFilters,
  page: number,
  pageSize = 40
): Promise<BrowsePage> {
  const payload = await getJson<any>('/api/browse', {
    subject: filters.subject,
    author: filters.author,
    language: filters.language,
    file_type: filters.kind,
    page,
    limit: pageSize,
  });

  const rawItems = Array.isArray(payload)
    ? payload
    : payload?.items ?? payload?.results ?? payload?.works ?? payload?.data ?? [];

  const items = (rawItems as any[]).map(normaliseWork).filter((work): work is Work => work !== null);
  const total = pickNumber(payload, ['total', 'count', 'totalCount']);

  const hasMore =
    typeof payload?.hasMore === 'boolean'
      ? payload.hasMore
      : total !== undefined
        ? page * pageSize < total
        : items.length === pageSize;

  return { items, page, hasMore, total };
}

export async function fetchWork(slug: string): Promise<Work> {
  const payload = await getJson<any>(`/api/work/${encodeURIComponent(slug)}`);
  const work = normaliseWork(payload?.work ?? payload?.item ?? payload);
  if (!work) throw new ApiError('That work could not be found.');
  return work;
}
