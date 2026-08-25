import * as Application from 'expo-application';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../src/components/ScreenHeader';
import { colors, radius, space, type } from '../../src/theme';

const SITE = 'https://www.samarthramdas400.in';

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="परिचय" />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.invocation}>॥ जय जय रघुवीर समर्थ ॥</Text>

        <Text style={type.body}>
          समर्थ व्यासपीठ – रामदास स्वामी विचार फाऊंडेशन यांच्या संग्रहातील ग्रंथ, नियतकालिके
          आणि प्रवचनांची ध्वनिफिती या ॲपमधून वाचता व ऐकता येतील. सर्व साहित्य
          samarthramdas400.in या संकेतस्थळावरील संग्रहातून थेट घेतले जाते.
        </Text>

        <View style={styles.divider} />

        <Pressable
          style={styles.link}
          onPress={() => WebBrowser.openBrowserAsync(SITE)}
          accessibilityRole="link"
        >
          <Text style={type.button}>संकेतस्थळ उघडा</Text>
          <Text style={type.meta}>samarthramdas400.in</Text>
        </Pressable>

        <Text style={[type.meta, styles.version]}>
          आवृत्ती {Application.nativeApplicationVersion ?? '1.0.0'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  body: { padding: space.lg, gap: space.lg },
  invocation: { ...type.workTitleLarge, color: colors.saffron, textAlign: 'center' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.rule },
  link: {
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.card,
    gap: 2,
  },
  version: { textAlign: 'center', marginTop: space.lg },
});
