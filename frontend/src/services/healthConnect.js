import { Platform } from 'react-native';
import {
  initialize,
  getSdkStatus,
  requestPermission,
  getGrantedPermissions,
  readRecords,
  openHealthConnectSettings,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';

/**
 * Standard health permissions required for Pebble fitness band synchronization.
 */
export const HEALTH_CONNECT_PERMISSIONS = [
  { accessType: 'read', recordType: 'Steps' },
  { accessType: 'read', recordType: 'HeartRate' },
  { accessType: 'read', recordType: 'SleepSession' },
  { accessType: 'read', recordType: 'OxygenSaturation' },
  { accessType: 'read', recordType: 'TotalCaloriesBurned' },
  { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
  { accessType: 'read', recordType: 'Distance' },
  { accessType: 'read', recordType: 'ExerciseSession' },
];

/**
 * Returns { startTime, endTime } in ISO 8601 UTC strings representing local midnight to now.
 *
 * NOTE ON TIMEZONES (Asia/Kolkata UTC+5:30 / Local Device Time):
 * Naive string operations such as `new Date().toISOString().split('T')[0] + 'T00:00:00.000Z'`
 * evaluate midnight relative to UTC (00:00 UTC = 05:30 AM IST).
 * Doing so causes a 5.5 hour skew:
 * 1) Between 12:00 AM and 05:30 AM local time, `toISOString()` still reports yesterday's date.
 * 2) Querying from 00:00 UTC misses all early morning activity between local midnight and 5:30 AM.
 *
 * To prevent empty or clipped query results:
 * - We instantiate a Date using local calendar units (getFullYear, getMonth, getDate, 0, 0, 0, 0).
 * - This Date represents the exact local midnight moment.
 * - Calling `.toISOString()` on that Date produces the precise UTC instant of local midnight
 *   (e.g., 2026-09-16 00:00:00 IST -> 2026-09-15T18:30:00.000Z).
 */
export function getTodayRange() {
  const now = new Date();
  const localMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );

  return {
    startTime: localMidnight.toISOString(),
    endTime: now.toISOString(),
  };
}

/**
 * Check Health Connect SDK status on Android devices.
 * Wraps getSdkStatus() and returns a human-readable status object.
 */
export async function checkAvailability() {
  if (Platform.OS !== 'android') {
    return {
      ok: false,
      status: 'UNSUPPORTED_PLATFORM',
      rawStatus: null,
      message: 'Health Connect is only supported on Android devices.',
    };
  }

  try {
    const rawStatus = await getSdkStatus();
    console.log('[HC] checkAvailability rawStatus:', rawStatus);

    if (rawStatus === SdkAvailabilityStatus.SDK_AVAILABLE) {
      return {
        ok: true,
        status: 'AVAILABLE',
        rawStatus,
        message: 'Health Connect is installed and available.',
      };
    }

    if (rawStatus === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
      return {
        ok: false,
        status: 'UPDATE_REQUIRED',
        rawStatus,
        message: 'Health Connect requires an update from Google Play Store.',
      };
    }

    return {
      ok: false,
      status: 'NOT_INSTALLED',
      rawStatus,
      message: 'Health Connect is not installed on this Android device.',
    };
  } catch (error) {
    console.warn('[HC] checkAvailability error:', error?.message);
    return {
      ok: false,
      status: 'ERROR',
      rawStatus: null,
      message: error?.message || 'Error checking Health Connect availability.',
    };
  }
}

/**
 * Initializes Health Connect, requests required permissions, and verifies granted permissions.
 * Logs every intermediate step with [HC] prefix.
 * @returns {Promise<{ ok: boolean, granted: Array, reason?: string }>}
 */
export async function setupHealthConnect() {
  if (Platform.OS !== 'android') {
    console.log('[HC] setupHealthConnect aborted: Platform is not android');
    return { ok: false, granted: [], reason: 'Platform is not Android' };
  }

  try {
    // 1. Check SDK Status
    console.log('[HC] Step 1: Checking SDK status...');
    const status = await getSdkStatus();
    console.log('[HC] SDK Status code:', status);

    if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
      const reason =
        status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED
          ? 'Health Connect update required'
          : 'Health Connect not installed/available';
      console.warn('[HC] Setup halted:', reason);
      return { ok: false, granted: [], reason };
    }

    // 2. Initialize SDK
    console.log('[HC] Step 2: Initializing Health Connect client...');
    const initialized = await initialize();
    console.log('[HC] Initialized result:', initialized);

    if (!initialized) {
      console.warn('[HC] Initialization returned false');
      return { ok: false, granted: [], reason: 'Health Connect initialization failed' };
    }

    // 3. Request Permissions
    console.log(
      '[HC] Step 3: Requesting permissions for:',
      HEALTH_CONNECT_PERMISSIONS.map((p) => p.recordType)
    );
    const requested = await requestPermission(HEALTH_CONNECT_PERMISSIONS);
    console.log('[HC] requestPermission returned:', requested);

    // 4. Verify Granted Permissions
    console.log('[HC] Step 4: Reading granted permissions...');
    const grantedList = await getGrantedPermissions();
    console.log('[HC] Granted permissions:', grantedList);

    const granted = Array.isArray(grantedList) ? grantedList : [];
    const hasAnyGranted = granted.length > 0;

    return {
      ok: hasAnyGranted,
      granted,
      reason: hasAnyGranted ? undefined : 'No health permissions granted by user',
    };
  } catch (error) {
    console.error('[HC] setupHealthConnect exception:', error);
    return {
      ok: false,
      granted: [],
      reason: error?.message || 'Unexpected setup failure',
    };
  }
}

/**
 * Normalize records returned by react-native-health-connect readRecords.
 * Handles both response shapes: { records: [...] } and bare array [...].
 */
function extractRecords(result) {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  if (Array.isArray(result.records)) return result.records;
  return [];
}

/**
 * Reads health data from Health Connect for the given time range (defaults to local today).
 * Reads Steps, HeartRate, SleepSession, OxygenSaturation, TotalCaloriesBurned, Distance.
 * Never throws — returns partial data plus an errors dictionary.
 *
 * @param {Object} options - { startTime, endTime }
 * @returns {Promise<{ data: Object, errors: Object, range: Object }>}
 */
export async function readHealthData(options = {}) {
  const range = {
    startTime: options.startTime || getTodayRange().startTime,
    endTime: options.endTime || getTodayRange().endTime,
  };

  const data = {
    steps: [],
    heartRate: [],
    sleep: [],
    oxygenSaturation: [],
    totalCalories: [],
    activeCalories: [],
    distance: [],
    exercise: [],
  };

  const errors = {};

  if (Platform.OS !== 'android') {
    errors.platform = 'Health Connect is Android only';
    return { data, errors, range };
  }

  const timeRangeFilter = {
    operator: 'between',
    startTime: range.startTime,
    endTime: range.endTime,
  };

  console.log('[HC] readHealthData starting range:', range);

  // Helper to read a record type safely without throwing
  async function safeRead(recordType, key) {
    try {
      console.log(`[HC] Reading ${recordType}...`);
      const result = await readRecords(recordType, { timeRangeFilter });
      const records = extractRecords(result);
      console.log(`[HC] ${recordType} returned ${records.length} records`);
      data[key] = records;
    } catch (err) {
      console.warn(`[HC] Error reading ${recordType}:`, err?.message);
      errors[key] = err?.message || `Failed to read ${recordType}`;
    }
  }

  await Promise.all([
    safeRead('Steps', 'steps'),
    safeRead('HeartRate', 'heartRate'),
    safeRead('SleepSession', 'sleep'),
    safeRead('OxygenSaturation', 'oxygenSaturation'),
    safeRead('TotalCaloriesBurned', 'totalCalories'),
    safeRead('ActiveCaloriesBurned', 'activeCalories'),
    safeRead('Distance', 'distance'),
    safeRead('ExerciseSession', 'exercise'),
  ]);

  console.log('[HC] readHealthData summary:', {
    stepsCount: data.steps.length,
    hrCount: data.heartRate.length,
    sleepCount: data.sleep.length,
    oxygenCount: data.oxygenSaturation.length,
    caloriesCount: data.totalCalories.length,
    activeCaloriesCount: data.activeCalories.length,
    distanceCount: data.distance.length,
    exerciseCount: data.exercise.length,
    errorKeys: Object.keys(errors),
  });

  return {
    data,
    errors,
    range,
  };
}

/**
 * Open native Health Connect settings on Android
 */
export function openSettings() {
  if (Platform.OS === 'android') {
    try {
      openHealthConnectSettings();
    } catch (e) {
      console.warn('[HC] Failed to open Health Connect settings:', e?.message);
    }
  }
}

/**
 * Non-intrusive check for granted permissions without popping up permission dialog.
 * @returns {Promise<{ ok: boolean, granted: Array, hasHeartRate: boolean }>}
 */
export async function checkGrantedPermissionsOnly() {
  if (Platform.OS !== 'android') {
    return { ok: false, granted: [], hasHeartRate: false };
  }

  try {
    const status = await getSdkStatus();
    if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
      return { ok: false, granted: [], hasHeartRate: false };
    }

    const initialized = await initialize();
    if (!initialized) {
      return { ok: false, granted: [], hasHeartRate: false };
    }

    const grantedList = await getGrantedPermissions();
    const granted = Array.isArray(grantedList) ? grantedList : [];
    const grantedRecordTypes = granted
      .filter((p) => p.accessType === 'read' || p.accessType === 'write')
      .map((p) => p.recordType);

    return {
      ok: granted.length > 0,
      granted,
      hasHeartRate: grantedRecordTypes.includes('HeartRate'),
    };
  } catch (err) {
    console.warn('[HC] checkGrantedPermissionsOnly error:', err?.message);
    return { ok: false, granted: [], hasHeartRate: false };
  }
}

