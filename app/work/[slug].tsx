import { Feather } from '@expo/vector-icons';
import { File } from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FacetType } from '../../src/api/client';
import { useWork } from '../../src/api/hooks';
import AudioPlayer from '../../src/components/AudioPlayer';
import BrandLoader from '../../src/components/BrandLoader';
import DownloadButton from '../../src/components/DownloadButton';
import { kindKey, useT, useTitles } from '../../src/i18n';
import { portraitForWork } from '../../src/lib/brand';
import { formatBytes, usePlayableUri } from '../../src/lib/downloads';
import { toggleSaved, useIsSaved } from '../../src/lib/saved';
import { colors, radius, space, type } from '../../src/theme';

type PreviewableFile = File & {
  preview?: (options?: { title?: string; mimeType?: string }) => Promise<void>;
};

export default function WorkScreen() {
  const t = useT();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { data: work, isLoading, isError, refetch } = useWork(slug);
  const saved = useIsSaved(slug);
  const { primary, secondary } = useTitles(work);

  // A downloaded copy wins over the network every time.
  const playable = usePlayableUri(slug, work?.url);
  const isLocal = Boolean(playable && playable !== work?.url);

  const facetLabel = (facet: FacetType) => t(`filter.${facet}`);

  const openPdf = async () => {
    if (!playable) return;

    // A local file opens through the platform preview (Quick Look on iOS),
    // which works with no connection at all.
    if (isLocal) {
      try {
        const file = new File(playable) as PreviewableFile;
        if (typeof file.preview === 'function') {
          await file.preview({ title: primary, mimeType: 'application/pdf' });
          return;
        }
        await Linking.openURL(playable);
        return;
      } catch {
        // Fall through to the browser on the remote copy.
      }
    }

    const remote = work?.url;
    if (!remote) return;
    try {
      await WebBrowser.openBrowserAsync(remote, {
        toolbarColor: colors.paper,
        controlsColor: colors.saffron,
      });
    } catch {
      Linking.openURL(remote).catch(() => {});
    }
  };

  const author = work?.facets.find((facet) => facet.type === 'author')?.value;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.bar}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('work.back')}>
          <Feather name="chevron-left" size={26} color={colors.ink} />
        </Pressable>

        <View style={styles.barRight}>
          {work && (
            <Pressable
              onPress={() => toggleSaved(work)}
              hitSlop={12}
              accessibilityLabel={saved ? t('work.unsave') : t('work.save')}
            >
              <Feather name="bookmark" size={22} color={saved ? colors.saffron : colors.ink} />
            </Pressable>
          )}
          {work?.url && (
            <Pressable
              onPress={() => Share.share({ message: `${primary}\n${work.url}` })}
              hitSlop={12}
              accessibilityLabel={t('work.share')}
            >
              <Feather name="share-2" size={20} color={colors.ink} />
            </Pressable>
          )}
        </View>
      </View>

      {isLoading && <BrandLoader />}

      {isError && (
        <View style={styles.centre}>
          <Text style={type.body}>{t('work.error')}</Text>
          <Pressable onPress={() => refetch()} style={styles.primary}>
            <Text style={[type.button, { color: colors.card }]}>{t('browse.retry')}</Text>
          </Pressable>
        </View>
      )}

      {work && (
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.content}>
            <View style={styles.eyebrowRow}>
              <Text style={type.eyebrow}>{t(kindKey(work.kind))}</Text>
              {isLocal && (
                <View style={styles.offlineTag}>
                  <Feather name="check" size={11} color={colors.saffron} />
                  <Text style={[type.eyebrow, styles.offlineText]}>{t('download.offline')}</Text>
                </View>
              )}
            </View>
            <Text style={type.workTitleLarge}>{primary}</Text>
            {secondary ? <Text style={[type.meta, styles.titleEn]}>{secondary}</Text> : null}

            {playable ? (
              work.kind === 'audio' ? (
                <View style={styles.player}>
                  <AudioPlayer
                    slug={work.slug}
                    uri={playable}
                    title={primary}
                    artist={author}
                    portrait={portraitForWork(work)}
                  />
                </View>
              ) : (
                <Pressable onPress={openPdf} style={[styles.primary, styles.readButton]}>
                  <Feather name="book-open" size={18} color={colors.card} />
                  <Text style={[type.button, { color: colors.card }]}>{t('work.read')}</Text>
                </Pressable>
              )
            ) : (
              <Text style={[type.meta, styles.missing]}>{t('work.unavailable')}</Text>
            )}

            <View style={styles.downloadRow}>
              <DownloadButton work={work} />
            </View>

            {work.facets.length > 0 && (
              <View style={styles.meta}>
                {work.facets.map((facet) => (
                  <View key={`${facet.type}-${facet.slug ?? facet.value}`} style={styles.metaRow}>
                    <Text style={[type.eyebrow, styles.metaKey]}>{facetLabel(facet.type)}</Text>
                    <Text style={type.body}>{facet.value}</Text>
                  </View>
                ))}
                {work.sizeBytes ? (
                  <View style={styles.metaRow}>
                    <Text style={[type.eyebrow, styles.metaKey]}>{t('work.size')}</Text>
                    <Text style={type.body}>{formatBytes(work.sizeBytes)}</Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    paddingVertical: space.sm,
  },
  barRight: { flexDirection: 'row', alignItems: 'center', gap: space.lg, paddingRight: space.xs },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md },
  body: { paddingBottom: space.xxl },
  content: { paddingHorizontal: space.xl, paddingTop: space.sm, gap: space.sm },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  offlineTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 2,
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.saffronWash,
  },
  offlineText: { color: colors.saffron },
  titleEn: { marginTop: 2 },
  player: { marginTop: space.lg },
  primary: {
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readButton: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
  downloadRow: { marginTop: space.md },
  missing: { marginTop: space.lg, color: colors.danger },
  meta: {
    marginTop: space.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.rule,
    paddingTop: space.md,
    gap: space.md,
  },
  metaRow: { flexDirection: 'row', alignItems: 'baseline', gap: space.md },
  metaKey: { width: 56 },
});
