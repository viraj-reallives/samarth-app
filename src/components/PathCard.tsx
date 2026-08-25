import { Feather } from '@expo/vector-icons';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLang } from '../i18n';
import { colors, radius, space, type } from '../theme';

export default function PathCard({
  title,
  hint,
  image,
  onPress,
}: {
  title: string;
  hint?: string;
  image: ImageSourcePropType;
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
      <Image source={image} style={styles.image} resizeMode="cover" />
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
  image: { width: '100%', height: 108, backgroundColor: colors.saffronWash },
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
