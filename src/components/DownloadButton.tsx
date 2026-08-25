import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Work } from '../api/client';
import { useT } from '../i18n';
import { downloadWork, removeDownload, useDownloadStatus } from '../lib/downloads';
import { colors, radius, space, type } from '../theme';

export default function DownloadButton({ work }: { work: Work }) {
  const t = useT();
  const status = useDownloadStatus(work.slug);

  if (!work.url) return null;

  if (status.status === 'downloading') {
    const percent = status.progress >= 0 ? Math.round(status.progress * 100) : undefined;
    return (
      <View style={styles.button}>
        <ActivityIndicator size="small" color={colors.saffron} />
        <Text style={[type.meta, styles.label]}>
          {percent !== undefined ? `${percent}%` : t('download.inProgress')}
        </Text>
      </View>
    );
  }

  if (status.status === 'done') {
    return (
      <Pressable
        style={[styles.button, styles.done]}
        onPress={() =>
          Alert.alert(t('download.removeTitle'), t('download.removeBody'), [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('download.remove'),
              style: 'destructive',
              onPress: () => removeDownload(work.slug),
            },
          ])
        }
        accessibilityRole="button"
        accessibilityLabel={t('download.remove')}
      >
        <Feather name="check-circle" size={16} color={colors.saffron} />
        <Text style={[type.meta, styles.label, styles.labelDone]}>{t('download.onDevice')}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={styles.button}
      onPress={() => downloadWork(work)}
      accessibilityRole="button"
      accessibilityLabel={t('download.action')}
    >
      <Feather
        name={status.status === 'error' ? 'alert-circle' : 'download'}
        size={16}
        color={status.status === 'error' ? colors.danger : colors.ink}
      />
      <Text style={[type.meta, styles.label]}>
        {status.status === 'error' ? t('download.retry') : t('download.action')}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.card,
  },
  done: { borderColor: colors.saffron, backgroundColor: colors.saffronWash },
  label: { color: colors.ink },
  labelDone: { color: colors.saffron },
});
