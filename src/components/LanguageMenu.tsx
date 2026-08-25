import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { setLang, useLang } from '../i18n';
import { LANG_NAME, LANGUAGES } from '../i18n/strings';
import { colors, font, radius, space, type } from '../theme';

export default function LanguageMenu() {
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const others = LANGUAGES.filter((option) => option !== lang);

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        style={styles.trigger}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={LANG_NAME[lang]}
      >
        <Text style={[type.meta, { fontFamily: font.bodyMedium }, styles.triggerLabel]}>
          {LANG_NAME[lang]}
        </Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={14} color={colors.saffron} />
      </Pressable>

      {open ? (
        <View style={styles.menu}>
          {others.map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                setLang(option);
                setOpen(false);
              }}
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              accessibilityRole="button"
              accessibilityLabel={LANG_NAME[option]}
            >
              <Text style={[type.meta, { fontFamily: font.bodyMedium }, styles.itemLabel]}>
                {LANG_NAME[option]}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { zIndex: 20 },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.card,
  },
  triggerLabel: { color: colors.ink },
  menu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 6,
    minWidth: 128,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.card,
    shadowColor: colors.ink,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    overflow: 'hidden',
  },
  item: { paddingVertical: space.sm, paddingHorizontal: space.md },
  itemPressed: { backgroundColor: colors.saffronWash },
  itemLabel: { color: colors.ink },
});
