# श्री समर्थ रामदास (Expo app)

An iOS and Android client for the existing samarthramdas400.in library. It adds
no backend of its own: it reads the same Cloudflare Pages Functions API the
website reads, and streams the same files from R2.

```
Expo app (iOS / Android)
   |
   |  https  GET /api/facets · /api/browse · /api/work/:slug
   v
Cloudflare Pages Functions  ->  D1 (metadata)
   |
   v
Cloudflare R2 (PDF + MP3, streamed directly to the device)
```

## What is here

| Screen | File | What it does |
|---|---|---|
| ग्रंथसंग्रह (browse) | `app/(tabs)/index.tsx` | Faceted, paginated list with search and filter sheet |
| माझी यादी (saved) | `app/(tabs)/saved.tsx` | Bookmarks, stored on device |
| परिचय (about) | `app/(tabs)/about.tsx` | Foundation blurb and site link |
| Work detail | `app/work/[slug].tsx` | Audio player, or open the PDF |

Everything that knows the backend's field names lives in **`src/api/client.ts`**.
Nothing else in the app touches `fetch`.

## Setup

```bash
npx create-expo-app@latest samarth-app --template blank-typescript
cd samarth-app
# copy the files from this folder over the generated project, then:
npx expo install expo-router expo-audio expo-web-browser expo-font expo-splash-screen \
  expo-status-bar expo-linking expo-constants expo-application \
  react-native-safe-area-context react-native-screens \
  @react-native-async-storage/async-storage @react-native-community/slider \
  @expo-google-fonts/tiro-devanagari-marathi @expo-google-fonts/noto-sans-devanagari
npm install @tanstack/react-query
npx expo install --fix          # pins everything to the SDK's versions
cp .env.example .env
```

`expo-audio` needs a development build, not Expo Go, because of the background
playback config plugin:

```bash
npx expo run:ios        # or: eas build --profile development --platform ios
npx expo run:android
```

## Before you write any UI code, run this

```bash
node scripts/check-api.mjs
```

It prints the real JSON shape of all three endpoints, the content type headers,
and whether R2 sends `Accept-Ranges` (audio seeking needs it). The normalisers in
`src/api/client.ts` accept several field-name variants so the app runs before you
have checked. Once you see the real names, delete the variants you do not need.

## Two small backend additions

Neither is required for the app to work on device. Both are worth doing.

1. **CORS on `/api/*`.** Copy `backend-snippets/api-middleware.js` into the
   website repo at `functions/api/_middleware.js`. Native fetch ignores CORS, so
   the app runs without it, but Expo web and browser dev tools will not. The same
   file sets `charset=utf-8` and a cache header.

2. **A `q` parameter on `/api/browse`.** Search is currently client-side over the
   pages already loaded. One `LIKE` clause against the Marathi and English title
   columns makes it work across all 500 works. Then pass `q` through
   `BrowseFilters` and drop the local filter in `app/(tabs)/index.tsx`.

## Things worth knowing

- **Background audio** is configured through the `expo-audio` plugin in
  `app.json`. On Android, sustained background playback only works because
  `AudioPlayer.tsx` calls `setActiveForLockScreen`; without it the OS stops
  playback after roughly three minutes. `interruptionMode: 'doNotMix'` in
  `app/_layout.tsx` is what makes the lock screen card appear.
- **PDFs** open in the system browser view (SFSafariViewController on iOS, Custom
  Tabs on Android). iOS renders them inline. Some Android devices hand the file
  to a download manager instead. If that becomes a complaint, add
  `react-native-pdf` and render in-app.
- **Fonts** are bundled locally by the `@expo-google-fonts` packages, so there is
  no network fetch at startup. If you ever need to drop them, blank out the
  values in `src/theme.ts` and remove the `useFonts` block in `app/_layout.tsx`;
  the system Devanagari face takes over.
- **Marathi is the interface language.** There is no English UI string in the
  app. If you want a toggle later, the place to add it is `src/theme.ts` next to
  `kindLabel`.

## Release

- Android: Play Console, one-time $25. `eas build --platform android --profile production`.
- iOS: Apple Developer Program, $99/year. Same command with `--platform ios`.
- Apple rejects apps that are only a website in a shell (guideline 4.2). This one
  is not: native browse, native player with lock screen controls, on-device
  bookmarks. Offline downloads would strengthen it further.
- JS-only changes ship over the air with `expo-updates`, no store review. Changes
  to `app.json` plugins need a new binary.

## Next, in order of value

1. Offline downloads. `expo-file-system`'s `File.downloadFileAsync` into the
   document directory, then hand the local URI to `AudioPlayer` instead of the
   remote one. This is the single biggest quality-of-life gain for listeners on
   patchy connections, and the strongest answer to guideline 4.2.
2. Resume playback position per track, stored alongside the bookmarks.
3. A playlist queue. `useAudioPlaylist` in `expo-audio` gives gapless playback
   across an author's discourses with no extra work.
4. Push notifications when new works are added, if the foundation wants them.
