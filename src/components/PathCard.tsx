import { Feather } from '@expo/vector-icons';
import { Image, ImageSourcePropType, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLang } from '../i18n';
import { colors, radius, space, type } from '../theme';

export default function PathCard({
  title,
  hint,
  image,
  art,
  artGradient,
  onPress,
}: {
  title: string;
  hint?: string;
  image: ImageSourcePropType;
  art: readonly [string, string, string];
  artGradient: string;
  onPress: () => void;
}) {
  useLang();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.art,
          { backgroundColor: art[1] },
          Platform.OS === 'web'
            ? { backgroundImage: artGradient }
            : { experimental_backgroundImage: artGradient },
        ]}
      >
        <Image source={image} style={styles.image} resizeMode="contain" />
      </View>
      <View style={styles.row}>
        <View style={styles.body}>
          <Text style={[type.workTitle, styles.title]}>{title}</Text>
          {hint ? (
            <Text style={type.meta} numberOfLines={1}>
              {hint}
            </Text>
          ) : null}
        </View>
        <Feather name="chevron-right" size={20} color={colors.saffron} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.rule,
    overflow: 'hidden',
    shadowColor: colors.ink,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pressed: { opacity: 0.92 },
  art: {
    height: 132,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: { width: '100%', height: '100%' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
  },
  body: { flex: 1, minWidth: 0 },
  title: { fontSize: 18, lineHeight: 28 },
});
