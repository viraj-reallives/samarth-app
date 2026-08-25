import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Work } from '../api/client';
import { kindKey, useT, useTitles } from '../i18n';
import { useDownloadStatus } from '../lib/downloads';
import { useProgressFraction } from '../lib/playback';
import { colors, space, type } from '../theme';

export default function WorkRow({ work }: { work: Work }) {
  const t = useT();
  const { primary, secondary } = useTitles(work);
  const author = work.facets.find((facet) => facet.type === 'author')?.value;
  const meta = author ?? secondary;
  const progress = useProgressFraction(work.kind === 'audio' ? work.slug : undefined);
  const download = useDownloadStatus(work.slug);
  const offline = download.status === 'done';

  return (
    <Link href={`/work/${work.slug}`} asChild>
      <Pressable
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        accessibilityRole="button"
        accessibilityLabel={primary}
      >
        <View style={styles.mark}>
          <Feather
            name={work.kind === 'audio' ? 'headphones' : 'book-open'}
            size={16}
            color={colors.inkSoft}
          />
        </View>

        <View style={styles.text}>
          <View style={styles.eyebrowRow}>
            <Text style={type.eyebrow}>{t(kindKey(work.kind))}</Text>
            {offline ? <View style={styles.offlineDot} /> : null}
          </View>

          <Text style={[type.workTitle, styles.title]} numberOfLines={2}>
            {primary}
          </Text>

          {meta ? (
            <Text style={type.meta} numberOfLines={1}>
              {meta}
            </Text>
          ) : null}

          {progress !== undefined && progress > 0 ? (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
          ) : null}
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rule,
    backgroundColor: colors.paper,
  },
  rowPressed: { backgroundColor: colors.saffronWash },
  mark: { paddingTop: 18 },
  text: { flex: 1 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  offlineDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.saffron },
  title: { marginTop: 2, marginBottom: 2 },
  progressTrack: {
    height: 2,
    marginTop: space.sm,
    borderRadius: 1,
    backgroundColor: colors.rule,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.saffron },
});
