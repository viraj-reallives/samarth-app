import { useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { BrowseFilters, Work } from '../api/client';
import { useBrowse } from '../api/hooks';
import { useT } from '../i18n';
import { colors, radius, space, type } from '../theme';
import BrandLoader from './BrandLoader';
import WorkRow from './WorkRow';

function matchesQuery(work: Work, needle: string) {
  return [work.titleMr, work.titleEn ?? '', ...work.facets.map((facet) => facet.value)]
    .join(' ')
    .toLowerCase()
    .includes(needle);
}

export default function WorkList({
  filters,
  enabled = true,
  ListHeaderComponent,
}: {
  filters: BrowseFilters;
  enabled?: boolean;
  ListHeaderComponent?: React.ComponentProps<typeof FlatList>['ListHeaderComponent'];
}) {
  const t = useT();
  const browse = useBrowse(filters, enabled);
  const items = useMemo(() => {
    const loaded = browse.data?.pages.flatMap((page) => page.items) ?? [];
    const needle = filters.q?.trim().toLowerCase();
    if (!needle) return loaded;
    // Match both titles (and facet labels) regardless of interface language.
    return loaded.filter((work) => matchesQuery(work, needle));
  }, [browse.data, filters.q]);

  return (
    <FlatList
      data={items}
      style={styles.list}
      keyExtractor={(work) => work.slug}
      renderItem={({ item }) => <WorkRow work={item} />}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      onEndReachedThreshold={0.6}
      onEndReached={() => {
        if (browse.hasNextPage && !browse.isFetchingNextPage) browse.fetchNextPage();
      }}
      refreshing={browse.isRefetching && !browse.isFetchingNextPage}
      onRefresh={() => browse.refetch()}
      contentContainerStyle={[styles.listContent, items.length === 0 && styles.emptyContainer]}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        browse.isLoading || (browse.isFetching && items.length === 0) ? (
          <BrandLoader compact />
        ) : browse.isError ? (
          <View style={styles.empty}>
            <Text style={type.body}>{t('browse.error')}</Text>
            <Pressable onPress={() => browse.refetch()} style={styles.retry}>
              <Text style={[type.button, { color: colors.card }]}>{t('browse.retry')}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={type.body}>{t('browse.empty')}</Text>
          </View>
        )
      }
      ListFooterComponent={
        browse.isFetchingNextPage ? (
          <ActivityIndicator style={styles.footer} color={colors.saffron} />
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  listContent: { paddingHorizontal: space.xl },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
  empty: { alignItems: 'center', gap: space.md, padding: space.xl },
  retry: {
    paddingVertical: space.sm,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    backgroundColor: colors.ink,
  },
  footer: { paddingVertical: space.lg },
});
