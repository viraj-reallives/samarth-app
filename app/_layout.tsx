import { NotoSansDevanagari_400Regular } from '@expo-google-fonts/noto-sans-devanagari/400Regular';
import { NotoSansDevanagari_500Medium } from '@expo-google-fonts/noto-sans-devanagari/500Medium';
import { NotoSansDevanagari_600SemiBold } from '@expo-google-fonts/noto-sans-devanagari/600SemiBold';
import { SourceSans3_400Regular } from '@expo-google-fonts/source-sans-3/400Regular';
import { SourceSans3_500Medium } from '@expo-google-fonts/source-sans-3/500Medium';
import { SourceSans3_600SemiBold } from '@expo-google-fonts/source-sans-3/600SemiBold';
import { SourceSerif4_600SemiBold } from '@expo-google-fonts/source-serif-4/600SemiBold';
import { TiroDevanagariMarathi_400Regular } from '@expo-google-fonts/tiro-devanagari-marathi/400Regular';
import { TiroDevanagariMarathi_400Regular_Italic } from '@expo-google-fonts/tiro-devanagari-marathi/400Regular_Italic';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { setAudioModeAsync } from 'expo-audio';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LandingSplash from '../src/components/LandingSplash';
import { hydrateLang } from '../src/i18n';
import { hydrateDownloads } from '../src/lib/downloads';
import { hydratePlayback } from '../src/lib/playback';
import { colors } from '../src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 400, fade: true });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, refetchOnWindowFocus: false },
  },
});

const SKY = '#4A8BC2';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    TiroDevanagariMarathi_400Regular,
    TiroDevanagariMarathi_400Regular_Italic,
    NotoSansDevanagari_400Regular,
    NotoSansDevanagari_500Medium,
    NotoSansDevanagari_600SemiBold,
    SourceSerif4_600SemiBold,
    SourceSans3_400Regular,
    SourceSans3_500Medium,
    SourceSans3_600SemiBold,
  });
  const [langReady, setLangReady] = useState(false);
  const [landingDone, setLandingDone] = useState(false);
  // iOS native splash is already the full painting, so the landing can start at once.
  // Android: wait until the OS splash is gone and the painting is on screen.
  const [nativeGone, setNativeGone] = useState(Platform.OS !== 'android');
  const [imageReady, setImageReady] = useState(Platform.OS !== 'android');
  const hidingNative = useRef(false);

  // One audio session for the whole app. doNotMix is required for lock screen controls.
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([hydrateLang(), hydrateDownloads(), hydratePlayback()]).finally(() =>
      setLangReady(true)
    );
  }, []);

  const hideNativeSplash = useCallback(() => {
    if (hidingNative.current) return;
    hidingNative.current = true;
    SplashScreen.hideAsync()
      .catch(() => {})
      .finally(() => {
        if (Platform.OS !== 'android') {
          setNativeGone(true);
          return;
        }
        // Android 12+ still plays a short icon animation; ours is the same sky blue.
        setTimeout(() => setNativeGone(true), 100);
      });
  }, []);

  const finishLanding = useCallback(() => {
    setLandingDone(true);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') hideNativeSplash();
    const fallback = setTimeout(hideNativeSplash, 800);
    return () => clearTimeout(fallback);
  }, [hideNativeSplash]);

  useEffect(() => {
    if (nativeGone && imageReady) return;
    const stuck = setTimeout(() => {
      setNativeGone(true);
      setImageReady(true);
    }, 2500);
    return () => clearTimeout(stuck);
  }, [nativeGone, imageReady]);

  const resourcesReady = Boolean((fontsLoaded || fontError) && langReady);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style={landingDone ? 'dark' : 'light'} />
        <View style={{ flex: 1, backgroundColor: landingDone ? colors.paper : SKY }}>
          {resourcesReady ? (
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.paper },
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="work/[slug]" options={{ presentation: 'card' }} />
            </Stack>
          ) : null}
          {!landingDone ? (
            <LandingSplash
              active={nativeGone && imageReady}
              canDismiss={resourcesReady}
              onReady={hideNativeSplash}
              onImageReady={() => setImageReady(true)}
              onFinished={finishLanding}
            />
          ) : null}
        </View>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
