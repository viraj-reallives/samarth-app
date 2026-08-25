import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../src/components/ScreenHeader';
import { useSavedWorks } from '../../src/lib/saved';
import { colors, kindLabel, space, type } from '../../src/theme';

export default function SavedScreen() {
  const saved = useSavedWorks();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="माझी यादी" subtitle={saved.length ? `${saved.length} नोंदी` : undefined} />

      <FlatList
        data={saved}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={saved.length === 0 && styles.emptyContainer}
        renderItem={({ item }) => (
          <Link href={`/work/${item.slug}`} asChild>
            <Pressable style={styles.row}>
              <Feather
                name={item.kind === 'audio' ? 'headphones' : 'book-open'}
                size={16}
                color={colors.inkSoft}
                style={styles.icon}
              />
              <View style={styles.text}>
                <Text style={type.eyebrow}>{kindLabel[item.kind]}</Text>
                <Text style={type.workTitle} numberOfLines={2}>
                  {item.titleMr}
                </Text>
              </View>
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={type.body}>अद्याप काही जतन केलेले नाही.</Text>
            <Text style={type.meta}>
              कोणतीही साहित्यकृती उघडा आणि खूण करा, ती इथे दिसेल.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  row: {
    flexDirection: 'row',
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rule,
  },
  icon: { paddingTop: 18 },
  text: { flex: 1 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
  empty: { alignItems: 'center', gap: space.sm, padding: space.xl },
});
