/**
 * Same Web3Forms setup as samarth-ramdas-website/src/config/web3forms.js.
 *
 * The access key is public by design — the website already ships it in the
 * browser bundle. Mail is delivered to the address verified in the Web3Forms
 * dashboard for this key (samarthvrati@gmail.com on the contact page).
 *
 * Submit from the device, not a server: the free plan rejects datacentre IPs.
 */

export const WEB3FORMS_ACCESS_KEY =
  process.env.EXPO_PUBLIC_WEB3FORMS_ACCESS_KEY ?? '7def4b37-0318-4bb9-a47a-caaabc95ce12';

export const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

export type ContactFormType = 'participation' | 'feedback';

export type ContactFormPayload = {
  name: string;
  email: string;
  message: string;
  phone?: string;
  formType: ContactFormType;
};

export class ContactSubmitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContactSubmitError';
  }
}

export async function submitContactForm(payload: ContactFormPayload): Promise<void> {
  const body: Record<string, string> = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: 'This is update from Samarth Ramdas app',
    name: payload.name,
    email: payload.email,
    message: payload.message,
    form_type: payload.formType,
    source: 'app',
  };
  if (payload.phone) body.phone = payload.phone;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const result = (await response.json().catch(() => ({}))) as {
      success?: boolean;
      message?: string;
    };

    if (!response.ok || result.success !== true) {
      throw new ContactSubmitError(result.message || 'send-failed');
    }
  } catch (error: any) {
    if (error instanceof ContactSubmitError) throw error;
    if (error?.name === 'AbortError') throw new ContactSubmitError('timeout');
    throw new ContactSubmitError('network');
  } finally {
    clearTimeout(timeout);
  }
}
