/**
 * Hand Band — Notification Service
 *
 * Thin wrapper for expo-notifications.
 * Responsibilities:
 *   - Request notification permissions
 *   - Configure Android notification channel
 *   - Get/return Expo push token
 *   - Schedule local notifications (band-connected, own-device only)
 *
 * Family member low-HR alerts are handled via backend push (cross-device).
 * Do NOT put Family Circle business logic here.
 */

import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

function isExpoGo() {
  try {
    return (
      Constants?.executionEnvironment === ExecutionEnvironment?.StoreClient ||
      Constants?.appOwnership === 'expo'
    );
  } catch (e) {
    return false;
  }
}

let Notifications = null;
try {
  // In Expo Go SDK 53+, requiring expo-notifications push modules immediately throws a runtime error.
  // We only initialize Notifications if we are in a dev build or standalone app.
  if (!isExpoGo()) {
    Notifications = require('expo-notifications');
  }
} catch (e) {
  console.log('[NotificationService] Failed to load expo-notifications:', e.message);
}

/** Android channel ID for health alerts */
const ALERT_CHANNEL_ID = 'handband_alerts';

/**
 * Configure how notifications behave while the app is in the foreground.
 */
if (Notifications) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (e) {
    // ignore
  }
}

/**
 * Request notification permissions and configure the Android alert channel.
 * Safe to call multiple times — will not request again if already granted.
 * @returns {Promise<boolean>} true if permissions are granted
 */
export async function requestNotificationPermissions() {
  try {
    if (!Notifications) return false;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(ALERT_CHANNEL_ID, {
        name: 'Hand Band Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00BFA5',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    // Permission request must never crash the app
    console.log('[NotificationService] Permission request failed:', e.message);
    return false;
  }
}

/**
 * Get the Expo push token for this device.
 * Returns null if permissions are denied or unavailable (e.g., simulator).
 * @returns {Promise<string|null>}
 */
export async function getExpoPushToken() {
  try {
    if (!Notifications || isExpoGo()) return null;

    const granted = await requestNotificationPermissions();
    if (!granted) return null;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: undefined, // Uses app.json projectId automatically
    });
    return tokenData?.data || null;
  } catch (e) {
    console.log('[NotificationService] Could not get push token:', e.message);
    return null;
  }
}

/**
 * Show a local notification on THIS device only.
 * Use for band-connected events (account owner's own phone).
 * @param {string} title
 * @param {string} body
 */
export async function showLocalNotification(title, body) {
  try {
    if (!Notifications) return;

    const granted = await requestNotificationPermissions();
    if (!granted) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        ...(Platform.OS === 'android' ? { channelId: ALERT_CHANNEL_ID } : {}),
      },
      trigger: null, // Show immediately
    });
  } catch (e) {
    console.log('[NotificationService] showLocalNotification failed:', e.message);
  }
}
