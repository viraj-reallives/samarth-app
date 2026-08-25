import { Feather } from '@expo/vector-icons';
import { useDeferredValue, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrowseFilters, Work } from '../../src/api/client';
import { useBrowse, useFacets } from '../../src/api/hooks';
import FilterSheet from '../../src/components/FilterSheet';
import ScreenHeader from '../../src/components/ScreenHeader';
import WorkRow from '../../src/components/WorkRow';
import { colors, kindLabel, radius, space, type } from '../../src/theme';

export default function BrowseScreen() {
  const [filters, setFilters] = useState<BrowseFilters>({});
  const [sheetOpen, setSheetOpen] = useState(false);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const facets = useFacets();
  const browse = useBrowse(filters);

  const items = useMemo<Work[]>(
    () => browse.data?.pages.flatMap((page) => page.items) ?? [],
    [browse.data]
  );

  // Local search across everything loaded so far. To search the full corpus
  // server-side, add a `q` parameter to /api/browse and pass it in the filters.
  const visible = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((work) =>
      [work.titleMr, work.titleEn ?? '', ...work.facets.map((facet) => facet.value)]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    );
  }, [items, deferredQuery]);

  const activeFilters = (['subject', 'author', 'language'] as const)
    .map((key) => ({ key, value: filters[key] }))
    .filter((entry): entry is { key: 'subject' | 'author' | 'language'; value: string } =>
      Boolean(entry.value)
    );
  const filterCount = activeFilters.length + (filters.kind ? 1 : 0);

  const total = browse.data?.pages[0]?.total;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader
        title="ग्रंथसंग्रह"
        subtitle={total ? `${total} साहित्यकृती` : 'श्री रामदासांचे साहित्य'}
        right={
          <Pressable
            onPress={() => setSheetOpen(true)}
            style={styles.filterButton}
            accessibilityRole="button"
            accessibilityLabel="शोध मर्यादित करा"
          >
            <Feather name="sliders" size={16} color={filterCount ? colors.saffron : colors.ink} />
            {filterCount > 0 && <Text style={styles.filterCount}>{filterCount}</Text>}
          </Pressable>
        }
      />

      <View style={styles.searchWrap}>
        <Feather name="search" size={16} color={colors.inkFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="शीर्षक किंवा लेखक शोधा"
          placeholderTextColor={colors.inkFaint}
          style={styles.searchInput}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {(filterCount > 0 || false) && (
        <View style={styles.activeRow}>
          {filters.kind && (
            <Pressable
              onPress={() => setFilters({ ...filters, kind: undefined })}
              style={styles.activeChip}
            >
              <Text style={styles.activeChipText}>{kindLabel[filters.kind]}</Text>
              <Feather name="x" size={12} color={colors.saffron} />
            </Pressable>
          )}
          {activeFilters.map((entry) => (
            <Pressable
              key={entry.key}
              onPress={() => setFilters({ ...filters, [entry.key]: undefined })}
              style={styles.activeChip}
            >
              <Text style={styles.activeChipText}>{entry.value}</Text>
              <Feather name="x" size={12} color={colors.saffron} />
            </Pressable>
          ))}
        </View>
      )}

      <FlatList
        data={visible}
        keyExtractor={(work) => work.slug}
        renderItem={({ item }) => <WorkRow work={item} />}
        onEndReachedThreshold={0.6}
        onEndReached={() => {
          if (browse.hasNextPage && !browse.isFetchingNextPage) browse.fetchNextPage();
        }}
        refreshing={browse.isRefetching}
        onRefresh={() => browse.refetch()}
        contentContainerStyle={visible.length === 0 && styles.emptyContainer}
        ListEmptyComponent={
          browse.isLoading ? (
            <ActivityIndicator color={colors.saffron} />
          ) : browse.isError ? (
            <View style={styles.empty}>
              <Text style={type.body}>ग्रंथसंग्रह उघडता आला नाही.</Text>
              <Pressable onPress={() => browse.refetch()} style={styles.retry}>
                <Text style={[type.button, { color: colors.card }]}>पुन्हा प्रयत्न करा</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={type.body}>या शोधाशी जुळणारे काही सापडले नाही.</Text>
            </View>
          )
        }
        ListFooterComponent={
          browse.isFetchingNextPage ? (
            <ActivityIndicator style={styles.footer} color={colors.saffron} />
          ) : null
        }
      />

      <FilterSheet
        visible={sheetOpen}
        facets={facets.data}
        filters={filters}
        onChange={setFilters}
        onClose={() => setSheetOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.card,
  },
  filterCount: { ...type.meta, color: colors.saffron },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginHorizontal: space.lg,
    marginBottom: space.md,
    paddingHorizontal: space.md,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  searchInput: { flex: 1, ...type.body, paddingVertical: 0 },
  activeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    backgroundColor: colors.saffronWash,
  },
  activeChipText: { ...type.meta, color: colors.saffron },
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
