/**
 * Drop this in the WEBSITE repo at: functions/api/_middleware.js
 *
 * It wraps every /api/* response with CORS headers and a UTF-8 content type.
 * Native iOS and Android do not enforce CORS, so the app works without it, but
 * you need it for: Expo web, the Expo dev tools in a browser, and any future
 * client on another origin. It changes nothing for the existing website.
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  'Access-Control-Max-Age': '86400',
};

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  const response = await context.next();
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(CORS)) headers.set(key, value);

  // Marathi renders as mojibake without this. Keep it.
  if (!headers.get('Content-Type')) {
    headers.set('Content-Type', 'application/json; charset=utf-8');
  }

  // Metadata changes rarely; let the edge and the app cache it.
  if (!headers.get('Cache-Control')) {
    headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
  }

  return new Response(response.body, { status: response.status, headers });
}
