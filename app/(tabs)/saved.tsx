import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../src/components/ScreenHeader';
import { kindKey, useT, useTitles } from '../../src/i18n';
import { useSavedWorks } from '../../src/lib/saved';
import { colors, space, type } from '../../src/theme';

function SavedRow({
  item,
}: {
  item: { slug: string; titleMr: string; titleEn?: string; kind: 'pdf' | 'audio' };
}) {
  const t = useT();
  const { primary, secondary } = useTitles(item);

  return (
    <Link href={`/work/${item.slug}`} asChild>
      <Pressable style={styles.row} accessibilityRole="button" accessibilityLabel={primary}>
        <Feather
          name={item.kind === 'audio' ? 'headphones' : 'book-open'}
          size={16}
          color={colors.inkSoft}
          style={styles.icon}
        />
        <View style={styles.text}>
          <Text style={type.eyebrow}>{t(kindKey(item.kind))}</Text>
          <Text style={type.workTitle} numberOfLines={2}>
            {primary}
          </Text>
          {secondary ? (
            <Text style={type.meta} numberOfLines={1}>
              {secondary}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </Link>
  );
}

export default function SavedScreen() {
  const t = useT();
  const saved = useSavedWorks();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader
        title={t('tab.saved')}
        subtitle={saved.length ? t('saved.count', { count: saved.length }) : undefined}
      />

      <FlatList
        data={saved}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={[styles.listContent, saved.length === 0 && styles.emptyContainer]}
        renderItem={({ item }) => <SavedRow item={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={type.body}>{t('saved.empty')}</Text>
            <Text style={type.meta}>{t('saved.emptyHint')}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  row: {
    flexDirection: 'row',
    gap: space.md,
    paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rule,
  },
  icon: { paddingTop: 18 },
  text: { flex: 1 },
  listContent: { paddingHorizontal: space.xl },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
  empty: { alignItems: 'center', gap: space.sm, padding: space.xl },
});
