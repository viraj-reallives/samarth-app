import { Feather } from '@expo/vector-icons';
import * as Application from 'expo-application';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { type ComponentProps, type ReactNode, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ContactForm from '../../src/components/ContactForm';
import LanguageToggle from '../../src/components/LanguageToggle';
import ScreenHeader from '../../src/components/ScreenHeader';
import { useLang, useT } from '../../src/i18n';
import { SITE_LOGO } from '../../src/lib/brand';
import {
  contactAddress,
  contactEmail,
  contactMapQuery,
  contactPerson,
  contactPhones,
} from '../../src/lib/contact';
import { colors, font, radius, space, type } from '../../src/theme';

const SITE = 'https://www.samarthramdas400.in';

type AboutTab = 'general' | 'contact';

export default function AboutScreen() {
  const t = useT();
  const lang = useLang();
  const [tab, setTab] = useState<AboutTab>('general');
  const addressLines = lang === 'en' ? contactAddress.linesEn : contactAddress.linesMr;
  const addressTitle = lang === 'en' ? contactAddress.titleEn : contactAddress.titleMr;
  const personName = lang === 'en' ? contactPerson.nameEn : contactPerson.nameMr;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title={t('tab.about')} />
      <View style={styles.tabs} accessibilityRole="tablist">
        {(['general', 'contact'] as const).map((option) => {
          const active = tab === option;
          return (
            <Pressable
              key={option}
              onPress={() => setTab(option)}
              style={[styles.tab, active && styles.tabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Text style={[type.meta, { fontFamily: font.bodyMedium }, styles.tabLabel, active && styles.tabLabelActive]}>
                {t(option === 'general' ? 'about.tab.general' : 'about.tab.contact')}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      >
        {tab === 'general' ? (
          <>
            <Image source={SITE_LOGO} style={styles.logo} resizeMode="contain" />
            <Text style={[type.workTitleLarge, styles.invocation]}>{t('about.invocation')}</Text>
            <Text style={type.body}>{t('about.body')}</Text>

            <Pressable
              style={styles.siteCard}
              onPress={() => WebBrowser.openBrowserAsync(SITE)}
              accessibilityRole="link"
              accessibilityLabel={t('about.openSite')}
            >
              <View style={styles.siteIcon}>
                <Feather name="globe" size={18} color={colors.saffron} />
              </View>
              <View style={styles.siteBody}>
                <Text style={[type.button, styles.siteTitle]}>{t('about.openSite')}</Text>
                <Text style={type.body}>{t('about.sitePromo')}</Text>
                <Text style={[type.body, styles.linkText]}>samarthramdas400.in</Text>
              </View>
            </Pressable>

            <Pressable
              style={styles.link}
              onPress={() => WebBrowser.openBrowserAsync(`${SITE}/privacy-policy/en`)}
              accessibilityRole="link"
            >
              <Text style={type.button}>{t('about.privacy')}</Text>
            </Pressable>

            <View style={styles.divider} />

            <View style={styles.language}>
              <Text style={type.eyebrow}>{t('about.language')}</Text>
              <LanguageToggle />
              <Text style={type.meta}>{t('about.languageHint')}</Text>
            </View>

            <Text style={[type.meta, styles.version]}>
              {t('about.version', { version: Application.nativeApplicationVersion ?? '1.0.0' })}
            </Text>
          </>
        ) : (
          <>
            <View style={styles.person}>
              <Text style={[type.workTitleLarge, styles.personName]}>{personName}</Text>
              <Text style={[type.eyebrow, styles.personRole]}>{t('contact.personRole')}</Text>
            </View>

            <Text style={type.meta}>{t('contact.intro')}</Text>

            <InfoCard
              icon="map-pin"
              title={addressTitle}
              onPress={() =>
                Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(contactMapQuery)}`)
              }
              accessibilityLabel={t('contact.openMap')}
            >
              {addressLines.map((line) => (
                <Text key={line} style={type.meta}>
                  {line}
                </Text>
              ))}
            </InfoCard>

            <InfoCard icon="phone" title={t('contact.phoneHeading')}>
              {contactPhones.map((phone) => (
                <Pressable
                  key={phone.tel}
                  onPress={() => Linking.openURL(`tel:${phone.tel}`)}
                  accessibilityRole="link"
                  accessibilityLabel={phone.display}
                >
                  <Text style={[type.body, styles.linkText]}>{phone.display}</Text>
                </Pressable>
              ))}
            </InfoCard>

            <InfoCard
              icon="mail"
              title={t('contact.emailLabel')}
              onPress={() => Linking.openURL(`mailto:${contactEmail}`)}
              accessibilityLabel={contactEmail}
            >
              <Text style={[type.body, styles.linkText]}>{contactEmail}</Text>
            </InfoCard>

            <ContactForm />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoCard({
  icon,
  title,
  children,
  onPress,
  accessibilityLabel,
}: {
  icon: ComponentProps<typeof Feather>['name'];
  title: string;
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const inner = (
    <>
      <View style={styles.cardIcon}>
        <Feather name={icon} size={16} color={colors.saffron} />
      </View>
      <View style={styles.cardBody}>
        <Text style={type.eyebrow}>{title}</Text>
        {children}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={styles.card}
        accessibilityRole="link"
        accessibilityLabel={accessibilityLabel ?? title}
      >
        {inner}
      </Pressable>
    );
  }

  return <View style={styles.card}>{inner}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: space.xl,
    marginBottom: space.sm,
    padding: 3,
    borderRadius: radius.md,
    backgroundColor: colors.saffronWash,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  tab: {
    flex: 1,
    paddingVertical: space.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.card },
  tabLabel: { color: colors.inkSoft },
  tabLabelActive: { color: colors.ink },
  body: { padding: space.lg, gap: space.lg, alignItems: 'stretch', paddingBottom: space.xxl },
  logo: { width: '100%', height: 88, alignSelf: 'center' },
  invocation: { color: colors.saffron, textAlign: 'center' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.rule },
  language: { gap: space.sm },
  siteCard: {
    flexDirection: 'row',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.card,
  },
  siteIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.saffronWash,
  },
  siteBody: { flex: 1, gap: 4 },
  siteTitle: { color: colors.saffron },
  link: {
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.card,
    gap: 2,
  },
  person: {
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.card,
  },
  personName: { textAlign: 'center' },
  personRole: {
    color: colors.saffron,
    letterSpacing: 1.4,
  },
  card: {
    flexDirection: 'row',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.card,
  },
  cardIcon: { paddingTop: 2 },
  cardBody: { flex: 1, gap: 2 },
  linkText: { color: colors.saffron },
  version: { textAlign: 'center', marginTop: space.lg },
});
