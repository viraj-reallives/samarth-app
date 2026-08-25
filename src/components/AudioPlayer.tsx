import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import {
  requestNotificationPermissionsAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import { Image, ImageSourcePropType, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useT } from '../i18n';
import { clearPosition, getPosition, recordPosition } from '../lib/playback';
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
  slug,
  uri,
  title,
  artist,
  portrait,
}: {
  slug: string;
  uri: string;
  title: string;
  artist?: string;
  portrait?: ImageSourcePropType;
}) {
  const t = useT();
  const player = useAudioPlayer({ uri }, { updateInterval: 500 });
  const status = useAudioPlayerStatus(player);
  const [scrubTo, setScrubTo] = useState<number | null>(null);
  const [rateIndex, setRateIndex] = useState(0);
  const [resumedFrom, setResumedFrom] = useState<number | null>(null);
  const hasResumed = useRef(false);

  // Android shows the media notification only with notification permission.
  useEffect(() => {
    if (Platform.OS === 'android') void requestNotificationPermissionsAsync().catch(() => {});
  }, []);

  // Hand this player the lock screen / Control Center controls while open.
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

  // Restore the saved position, once, as soon as the source reports a duration.
  useEffect(() => {
    if (hasResumed.current || !status.isLoaded || !status.duration) return;
    hasResumed.current = true;
    const saved = getPosition(slug);
    if (saved && saved < status.duration - 25) {
      player.seekTo(saved);
      setResumedFrom(saved);
    }
  }, [status.isLoaded, status.duration, slug, player]);

  // Remember where we are. The store throttles its own writes.
  useEffect(() => {
    if (status.playing && status.currentTime) {
      recordPosition(slug, status.currentTime, status.duration ?? 0);
    }
  }, [status.playing, status.currentTime, status.duration, slug]);

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
      {portrait ? (
        <View style={styles.artist}>
          <View style={styles.avatarWrap}>
            <Image source={portrait} style={styles.avatar} resizeMode="cover" />
          </View>
          {artist ? (
            <Text style={[type.workTitle, styles.artistName]} numberOfLines={2}>
              {artist}
            </Text>
          ) : null}
        </View>
      ) : null}

      {resumedFrom !== null && (
        <Pressable
          style={styles.resumed}
          onPress={() => {
            void player.seekTo(0);
            setResumedFrom(null);
            clearPosition(slug);
          }}
          accessibilityRole="button"
          accessibilityLabel={t('player.resumed', { time: clock(resumedFrom) })}
        >
          <Feather name="corner-up-left" size={12} color={colors.saffron} />
          <Text style={[type.meta, styles.resumedText]}>
            {t('player.resumed', { time: clock(resumedFrom) })}
          </Text>
        </Pressable>
      )}

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration || 1}
        value={position}
        onValueChange={setScrubTo}
        onSlidingComplete={(value) => {
          setScrubTo(null);
          void player.seekTo(value);
          recordPosition(slug, value, duration);
        }}
        minimumTrackTintColor={colors.saffron}
        maximumTrackTintColor={colors.rule}
        thumbTintColor={colors.saffron}
        disabled={!ready}
      />

      <View style={styles.times}>
        <Text style={type.meta}>{clock(position)}</Text>
        <Text style={type.meta}>
          {status.isBuffering && !status.playing ? t('work.loading') : clock(duration)}
        </Text>
      </View>

      <View style={styles.controls}>
        <Pressable onPress={cycleRate} hitSlop={12} accessibilityLabel={t('work.rate')}>
          <Text style={[type.meta, styles.rate]}>{RATES[rateIndex]}x</Text>
        </Pressable>

        <Pressable onPress={() => skip(-15)} hitSlop={12} accessibilityLabel={t('work.skipBack')}>
          <Feather name="rotate-ccw" size={22} color={colors.ink} />
        </Pressable>

        <Pressable
          onPress={() => (status.playing ? player.pause() : player.play())}
          style={styles.play}
          accessibilityRole="button"
          accessibilityLabel={status.playing ? t('work.pause') : t('work.listen')}
          disabled={!ready}
        >
          <Feather
            name={status.playing ? 'pause' : 'play'}
            size={26}
            color={colors.card}
            style={status.playing ? undefined : styles.playNudge}
          />
        </Pressable>

        <Pressable onPress={() => skip(15)} hitSlop={12} accessibilityLabel={t('work.skipForward')}>
          <Feather name="rotate-cw" size={22} color={colors.ink} />
        </Pressable>

        <View style={styles.rateSpacer} />
      </View>

      {status.error ? <Text style={styles.error}>{t('work.audioError')}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.rule,
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.lg,
  },
  artist: { alignItems: 'center', gap: space.md, marginBottom: space.md },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    backgroundColor: colors.saffronWash,
    borderWidth: 3,
    borderColor: colors.rule,
  },
  avatar: { width: '100%', height: '100%' },
  artistName: { fontSize: 18, lineHeight: 28, textAlign: 'center' },
  resumed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: space.sm,
    marginBottom: space.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.saffronWash,
  },
  resumedText: { color: colors.saffron },
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
  error: { color: colors.danger, marginTop: space.sm, textAlign: 'center', fontSize: 13, lineHeight: 20 },
});
