import { StyleSheet, Text, View } from 'react-native';
import { colors, space, type } from '../theme';

export default function ScreenHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.titleBlock}>
          <View style={styles.danda}>
            <Text style={styles.dandaMark}>॥</Text>
          </View>
          <Text style={type.screenTitle}>{title}</Text>
        </View>
        {right}
      </View>
      {subtitle ? <Text style={[type.meta, styles.subtitle]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.md,
    backgroundColor: colors.paper,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleBlock: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexShrink: 1 },
  danda: { justifyContent: 'center' },
  dandaMark: { color: colors.saffron, fontSize: 20, lineHeight: 26 },
  subtitle: { marginTop: 2, marginLeft: 24 },
});
