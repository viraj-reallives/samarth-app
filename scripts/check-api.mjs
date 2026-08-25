/**
 * Prints the real shape of each API response so you can trim the normalisers
 * in src/api/client.ts down to what the backend actually returns.
 *
 *   node scripts/check-api.mjs
 *   node scripts/check-api.mjs https://samarth-ramdas-website.pages.dev
 */

const base = (process.argv[2] ?? 'https://www.samarthramdas400.in').replace(/\/+$/, '');

const show = (label, value) => {
  console.log(`\n=== ${label} ===`);
  console.log(JSON.stringify(value, null, 2).slice(0, 1600));
};

const get = async (path) => {
  const response = await fetch(base + path, { headers: { Accept: 'application/json' } });
  console.log(`${response.status} ${path}  (${response.headers.get('content-type') ?? 'no content-type'})`);
  console.log(`  access-control-allow-origin: ${response.headers.get('access-control-allow-origin') ?? 'MISSING'}`);
  if (!response.ok) return null;
  return response.json();
};

const facets = await get('/api/facets');
show('facets (first 1600 chars)', facets);

const browse = await get('/api/browse?limit=2');
show('browse (first 1600 chars)', browse);

const first =
  (Array.isArray(browse) ? browse[0] : browse?.items?.[0] ?? browse?.results?.[0]) ?? null;

if (first?.slug) {
  const work = await get(`/api/work/${encodeURIComponent(first.slug)}`);
  show('work', work);

  const url = work?.url ?? work?.file_url ?? work?.work?.url;
  if (url) {
    const head = await fetch(url, { method: 'HEAD' });
    console.log(`\nfile HEAD ${head.status}`);
    console.log(`  content-type:  ${head.headers.get('content-type')}`);
    console.log(`  accept-ranges: ${head.headers.get('accept-ranges') ?? 'MISSING (audio seeking needs this)'}`);
  }
} else {
  console.log('\nCould not find a slug in the browse response.');
}
