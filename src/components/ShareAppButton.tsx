import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useT } from '../i18n';
import { shareApp } from '../lib/shareApp';
import { colors, radius, space, type } from '../theme';

export default function ShareAppButton({ variant }: { variant: 'compact' | 'banner' }) {
  const t = useT();
  const compactLabel = t('about.shareAppShort');
  const bannerLabel = t('about.shareApp');
  const onShare = () => shareApp(t('about.shareAppMessage'));

  if (variant === 'compact') {
    return (
      <Pressable
        onPress={onShare}
        hitSlop={8}
        style={({ pressed }) => [styles.compact, pressed && styles.compactPressed]}
        accessibilityRole="button"
        accessibilityLabel={bannerLabel}
      >
        <Feather name="share-2" size={14} color={colors.saffron} />
        <Text style={[type.meta, styles.compactLabel]} numberOfLines={1}>
          {compactLabel}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onShare}
      style={({ pressed }) => [styles.banner, pressed && styles.bannerPressed]}
      accessibilityRole="button"
      accessibilityLabel={bannerLabel}
    >
      <View style={styles.bannerIcon}>
        <Feather name="share-2" size={20} color={colors.card} />
      </View>
      <View style={styles.bannerBody}>
        <Text style={[type.button, styles.bannerTitle]}>{bannerLabel}</Text>
        <Text style={type.meta}>{t('about.shareAppHint')}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.saffron} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  compactPressed: { opacity: 0.6 },
  compactLabel: { color: colors.inkFaint },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.saffron,
    backgroundColor: colors.saffronWash,
  },
  bannerPressed: { opacity: 0.85 },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.saffron,
  },
  bannerBody: { flex: 1, gap: 2 },
  bannerTitle: { color: colors.ink },
});
