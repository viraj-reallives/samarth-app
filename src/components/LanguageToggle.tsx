import { Pressable, StyleSheet, Text, View } from 'react-native';
import { setLang, useLang } from '../i18n';
import { LANG_NAME, LANGUAGES } from '../i18n/strings';
import { colors, font, radius, space, type } from '../theme';

export default function LanguageToggle() {
  const lang = useLang();

  return (
    <View style={styles.track}>
      {LANGUAGES.map((option) => {
        const active = option === lang;
        return (
          <Pressable
            key={option}
            onPress={() => setLang(option)}
            style={[styles.segment, active && styles.segmentActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={LANG_NAME[option]}
          >
            <Text style={[type.meta, { fontFamily: font.bodyMedium }, styles.label, active && styles.labelActive]}>
              {LANG_NAME[option]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: radius.md,
    backgroundColor: colors.saffronWash,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  segment: {
    flex: 1,
    paddingVertical: space.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  segmentActive: { backgroundColor: colors.card },
  label: { color: colors.inkSoft },
  labelActive: { color: colors.ink },
});
