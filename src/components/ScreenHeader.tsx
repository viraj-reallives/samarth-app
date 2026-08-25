import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLang } from '../i18n';
import { colors, space, type } from '../theme';

export default function ScreenHeader({
  title,
  subtitle,
  right,
  onBack,
  backLabel,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onBack?: () => void;
  backLabel?: string;
}) {
  useLang();
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.titleBlock}>
          {onBack ? (
            <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel={backLabel}>
              <Feather name="chevron-left" size={26} color={colors.ink} />
            </Pressable>
          ) : (
            <View style={styles.danda}>
              <Text style={styles.dandaMark}>॥</Text>
            </View>
          )}
          <Text style={[type.screenTitle, styles.title]} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {right}
      </View>
      {subtitle ? (
        <Text style={[type.meta, styles.subtitle, onBack && styles.subtitleBack]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: space.xl,
    paddingTop: space.sm,
    paddingBottom: space.md,
    backgroundColor: colors.paper,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleBlock: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexShrink: 1, flex: 1 },
  title: { flexShrink: 1 },
  danda: { justifyContent: 'center' },
  dandaMark: { color: colors.saffron, fontSize: 20, lineHeight: 26 },
  subtitle: { marginTop: 2, marginLeft: 24 },
  subtitleBack: { marginLeft: 34 },
});
