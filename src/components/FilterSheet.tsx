import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrowseFilters, FacetType, Facets, WorkKind } from '../api/client';
import { colors, kindLabel, radius, space, type } from '../theme';

const SECTION_LABEL: Record<FacetType, string> = {
  subject: 'विषय',
  author: 'लेखक',
  language: 'भाषा',
};

type Props = {
  visible: boolean;
  facets?: Facets;
  filters: BrowseFilters;
  onChange: (filters: BrowseFilters) => void;
  onClose: () => void;
};

function Chip({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count?: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
        {count ? `  ${count}` : ''}
      </Text>
    </Pressable>
  );
}

export default function FilterSheet({ visible, facets, filters, onChange, onClose }: Props) {
  const toggle = (key: FacetType, value: string) =>
    onChange({ ...filters, [key]: filters[key] === value ? undefined : value });

  const toggleKind = (kind: WorkKind) =>
    onChange({ ...filters, kind: filters.kind === kind ? undefined : kind });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <SafeAreaView style={styles.sheet} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={type.screenTitle}>शोध मर्यादित करा</Text>
          <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="बंद करा">
            <Feather name="x" size={22} color={colors.ink} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          <Text style={type.eyebrow}>प्रकार</Text>
          <View style={styles.chips}>
            {(['pdf', 'audio'] as WorkKind[]).map((kind) => (
              <Chip
                key={kind}
                label={kindLabel[kind]}
                active={filters.kind === kind}
                onPress={() => toggleKind(kind)}
              />
            ))}
          </View>

          {(['subject', 'author', 'language'] as FacetType[]).map((section) => {
            const options = facets?.[section] ?? [];
            if (options.length === 0) return null;
            return (
              <View key={section}>
                <Text style={[type.eyebrow, styles.sectionLabel]}>{SECTION_LABEL[section]}</Text>
                <View style={styles.chips}>
                  {options.map((option) => (
                    <Chip
                      key={option.value}
                      label={option.value}
                      count={option.count}
                      active={filters[section] === option.value}
                      onPress={() => toggle(section, option.value)}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={() => onChange({})} style={styles.clear} accessibilityRole="button">
            <Text style={[type.button, { color: colors.inkSoft }]}>सर्व काढा</Text>
          </Pressable>
          <Pressable onPress={onClose} style={styles.apply} accessibilityRole="button">
            <Text style={[type.button, { color: colors.card }]}>पाहा</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: colors.paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  body: { paddingHorizontal: space.lg, paddingBottom: space.xl },
  sectionLabel: { marginTop: space.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.sm },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.card,
  },
  chipActive: { borderColor: colors.saffron, backgroundColor: colors.saffronWash },
  chipText: { ...type.meta, color: colors.ink },
  chipTextActive: { color: colors.saffron },
  footer: {
    flexDirection: 'row',
    gap: space.md,
    padding: space.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.rule,
  },
  clear: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: space.md },
  apply: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.ink,
  },
});
