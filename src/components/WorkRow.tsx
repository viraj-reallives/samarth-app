import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Work } from '../api/client';
import { colors, kindLabel, space, type } from '../theme';

export default function WorkRow({ work }: { work: Work }) {
  const author = work.facets.find((facet) => facet.type === 'author')?.value;

  return (
    <Link href={`/work/${work.slug}`} asChild>
      <Pressable
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        accessibilityRole="button"
        accessibilityLabel={work.titleMr}
      >
        <View style={styles.mark}>
          <Feather
            name={work.kind === 'audio' ? 'headphones' : 'book-open'}
            size={16}
            color={colors.inkSoft}
          />
        </View>

        <View style={styles.text}>
          <Text style={type.eyebrow}>{kindLabel[work.kind]}</Text>
          <Text style={[type.workTitle, styles.title]} numberOfLines={2}>
            {work.titleMr}
          </Text>
          {(author || work.titleEn) && (
            <Text style={type.meta} numberOfLines={1}>
              {author ?? work.titleEn}
            </Text>
          )}
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rule,
    backgroundColor: colors.paper,
  },
  rowPressed: { backgroundColor: colors.saffronWash },
  mark: { paddingTop: 18 },
  text: { flex: 1 },
  title: { marginTop: 2, marginBottom: 2 },
});
