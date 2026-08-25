import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FacetOption, FacetType, isFacetType } from '../../../../src/api/client';
import { useFacets } from '../../../../src/api/hooks';
import BrandLoader from '../../../../src/components/BrandLoader';
import ScreenHeader from '../../../../src/components/ScreenHeader';
import SearchBar from '../../../../src/components/SearchBar';
import { useLang, useT } from '../../../../src/i18n';
import { StringKey } from '../../../../src/i18n/strings';
import { authorPortrait } from '../../../../src/lib/brand';
import { colors, radius, space, type } from '../../../../src/theme';

const TITLE: Record<FacetType, StringKey> = {
  subject: 'home.path.subject',
  author: 'home.path.author',
  language: 'home.path.language',
};

function AuthorAvatar({ source }: { source?: ImageSourcePropType }) {
  if (source) {
    return (
      <View style={styles.avatarWrap}>
        <Image source={source} style={styles.avatar} resizeMode="cover" />
      </View>
    );
  }

  return (
    <View style={[styles.avatarWrap, styles.avatarFallback]} accessibilityIgnoresInvertColors>
      <Feather name="user" size={36} color={colors.saffron} />
    </View>
  );
}

function AuthorCard({
  option,
  width,
  onPress,
}: {
  option: FacetOption;
  width: number;
  onPress: () => void;
}) {
  useLang();
  const portrait = authorPortrait(option.slug) ?? authorPortrait(option.value);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={option.value}
      style={({ pressed }) => [styles.card, { width }, pressed && styles.cardPressed]}
    >
      <AuthorAvatar source={portrait} />
      <Text style={[type.workTitle, styles.cardName]} numberOfLines={2}>
        {option.value}
      </Text>
      <Text style={[type.meta, styles.cardCount]}>{option.count}</Text>
    </Pressable>
  );
}

export default function FacetPickerScreen() {
  const t = useT();
  const router = useRouter();
  const { facet: raw } = useLocalSearchParams<{ facet: string }>();
  const facet = isFacetType(raw) ? raw : undefined;
  const [query, setQuery] = useState('');
  const facets = useFacets();
  const isAuthorGrid = facet === 'author';
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = (windowWidth - space.xl * 2 - space.md) / 2;

  const options = useMemo(() => {
    if (!facet) return [];
    const all = facets.data?.[facet] ?? [];
    const needle = query.trim().toLowerCase();
    if (!needle) return all;
    return all.filter(
      (option) =>
        option.value.toLowerCase().includes(needle) || option.slug.toLowerCase().includes(needle)
    );
  }, [facet, facets.data, query]);

  if (!facet) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScreenHeader title={t('tab.browse')} onBack={() => router.back()} backLabel={t('work.back')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader
        title={t(TITLE[facet])}
        onBack={() => router.back()}
        backLabel={t('work.back')}
      />
      <SearchBar value={query} onChangeText={setQuery} placeholder={t('facet.search')} />

      <FlatList
        key={facet}
        data={options}
        keyExtractor={(option) => option.slug}
        numColumns={isAuthorGrid ? 2 : 1}
        style={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        columnWrapperStyle={isAuthorGrid ? styles.cardRow : undefined}
        contentContainerStyle={[
          isAuthorGrid ? styles.grid : undefined,
          options.length === 0 && styles.emptyContainer,
        ]}
        renderItem={({ item }) =>
          isAuthorGrid ? (
            <AuthorCard
              option={item}
              width={cardWidth}
              onPress={() => router.push({ pathname: '/works', params: { author: item.slug } })}
            />
          ) : (
            <Pressable
              onPress={() => router.push({ pathname: '/works', params: { [facet]: item.slug } })}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              accessibilityRole="button"
              accessibilityLabel={item.value}
            >
              <View style={styles.rowText}>
                <Text style={type.workTitle}>{item.value}</Text>
              </View>
              <Text style={[type.meta, styles.count]}>{item.count}</Text>
              <Feather name="chevron-right" size={18} color={colors.inkFaint} />
            </Pressable>
          )
        }
        ListEmptyComponent={
          facets.isLoading ? (
            <BrandLoader compact />
          ) : facets.isError ? (
            <View style={styles.empty}>
              <Text style={type.body}>{t('browse.error')}</Text>
              <Pressable onPress={() => facets.refetch()} style={styles.retry}>
                <Text style={[type.button, { color: colors.card }]}>{t('browse.retry')}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={type.body}>{t('facet.empty')}</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  list: { flex: 1 },
  grid: { paddingHorizontal: space.xl, paddingBottom: space.xl },
  cardRow: { gap: space.md, marginBottom: space.md },
  card: {
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.lg,
    paddingHorizontal: space.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  cardPressed: { backgroundColor: colors.saffronWash },
  avatarWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    overflow: 'hidden',
    backgroundColor: colors.saffronWash,
    marginBottom: space.xs,
  },
  avatar: { width: '100%', height: '100%' },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  cardName: { fontSize: 16, lineHeight: 24, textAlign: 'center' },
  cardCount: { color: colors.inkFaint },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.md,
    paddingHorizontal: space.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rule,
  },
  rowPressed: { backgroundColor: colors.saffronWash },
  rowText: { flex: 1 },
  count: { color: colors.inkFaint, minWidth: 28, textAlign: 'right' },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
  empty: { alignItems: 'center', gap: space.md, padding: space.xl },
  retry: {
    paddingVertical: space.sm,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    backgroundColor: colors.ink,
  },
});
