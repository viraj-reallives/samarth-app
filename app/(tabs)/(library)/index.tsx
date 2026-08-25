import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FacetType } from '../../../src/api/client';
import { useFacets } from '../../../src/api/hooks';
import BrandLoader from '../../../src/components/BrandLoader';
import LanguageMenu from '../../../src/components/LanguageMenu';
import PathCard from '../../../src/components/PathCard';
import ScreenHeader from '../../../src/components/ScreenHeader';
import SearchBar from '../../../src/components/SearchBar';
import WorkList from '../../../src/components/WorkList';
import { useT } from '../../../src/i18n';
import { StringKey } from '../../../src/i18n/strings';
import { PATH_CARD_IMAGES } from '../../../src/lib/brand';
import { useDebounced } from '../../../src/lib/useDebounced';
import { colors, radius, space, type } from '../../../src/theme';

const PATHS: { facet: FacetType; title: StringKey }[] = [
  { facet: 'subject', title: 'home.path.subject' },
  { facet: 'author', title: 'home.path.author' },
  { facet: 'language', title: 'home.path.language' },
];

export default function LibraryHome() {
  const t = useT();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const debounced = useDebounced(query.trim());
  const searching = query.trim().length > 0;
  const facets = useFacets();
  const popular = facets.data?.subject.slice(0, 6) ?? [];

  const hints = useMemo(() => {
    const data = facets.data;
    return {
      subject: data?.subject.slice(0, 3).map((option) => option.value).join(', '),
      author: data?.author.slice(0, 2).map((option) => option.value).join(', '),
      language: data?.language.slice(0, 3).map((option) => option.value).join(', '),
    };
  }, [facets.data]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <ScreenHeader
          title={t('tab.browse')}
          subtitle={t('browse.subtitle')}
          right={<LanguageMenu />}
        />
      </View>
      <SearchBar value={query} onChangeText={setQuery} placeholder={t('browse.search')} />

      {searching ? (
        debounced ? (
          <WorkList filters={{ q: debounced }} />
        ) : (
          <BrandLoader compact />
        )
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[type.eyebrow, styles.section]}>{t('home.choose')}</Text>
          <View style={styles.paths}>
            {PATHS.map((path) => (
              <PathCard
                key={path.facet}
                title={t(path.title)}
                hint={hints[path.facet]}
                image={PATH_CARD_IMAGES[path.facet]}
                onPress={() =>
                  router.push({ pathname: '/browse/[facet]', params: { facet: path.facet } })
                }
              />
            ))}
          </View>

          {popular.length > 0 ? (
            <View>
              <Text style={[type.eyebrow, styles.section, styles.popularLabel]}>{t('home.popular')}</Text>
              <View style={styles.chips}>
                {popular.map((option) => (
                  <Pressable
                    key={option.slug}
                    onPress={() =>
                      router.push({ pathname: '/works', params: { subject: option.slug } })
                    }
                    style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
                    accessibilityRole="button"
                    accessibilityLabel={option.value}
                  >
                    <Text style={[type.meta, styles.chipText]}>{option.value}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  header: { zIndex: 20, elevation: 8 },
  scroll: { flex: 1 },
  body: { paddingHorizontal: space.xl, paddingBottom: space.xxl },
  section: { marginBottom: space.md },
  popularLabel: { marginTop: space.xl },
  paths: { gap: space.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.card,
  },
  chipPressed: { backgroundColor: colors.saffronWash, borderColor: colors.saffron },
  chipText: { color: colors.ink },
});
