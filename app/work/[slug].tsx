import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWork } from '../../src/api/hooks';
import AudioPlayer from '../../src/components/AudioPlayer';
import { toggleSaved, useIsSaved } from '../../src/lib/saved';
import { colors, kindLabel, radius, space, type } from '../../src/theme';

const FACET_LABEL = { subject: 'विषय', author: 'लेखक', language: 'भाषा' } as const;

function formatSize(bytes?: number) {
  if (!bytes) return undefined;
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export default function WorkScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { data: work, isLoading, isError, refetch } = useWork(slug);
  const saved = useIsSaved(slug);

  const openPdf = async () => {
    if (!work?.url) return;
    try {
      await WebBrowser.openBrowserAsync(work.url, {
        toolbarColor: colors.paper,
        controlsColor: colors.saffron,
      });
    } catch {
      Linking.openURL(work.url).catch(() => {});
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.bar}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="मागे">
          <Feather name="chevron-left" size={26} color={colors.ink} />
        </Pressable>

        <View style={styles.barRight}>
          {work && (
            <Pressable
              onPress={() => toggleSaved(work)}
              hitSlop={12}
              accessibilityLabel={saved ? 'यादीतून काढा' : 'यादीत ठेवा'}
            >
              <Feather
                name="bookmark"
                size={22}
                color={saved ? colors.saffron : colors.ink}
              />
            </Pressable>
          )}
          {work?.url && (
            <Pressable
              onPress={() => Share.share({ message: `${work.titleMr}\n${work.url}` })}
              hitSlop={12}
              accessibilityLabel="पाठवा"
            >
              <Feather name="share-2" size={20} color={colors.ink} />
            </Pressable>
          )}
        </View>
      </View>

      {isLoading && <ActivityIndicator style={styles.centre} color={colors.saffron} />}

      {isError && (
        <View style={styles.centre}>
          <Text style={type.body}>ही साहित्यकृती उघडता आली नाही.</Text>
          <Pressable onPress={() => refetch()} style={styles.primary}>
            <Text style={[type.button, { color: colors.card }]}>पुन्हा प्रयत्न करा</Text>
          </Pressable>
        </View>
      )}

      {work && (
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={type.eyebrow}>{kindLabel[work.kind]}</Text>
          <Text style={type.workTitleLarge}>{work.titleMr}</Text>
          {work.titleEn ? <Text style={[type.meta, styles.titleEn]}>{work.titleEn}</Text> : null}

          {work.url ? (
            work.kind === 'audio' ? (
              <View style={styles.player}>
                <AudioPlayer
                  uri={work.url}
                  title={work.titleMr}
                  artist={work.facets.find((facet) => facet.type === 'author')?.value}
                />
              </View>
            ) : (
              <Pressable onPress={openPdf} style={[styles.primary, styles.readButton]}>
                <Feather name="book-open" size={18} color={colors.card} />
                <Text style={[type.button, { color: colors.card }]}>वाचा</Text>
              </Pressable>
            )
          ) : (
            <Text style={[type.meta, styles.missing]}>ही फाईल सध्या उपलब्ध नाही.</Text>
          )}

          {work.facets.length > 0 && (
            <View style={styles.meta}>
              {work.facets.map((facet) => (
                <View key={`${facet.type}-${facet.value}`} style={styles.metaRow}>
                  <Text style={[type.eyebrow, styles.metaKey]}>{FACET_LABEL[facet.type]}</Text>
                  <Text style={type.body}>{facet.value}</Text>
                </View>
              ))}
              {formatSize(work.sizeBytes) && (
                <View style={styles.metaRow}>
                  <Text style={[type.eyebrow, styles.metaKey]}>आकार</Text>
                  <Text style={type.body}>{formatSize(work.sizeBytes)}</Text>
                </View>
              )}
            </View>
          )}
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
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  barRight: { flexDirection: 'row', alignItems: 'center', gap: space.lg, paddingRight: space.sm },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md },
  body: { padding: space.lg, paddingBottom: space.xxl, gap: space.sm },
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
