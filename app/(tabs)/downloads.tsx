import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WorkKind } from '../../src/api/client';
import ScreenHeader from '../../src/components/ScreenHeader';
import { kindKey, useT, useTitles } from '../../src/i18n';
import {
  DownloadRecord,
  formatBytes,
  removeAllDownloads,
  removeDownload,
  useDownloads,
} from '../../src/lib/downloads';
import { colors, radius, space, type } from '../../src/theme';

function Row({ record }: { record: DownloadRecord }) {
  const t = useT();
  const titles = useTitles(record);

  return (
    <View style={styles.row}>
      <Link href={`/work/${record.slug}`} asChild>
        <Pressable style={styles.rowMain} accessibilityRole="button" accessibilityLabel={titles.primary}>
          <Feather
            name={record.kind === 'audio' ? 'headphones' : 'book-open'}
            size={16}
            color={colors.inkSoft}
            style={styles.icon}
          />
          <View style={styles.text}>
            <Text style={type.eyebrow}>{t(kindKey(record.kind))}</Text>
            <Text style={type.workTitle} numberOfLines={2}>
              {titles.primary}
            </Text>
            <Text style={type.meta}>{formatBytes(record.bytes)}</Text>
          </View>
        </Pressable>
      </Link>

      <Pressable
        hitSlop={10}
        style={styles.delete}
        accessibilityLabel={t('download.remove')}
        onPress={() =>
          Alert.alert(t('download.removeTitle'), t('download.removeBody'), [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('download.remove'),
              style: 'destructive',
              onPress: () => removeDownload(record.slug),
            },
          ])
        }
      >
        <Feather name="trash-2" size={17} color={colors.inkFaint} />
      </Pressable>
    </View>
  );
}

const KIND_FILTERS: WorkKind[] = ['pdf', 'audio'];

export default function DownloadsScreen() {
  const t = useT();
  const records = useDownloads();
  const [kind, setKind] = useState<WorkKind | undefined>();

  const visible = useMemo(
    () => (kind ? records.filter((record) => record.kind === kind) : records),
    [records, kind]
  );
  const total = useMemo(
    () => visible.reduce((sum, record) => sum + record.bytes, 0),
    [visible]
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader
        title={t('tab.downloads')}
        subtitle={
          records.length
            ? t('download.summary', { count: visible.length, size: formatBytes(total) })
            : undefined
        }
        right={
          records.length > 0 ? (
            <Pressable
              hitSlop={10}
              onPress={() =>
                Alert.alert(t('download.clearTitle'), t('download.clearBody'), [
                  { text: t('common.cancel'), style: 'cancel' },
                  {
                    text: t('download.clear'),
                    style: 'destructive',
                    onPress: () => removeAllDownloads(),
                  },
                ])
              }
            >
              <Text style={[type.meta, styles.clear]}>{t('download.clear')}</Text>
            </Pressable>
          ) : undefined
        }
      />

      {records.length > 0 && (
        <View style={styles.kindRow}>
          {KIND_FILTERS.map((option) => {
            const selected = kind === option;
            return (
              <Pressable
                key={option}
                onPress={() => setKind(selected ? undefined : option)}
                style={[styles.kindChip, selected && styles.kindChipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={t(kindKey(option))}
              >
                <Text style={[type.meta, styles.kindText, selected && styles.kindTextActive]}>
                  {t(kindKey(option))}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <FlatList
        data={visible}
        keyExtractor={(record) => record.slug}
        renderItem={({ item }) => <Row record={item} />}
        contentContainerStyle={[styles.listContent, visible.length === 0 && styles.emptyContainer]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="download-cloud" size={28} color={colors.inkFaint} />
            <Text style={type.body}>{kind ? t('download.emptyKind') : t('download.empty')}</Text>
            {!kind && <Text style={[type.meta, styles.emptyHint]}>{t('download.emptyHint')}</Text>}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  listContent: { paddingHorizontal: space.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rule,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    gap: space.md,
    paddingVertical: space.md,
  },
  icon: { paddingTop: 18 },
  text: { flex: 1, gap: 2 },
  delete: { padding: space.md, marginRight: -space.sm },
  clear: { color: colors.danger },
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
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
  empty: { alignItems: 'center', gap: space.sm, padding: space.xl },
  emptyHint: { textAlign: 'center' },
});
