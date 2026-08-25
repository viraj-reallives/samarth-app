import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import {
  requestNotificationPermissionsAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, type } from '../theme';

const RATES = [1, 1.25, 1.5, 0.75];

function clock(seconds?: number) {
  if (!seconds || !Number.isFinite(seconds)) return '0:00';
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  return `${h > 0 ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`;
}

export default function AudioPlayer({
  uri,
  title,
  artist,
}: {
  uri: string;
  title: string;
  artist?: string;
}) {
  const player = useAudioPlayer({ uri }, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const [scrubTo, setScrubTo] = useState<number | null>(null);
  const [rateIndex, setRateIndex] = useState(0);

  // Android shows the media notification only with notification permission.
  useEffect(() => {
    if (Platform.OS === 'android') void requestNotificationPermissionsAsync().catch(() => {});
  }, []);

  // Hand this player the lock screen / Control Center controls while the screen is open.
  useEffect(() => {
    try {
      player.setActiveForLockScreen(
        true,
        { title, artist: artist ?? 'श्री समर्थ रामदास', albumTitle: 'समर्थ व्यासपीठ' },
        { showSeekBackward: true, showSeekForward: true }
      );
    } catch {}
    return () => {
      try {
        player.clearLockScreenControls();
      } catch {}
    };
  }, [player, title, artist]);

  const duration = status.duration || 0;
  const position = scrubTo ?? status.currentTime ?? 0;
  const ready = status.isLoaded;

  const skip = (delta: number) => {
    const next = Math.min(Math.max(position + delta, 0), duration || position + delta);
    void player.seekTo(next);
  };

  const cycleRate = () => {
    const next = (rateIndex + 1) % RATES.length;
    setRateIndex(next);
    player.setPlaybackRate(RATES[next], 'high');
  };

  return (
    <View style={styles.wrap}>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration || 1}
        value={position}
        onValueChange={setScrubTo}
        onSlidingComplete={(value) => {
          setScrubTo(null);
          void player.seekTo(value);
        }}
        minimumTrackTintColor={colors.saffron}
        maximumTrackTintColor={colors.rule}
        thumbTintColor={colors.saffron}
        disabled={!ready}
      />

      <View style={styles.times}>
        <Text style={type.meta}>{clock(position)}</Text>
        <Text style={type.meta}>
          {status.isBuffering && !status.playing ? 'लोड होत आहे…' : clock(duration)}
        </Text>
      </View>

      <View style={styles.controls}>
        <Pressable onPress={cycleRate} hitSlop={12} accessibilityLabel="गती बदला">
          <Text style={[type.meta, styles.rate]}>{RATES[rateIndex]}x</Text>
        </Pressable>

        <Pressable onPress={() => skip(-15)} hitSlop={12} accessibilityLabel="१५ सेकंद मागे">
          <Feather name="rotate-ccw" size={22} color={colors.ink} />
        </Pressable>

        <Pressable
          onPress={() => (status.playing ? player.pause() : player.play())}
          style={styles.play}
          accessibilityRole="button"
          accessibilityLabel={status.playing ? 'थांबवा' : 'ऐका'}
          disabled={!ready}
        >
          <Feather
            name={status.playing ? 'pause' : 'play'}
            size={26}
            color={colors.card}
            style={status.playing ? undefined : styles.playNudge}
          />
        </Pressable>

        <Pressable onPress={() => skip(15)} hitSlop={12} accessibilityLabel="१५ सेकंद पुढे">
          <Feather name="rotate-cw" size={22} color={colors.ink} />
        </Pressable>

        <View style={styles.rateSpacer} />
      </View>

      {status.error ? <Text style={styles.error}>ध्वनिफीत सुरू होऊ शकली नाही.</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.rule,
    paddingHorizontal: space.md,
    paddingTop: space.md,
    paddingBottom: space.lg,
  },
  slider: { width: '100%', height: 34 },
  times: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: space.sm },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.md,
    paddingHorizontal: space.sm,
  },
  play: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.saffron,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playNudge: { marginLeft: 3 },
  rate: { width: 40, color: colors.inkSoft },
  rateSpacer: { width: 40 },
  error: { ...type.meta, color: colors.danger, marginTop: space.sm, textAlign: 'center' },
});
