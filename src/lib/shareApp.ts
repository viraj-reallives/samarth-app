import { Share } from 'react-native';

export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=in.samarthramdas400.app';

export async function shareApp(message: string) {
  try {
    await Share.share({ message: `${message}\n${PLAY_STORE_URL}` });
  } catch {
    // Dismissed, or the share sheet is unavailable.
  }
}
