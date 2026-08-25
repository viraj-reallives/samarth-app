import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Image, StyleSheet, Text, View } from 'react-native';
import { useT } from '../i18n';
import { SITE_LOGO } from '../lib/brand';
import { colors, space, type } from '../theme';

export default function BrandLoader({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]} accessibilityRole="progressbar">
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Image
          source={SITE_LOGO}
          style={compact ? styles.logoCompact : styles.logo}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </Animated.View>
      <ActivityIndicator color={colors.saffron} size="large" />
      {compact ? null : (
        <>
          <Text style={[type.workTitle, styles.mantra]}>{t('about.invocation')}</Text>
          <Text style={type.meta}>{t('work.loading')}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
    padding: space.xl,
  },
  wrapCompact: { flex: 0, padding: space.xl },
  logo: { width: 360, height: 132 },
  logoCompact: { width: 300, height: 110 },
  mantra: { fontSize: 18, lineHeight: 28, color: colors.saffron, textAlign: 'center' },
});
