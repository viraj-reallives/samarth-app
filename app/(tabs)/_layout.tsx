import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useT } from '../../src/i18n';
import { colors, font } from '../../src/theme';

export default function TabsLayout() {
  const t = useT();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.saffron,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.rule },
        tabBarLabelStyle: { fontFamily: font.body, fontSize: 11 },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="(library)"
        options={{
          title: t('tab.browse'),
          tabBarIcon: ({ color, size }) => <Feather name="book-open" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="downloads"
        options={{
          title: t('tab.downloads'),
          tabBarIcon: ({ color, size }) => <Feather name="download" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: t('tab.saved'),
          tabBarIcon: ({ color, size }) => <Feather name="bookmark" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: t('tab.about'),
          tabBarIcon: ({ color, size }) => <Feather name="info" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
