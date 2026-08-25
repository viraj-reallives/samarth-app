import { Feather } from '@expo/vector-icons';
import { useCallback, useMemo, useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Linking from 'expo-linking';
import { useT } from '../i18n';
import { contactEmail } from '../lib/contact';
import { ContactFormType, ContactSubmitError, submitContactForm } from '../lib/web3forms';
import { colors, font, radius, space, type } from '../theme';

function createChallenge() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, answer: a + b };
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function ContactForm() {
  const t = useT();
  const [tab, setTab] = useState<ContactFormType>('participation');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [challenge, setChallenge] = useState(createChallenge);
  const [captcha, setCaptcha] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const refreshCaptcha = useCallback(() => {
    setChallenge(createChallenge());
    setCaptcha('');
    setCaptchaError('');
  }, []);

  const switchTab = (next: ContactFormType) => {
    setTab(next);
    setStatus('idle');
    setStatusMessage('');
    refreshCaptcha();
  };

  const hint = useMemo(
    () => (tab === 'participation' ? t('contact.participationHint') : t('contact.feedbackHint')),
    [tab, t]
  );

  const submit = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();
    const trimmedCaptcha = captcha.trim();

    if (!trimmedName) {
      setStatus('error');
      setStatusMessage(t('contact.nameRequired'));
      return;
    }
    if (!isEmail(trimmedEmail)) {
      setStatus('error');
      setStatusMessage(t('contact.emailInvalid'));
      return;
    }
    if (!trimmedMessage) {
      setStatus('error');
      setStatusMessage(t('contact.messageRequired'));
      return;
    }
    if (!trimmedCaptcha) {
      setCaptchaError(t('contact.captchaEnter'));
      setStatus('error');
      setStatusMessage('');
      return;
    }
    if (Number(trimmedCaptcha) !== challenge.answer) {
      setCaptchaError(t('contact.captchaWrong'));
      setStatus('error');
      setStatusMessage('');
      return;
    }

    setCaptchaError('');
    setStatus('submitting');
    setStatusMessage('');

    try {
      await submitContactForm({
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
        phone: tab === 'feedback' ? phone.trim() : undefined,
        formType: tab,
      });
      setStatus('success');
      setStatusMessage(t('contact.success'));
      setName('');
      setEmail('');
      setMessage('');
      setPhone('');
      refreshCaptcha();
    } catch (error) {
      const network =
        error instanceof ContactSubmitError &&
        (error.message === 'network' || error.message === 'timeout');
      setStatus('error');
      setStatusMessage(network ? t('contact.networkError') : t('contact.sendError'));
    }
  };

  return (
    <View style={styles.panel}>
      <View style={styles.tabs} accessibilityRole="tablist">
        {(['participation', 'feedback'] as const).map((option) => {
          const active = tab === option;
          return (
            <Pressable
              key={option}
              onPress={() => switchTab(option)}
              style={[styles.tab, active && styles.tabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Text style={[type.meta, { fontFamily: font.bodyMedium }, styles.tabLabel, active && styles.tabLabelActive]}>
                {t(`contact.${option}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={type.body}>{hint}</Text>
      <Text style={type.meta}>
        {t('contact.formEmailNote')}{' '}
        <Text
          style={[type.meta, { fontFamily: font.bodyMedium }, styles.inlineLink]}
          onPress={() => Linking.openURL(`mailto:${contactEmail}`)}
        >
          {contactEmail}
        </Text>
      </Text>

      <Field
        label={t('contact.yourName')}
        icon="user"
        value={name}
        onChangeText={setName}
        placeholder={t('contact.namePlaceholder')}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
      />
      <Field
        label={t('contact.yourEmail')}
        icon="mail"
        value={email}
        onChangeText={setEmail}
        placeholder="email@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        autoCorrect={false}
      />
      <Field
        label={t('contact.message')}
        value={message}
        onChangeText={setMessage}
        placeholder={t('contact.messagePlaceholder')}
        multiline
      />
      {tab === 'feedback' ? (
        <Field
          label={t('contact.yourPhone')}
          icon="phone"
          value={phone}
          onChangeText={setPhone}
          placeholder="+91 …"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
        />
      ) : null}

      <View style={styles.captcha}>
        <View style={styles.labelRow}>
          <Feather name="shield" size={14} color={colors.inkSoft} />
          <Text style={[type.eyebrow, styles.label]}>{t('contact.captcha')}</Text>
        </View>
        <View style={styles.captchaRow}>
          <Text style={[type.workTitle, styles.question]}>
            {challenge.a} + {challenge.b} = ?
          </Text>
          <TextInput
            value={captcha}
            onChangeText={(text) => {
              setCaptcha(text);
              setCaptchaError('');
            }}
            placeholder={t('contact.captchaAnswer')}
            placeholderTextColor={colors.inkFaint}
            keyboardType="number-pad"
            style={[type.body, styles.input, styles.captchaInput, captchaError ? styles.inputError : null]}
            accessibilityLabel={t('contact.captcha')}
          />
          <Pressable
            onPress={refreshCaptcha}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={t('contact.captchaRefresh')}
            style={styles.refresh}
          >
            <Feather name="refresh-cw" size={16} color={colors.inkSoft} />
          </Pressable>
        </View>
        {captchaError ? <Text style={[type.meta, styles.error]}>{captchaError}</Text> : null}
      </View>

      {status === 'success' ? (
        <Text style={[type.meta, styles.success]} accessibilityRole="text">
          {statusMessage}
        </Text>
      ) : null}
      {status === 'error' && statusMessage ? (
        <Text style={[type.meta, styles.error]} accessibilityRole="text">
          {statusMessage}
        </Text>
      ) : null}

      <Pressable
        onPress={submit}
        disabled={status === 'submitting'}
        style={[styles.submit, status === 'submitting' && styles.submitDisabled]}
        accessibilityRole="button"
      >
        <Feather name="send" size={16} color={colors.card} />
        <Text style={[type.button, styles.submitLabel]}>
          {status === 'submitting' ? t('contact.sending') : t('contact.submit')}
        </Text>
      </Pressable>
    </View>
  );
}

function Field({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  autoCapitalize,
  autoComplete,
  textContentType,
  autoCorrect,
}: {
  label: string;
  icon?: ComponentProps<typeof Feather>['name'];
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: ComponentProps<typeof TextInput>['keyboardType'];
  autoCapitalize?: ComponentProps<typeof TextInput>['autoCapitalize'];
  autoComplete?: ComponentProps<typeof TextInput>['autoComplete'];
  textContentType?: ComponentProps<typeof TextInput>['textContentType'];
  autoCorrect?: boolean;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        {icon ? <Feather name={icon} size={14} color={colors.inkSoft} /> : null}
        <Text style={[type.eyebrow, styles.label]}>{label}</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        style={[type.body, styles.input, multiline && styles.textarea]}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        textContentType={textContentType}
        autoCorrect={autoCorrect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.card,
  },
  tabs: {
    flexDirection: 'row',
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
  inlineLink: { color: colors.saffron },
  field: { gap: 6 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { textTransform: 'none', letterSpacing: 0, color: colors.inkSoft },
  input: {
    minHeight: 48,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.paper,
    color: colors.ink,
  },
  textarea: { minHeight: 120, paddingTop: space.md },
  inputError: { borderColor: colors.danger },
  captcha: { gap: 6 },
  captchaRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  question: { color: colors.saffron, minWidth: 88 },
  captchaInput: { flex: 1, minHeight: 48 },
  refresh: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.paper,
  },
  success: { color: colors.saffron },
  error: { color: colors.danger },
  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingVertical: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.ink,
  },
  submitDisabled: { opacity: 0.55 },
  submitLabel: { color: colors.card },
});
