import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';
import { LANDING_IMAGE, LANDING_SOUND } from '../lib/brand';

const HOLD_MS = 4000;
const FADE_MS = 400;
const AUDIO_FALLBACK_MS = 4000;

export default function LandingSplash({
  canDismiss,
  onReady,
  onFinished,
}: {
  canDismiss: boolean;
  onReady?: () => void;
  onFinished?: () => void;
}) {
  const player = useAudioPlayer(LANDING_SOUND);
  const status = useAudioPlayerStatus(player);
  const opacity = useRef(new Animated.Value(1)).current;
  const started = useRef(false);
  const fading = useRef(false);
  const [held, setHeld] = useState(false);
  const [audioDone, setAudioDone] = useState(false);

  useEffect(() => {
    if (started.current || !status.isLoaded) return;
    started.current = true;
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    })
      .catch(() => {})
      .finally(() => {
        try {
          player.play();
        } catch {
          setAudioDone(true);
        }
      });
  }, [status.isLoaded, player]);

  useEffect(() => {
    if (status.didJustFinish || status.error) setAudioDone(true);
  }, [status.didJustFinish, status.error]);

  useEffect(() => {
    const hold = setTimeout(() => setHeld(true), HOLD_MS);
    const fallback = setTimeout(() => setAudioDone(true), AUDIO_FALLBACK_MS);
    return () => {
      clearTimeout(hold);
      clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (!held || !audioDone || !canDismiss || fading.current) return;
    fading.current = true;
    try {
      player.pause();
    } catch {}
    Animated.timing(opacity, {
      toValue: 0,
      duration: FADE_MS,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      onFinished?.();
    });
  }, [held, audioDone, canDismiss, opacity, onFinished, player]);

  return (
    <Animated.View style={[styles.fill, { opacity }]} pointerEvents="auto">
      <Image
        source={LANDING_IMAGE}
        style={styles.image}
        resizeMode="cover"
        onLoad={onReady}
        accessibilityIgnoresInvertColors
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 100,
    backgroundColor: '#4A8BC2',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
