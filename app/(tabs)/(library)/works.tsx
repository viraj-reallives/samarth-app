import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrowseFilters, FacetType, labelForFacet } from '../../../src/api/client';
import { useBrowse, useFacets } from '../../../src/api/hooks';
import FilterSheet from '../../../src/components/FilterSheet';
import ScreenHeader from '../../../src/components/ScreenHeader';
import SearchBar from '../../../src/components/SearchBar';
import WorkList from '../../../src/components/WorkList';
import { kindKey, useT } from '../../../src/i18n';
import { useDebounced } from '../../../src/lib/useDebounced';
import { colors, radius, space, type } from '../../../src/theme';

function one(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function WorksScreen() {
  const t = useT();
  const router = useRouter();
  const params = useLocalSearchParams<{
    subject?: string | string[];
    author?: string | string[];
    language?: string | string[];
  }>();
  const facets = useFacets();

  const [filters, setFilters] = useState<BrowseFilters>({
    subject: one(params.subject),
    author: one(params.author),
    language: one(params.language),
  });
  const [query, setQuery] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const debounced = useDebounced(query.trim());

  useEffect(() => {
    setFilters({
      subject: one(params.subject),
      author: one(params.author),
      language: one(params.language),
    });
  }, [params.subject, params.author, params.language]);

  const combined: BrowseFilters = {
    ...filters,
    q: debounced || undefined,
  };

  const browse = useBrowse(combined);
  const total = browse.data?.pages[0]?.total;
  const filterCount =
    (filters.subject ? 1 : 0) +
    (filters.author ? 1 : 0) +
    (filters.language ? 1 : 0) +
    (filters.kind ? 1 : 0);

  const title =
    labelForFacet(facets.data, 'subject', filters.subject) ??
    labelForFacet(facets.data, 'author', filters.author) ??
    labelForFacet(facets.data, 'language', filters.language) ??
    t('tab.browse');

  const active = useMemo(() => {
    const entries: { key: FacetType; slug: string; label: string }[] = [];
    (['subject', 'author', 'language'] as const).forEach((key) => {
      const slug = filters[key];
      if (!slug) return;
      entries.push({ key, slug, label: labelForFacet(facets.data, key, slug) ?? slug });
    });
    return entries;
  }, [facets.data, filters]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader
        title={title}
        subtitle={total != null ? t('browse.count', { count: total }) : undefined}
        onBack={() => router.back()}
        backLabel={t('work.back')}
        right={
          <Pressable
            onPress={() => setSheetOpen(true)}
            style={styles.filterButton}
            accessibilityRole="button"
            accessibilityLabel={t('filter.open')}
          >
            <Feather name="sliders" size={16} color={filterCount ? colors.saffron : colors.ink} />
            {filterCount > 0 && <Text style={[type.meta, styles.filterCount]}>{filterCount}</Text>}
          </Pressable>
        }
      />

      <SearchBar value={query} onChangeText={setQuery} placeholder={t('works.narrow')} />

      <View style={styles.kindRow}>
        {([undefined, 'pdf', 'audio'] as const).map((kind) => {
          const selected = filters.kind === kind;
          const label = kind ? t(kindKey(kind)) : t('works.kindAll');
          return (
            <Pressable
              key={label}
              onPress={() => setFilters({ ...filters, kind })}
              style={[styles.kindChip, selected && styles.kindChipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[type.meta, styles.kindText, selected && styles.kindTextActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {active.length > 0 && (
        <View style={styles.activeRow}>
          {active.map((entry) => (
            <Pressable
              key={entry.key}
              onPress={() => setFilters({ ...filters, [entry.key]: undefined })}
              style={styles.activeChip}
            >
              <Text style={[type.meta, styles.activeChipText]}>{entry.label}</Text>
              <Feather name="x" size={12} color={colors.saffron} />
            </Pressable>
          ))}
        </View>
      )}

      <WorkList filters={combined} />

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
  filterCount: { color: colors.saffron },
  kindRow: {
    flexDirection: 'row',
    gap: space.sm,
    paddingHorizontal: space.xl,
    paddingBottom: space.md,
  },
  kindChip: {
    paddingVertical: 6,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.card,
  },
  kindChipActive: { borderColor: colors.saffron, backgroundColor: colors.saffronWash },
  kindText: { color: colors.ink },
  kindTextActive: { color: colors.saffron },
  activeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    paddingHorizontal: space.xl,
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
  activeChipText: { color: colors.saffron },
});
