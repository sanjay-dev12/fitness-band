import { Platform, NativeModules } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { syncHealthDataApi, getLatestHealthApi } from '../../services/api';

/**
 * Dynamically import react-native-health-connect on Android to prevent bundling failures on Web and Expo Go.
 */
function getHealthConnect() {
  if (Platform.OS !== 'android') return {};
  try {
    return require('react-native-health-connect');
  } catch (e) {
    return {};
  }
}

const initialize = (...args) => getHealthConnect().initialize?.(...args);
const getSdkStatus = (...args) => getHealthConnect().getSdkStatus?.(...args);
const requestPermission = (...args) => getHealthConnect().requestPermission?.(...args);
const getGrantedPermissions = (...args) => getHealthConnect().getGrantedPermissions?.(...args);
const readRecords = (...args) => getHealthConnect().readRecords?.(...args);
const openHealthConnectSettings = (...args) => getHealthConnect().openHealthConnectSettings?.(...args);
const SdkAvailabilityStatus = getHealthConnect().SdkAvailabilityStatus || {};

/**
 * Health Connect Availability Status enum mapping
 */
export const HEALTH_CONNECT_STATUS = {
  AVAILABLE: 'AVAILABLE',
  NOT_INSTALLED: 'NOT_INSTALLED',
  UPDATE_REQUIRED: 'UPDATE_REQUIRED',
  UNSUPPORTED_PLATFORM: 'UNSUPPORTED_PLATFORM',
  UNSUPPORTED_ENVIRONMENT: 'UNSUPPORTED_ENVIRONMENT', // Expo Go
};

/**
 * Check if the app is currently running inside Expo Go client.
 */
export function isExpoGo() {
  try {
    return (
      Constants?.executionEnvironment === ExecutionEnvironment?.StoreClient ||
      Constants?.appOwnership === 'expo'
    );
  } catch (e) {
    return false;
  }
}

/**
 * Safely verify if native Health Connect library is usable in current runtime.
 * Returns false inside Expo Go or if native binary has not been built with react-native-health-connect.
 */
export function isNativeHealthConnectSupported() {
  if (Platform.OS !== 'android') return false;
  if (isExpoGo()) return false;

  try {
    const isTurbo = typeof global !== 'undefined' && global.__turboModuleProxy != null;
    const turboMod = isTurbo ? global.__turboModuleProxy('HealthConnect') : null;
    const legacyMod = NativeModules?.HealthConnect;
    return !!(turboMod || legacyMod);
  } catch (e) {
    return false;
  }
}

/**
 * Check if Android Health Connect SDK is supported and installed on this device.
 * @returns {Promise<{ status: string, isAvailable: boolean, rawStatus: number | null, message?: string }>}
 */
export async function checkHealthConnectAvailability() {
  if (Platform.OS !== 'android') {
    return {
      status: HEALTH_CONNECT_STATUS.UNSUPPORTED_PLATFORM,
      isAvailable: false,
      rawStatus: null,
      message: 'Health Connect is only supported on Android devices.',
    };
  }

  if (isExpoGo() || !isNativeHealthConnectSupported()) {
    return {
      status: HEALTH_CONNECT_STATUS.UNSUPPORTED_ENVIRONMENT,
      isAvailable: false,
      rawStatus: null,
      message: 'Health Connect requires an Expo Development Build. Expo Go does not include native health modules.',
    };
  }

  try {
    const rawStatus = await getSdkStatus();

    if (rawStatus === SdkAvailabilityStatus.SDK_AVAILABLE) {
      return {
        status: HEALTH_CONNECT_STATUS.AVAILABLE,
        isAvailable: true,
        rawStatus,
      };
    }

    if (rawStatus === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
      return {
        status: HEALTH_CONNECT_STATUS.UPDATE_REQUIRED,
        isAvailable: false,
        rawStatus,
        message: 'Health Connect requires an update from Google Play Store.',
      };
    }

    return {
      status: HEALTH_CONNECT_STATUS.NOT_INSTALLED,
      isAvailable: false,
      rawStatus,
      message: 'Health Connect is not installed on this Android device.',
    };
  } catch (error) {
    const isUnlinked = error?.message?.includes('linked') || error?.message?.includes('Expo Go');
    if (!isUnlinked) {
      console.warn('[HealthService] Error checking Health Connect SDK status:', error.message);
    }
    return {
      status: HEALTH_CONNECT_STATUS.UNSUPPORTED_ENVIRONMENT,
      isAvailable: false,
      rawStatus: null,
      message: isUnlinked
        ? 'Health Connect requires an Expo Development Build.'
        : (error.message || 'Health Connect native module not available in current environment.'),
    };
  }
}

/**
 * Initialize Health Connect client
 * @returns {Promise<boolean>}
 */
export async function initializeHealthConnect() {
  if (!isNativeHealthConnectSupported()) {
    return false;
  }

  try {
    const isInitialized = await initialize();
    return !!isInitialized;
  } catch (error) {
    const isUnlinked = error?.message?.includes('linked') || error?.message?.includes('Expo Go');
    if (!isUnlinked) {
      console.warn('[HealthService] Failed to initialize Health Connect:', error.message);
    }
    return false;
  }
}

/**
 * Health Connect record types required for complete Pebble sync
 */
export const HEALTH_RECORD_TYPES = [
  'HeartRate',
  'Steps',
  'TotalCaloriesBurned',
  'Distance',
  'SleepSession',
  'OxygenSaturation',
  'HeartRateVariabilityRmssd',
  'ExerciseSession',
];

/**
 * Check if required permissions are granted.
 * @returns {Promise<{ hasHeartRate: boolean, hasAll: boolean, grantedRecords: Array<string> }>}
 */
export async function checkHealthPermissions() {
  if (!isNativeHealthConnectSupported()) {
    return { hasHeartRate: false, hasAll: false, grantedRecords: [] };
  }

  try {
    const granted = await getGrantedPermissions();
    if (!Array.isArray(granted)) return { hasHeartRate: false, hasAll: false, grantedRecords: [] };

    const grantedRecords = granted
      .filter((p) => p.accessType === 'read' || p.accessType === 'write')
      .map((p) => p.recordType);

    const hasHeartRate = grantedRecords.includes('HeartRate');
    const hasAll = HEALTH_RECORD_TYPES.every((type) => grantedRecords.includes(type));

    return {
      hasHeartRate,
      hasAll,
      grantedRecords,
    };
  } catch (error) {
    const isUnlinked = error?.message?.includes('linked') || error?.message?.includes('Expo Go');
    if (!isUnlinked) {
      console.warn('[HealthService] Error checking granted permissions:', error.message);
    }
    return { hasHeartRate: false, hasAll: false, grantedRecords: [] };
  }
}

export async function checkHeartRatePermission() {
  const { hasHeartRate } = await checkHealthPermissions();
  return hasHeartRate;
}

/**
 * Request read permissions for Pebble Health metrics.
 * @returns {Promise<{ granted: boolean, permissions: Array, error?: string }>}
 */
export async function requestHealthPermissions() {
  if (!isNativeHealthConnectSupported()) {
    return {
      granted: false,
      permissions: [],
      error: 'Health Connect native module is not available in Expo Go. Use development build.',
    };
  }

  try {
    await initializeHealthConnect();

    const permissionsToRequest = HEALTH_RECORD_TYPES.map((recordType) => ({
      accessType: 'read',
      recordType,
    }));

    const response = await requestPermission(permissionsToRequest);
    const grantedList = Array.isArray(response) ? response : [];

    const hasHeartRate = grantedList.some(
      (perm) => perm.recordType === 'HeartRate' && (perm.accessType === 'read' || perm.accessType === 'write')
    );

    return {
      granted: grantedList.length > 0 || hasHeartRate,
      permissions: grantedList,
    };
  } catch (error) {
    const isUnlinked = error?.message?.includes('linked') || error?.message?.includes('Expo Go');
    if (!isUnlinked) {
      console.warn('[HealthService] Error requesting health permissions:', error.message);
    }
    return {
      granted: false,
      permissions: [],
      error: error.message,
    };
  }
}

/**
 * Format data origin / package name into user-friendly display source.
 */
export function formatDataOrigin(dataOrigin) {
  if (!dataOrigin || typeof dataOrigin !== 'string') {
    return 'Health Connect';
  }

  const lower = dataOrigin.toLowerCase();
  if (lower.includes('pebble') || lower.includes('halo')) {
    return 'Pebble Halo via Health Connect';
  }

  const parts = dataOrigin.split('.');
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1];
    const capitalized = lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
    return `${capitalized} via Health Connect`;
  }

  return `${dataOrigin} via Health Connect`;
}

/**
 * Format timestamp into display time and date
 */
export function formatReadingTime(dateOrIso) {
  if (!dateOrIso) {
    return { formattedTime: '--:--', formattedDate: '', time: '' };
  }

  const d = new Date(dateOrIso);
  if (isNaN(d.getTime())) {
    return { formattedTime: '--:--', formattedDate: '', time: String(dateOrIso) };
  }

  const formattedTime = d.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const formattedDate = d.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    formattedTime,
    formattedDate,
    time: d.toISOString(),
  };
}

/**
 * Read REAL Heart Rate data from Health Connect.
 */
export async function getHeartRateData(options = {}) {
  if (!isNativeHealthConnectSupported()) {
    return { hasData: false, latest: null, samples: [], recordsCount: 0 };
  }

  try {
    await initializeHealthConnect();

    const now = new Date();
    const hoursBack = options.hoursBack || 48;
    const defaultStartTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000).toISOString();
    const startTime = options.startTime || defaultStartTime;
    const endTime = options.endTime || now.toISOString();

    const result = await readRecords('HeartRate', {
      timeRangeFilter: {
        operator: 'between',
        startTime,
        endTime,
      },
    });

    const records = result && Array.isArray(result.records) ? result.records : [];
    if (records.length === 0) {
      return { hasData: false, latest: null, samples: [], recordsCount: 0 };
    }

    const allSamples = [];
    for (const record of records) {
      const origin = record.metadata?.dataOrigin || '';
      const source = formatDataOrigin(origin);

      if (Array.isArray(record.samples) && record.samples.length > 0) {
        for (const sample of record.samples) {
          if (sample && typeof sample.beatsPerMinute === 'number' && sample.beatsPerMinute > 0) {
            allSamples.push({
              beatsPerMinute: Math.round(sample.beatsPerMinute),
              time: sample.time || record.startTime || record.endTime,
              source,
              dataOrigin: origin,
            });
          }
        }
      } else if (typeof record.beatsPerMinute === 'number' && record.beatsPerMinute > 0) {
        allSamples.push({
          beatsPerMinute: Math.round(record.beatsPerMinute),
          time: record.startTime || record.endTime || now.toISOString(),
          source,
          dataOrigin: origin,
        });
      }
    }

    if (allSamples.length === 0) {
      return { hasData: false, latest: null, samples: [], recordsCount: records.length };
    }

    allSamples.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    const latestSample = allSamples[allSamples.length - 1];
    const { formattedTime, formattedDate } = formatReadingTime(latestSample.time);

    return {
      hasData: true,
      latest: {
        beatsPerMinute: latestSample.beatsPerMinute,
        time: latestSample.time,
        formattedTime,
        formattedDate,
        source: latestSample.source,
        dataOrigin: latestSample.dataOrigin,
      },
      samples: allSamples,
      recordsCount: records.length,
    };
  } catch (error) {
    console.warn('[HealthService] Failed to read Heart Rate records:', error);
    return { hasData: false, latest: null, samples: [], recordsCount: 0, error: error.message };
  }
}

/**
 * Read REAL Steps data from Health Connect.
 */
export async function getStepsData(options = {}) {
  if (!isNativeHealthConnectSupported()) {
    return { hasData: false, totalSteps: null, recordsCount: 0 };
  }

  try {
    await initializeHealthConnect();

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startTime = options.startTime || startOfDay;
    const endTime = options.endTime || now.toISOString();

    const result = await readRecords('Steps', {
      timeRangeFilter: {
        operator: 'between',
        startTime,
        endTime,
      },
    });

    const records = result && Array.isArray(result.records) ? result.records : [];
    if (records.length === 0) {
      return { hasData: false, totalSteps: null, recordsCount: 0 };
    }

    let totalSteps = 0;
    let origin = '';
    for (const r of records) {
      if (typeof r.count === 'number') {
        totalSteps += r.count;
      }
      if (!origin && r.metadata?.dataOrigin) {
        origin = r.metadata.dataOrigin;
      }
    }

    return {
      hasData: true,
      totalSteps,
      source: formatDataOrigin(origin),
      recordsCount: records.length,
    };
  } catch (error) {
    console.warn('[HealthService] Failed to read Steps records:', error);
    return { hasData: false, totalSteps: null, recordsCount: 0, error: error.message };
  }
}

/**
 * Read REAL Calories data from Health Connect.
 */
export async function getCaloriesData(options = {}) {
  if (!isNativeHealthConnectSupported()) {
    return { hasData: false, totalCalories: null, recordsCount: 0 };
  }

  try {
    await initializeHealthConnect();

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startTime = options.startTime || startOfDay;
    const endTime = options.endTime || now.toISOString();

    let records = [];
    try {
      const res = await readRecords('TotalCaloriesBurned', {
        timeRangeFilter: { operator: 'between', startTime, endTime },
      });
      if (res && Array.isArray(res.records)) records = res.records;
    } catch (e) {
      try {
        const res2 = await readRecords('ActiveCaloriesBurned', {
          timeRangeFilter: { operator: 'between', startTime, endTime },
        });
        if (res2 && Array.isArray(res2.records)) records = res2.records;
      } catch (e2) {}
    }

    if (records.length === 0) {
      return { hasData: false, totalCalories: null, recordsCount: 0 };
    }

    let totalKcal = 0;
    let origin = '';
    for (const r of records) {
      if (r.energy?.inKilocalories) {
        totalKcal += r.energy.inKilocalories;
      } else if (r.energy?.inCalories) {
        totalKcal += r.energy.inCalories / 1000;
      }
      if (!origin && r.metadata?.dataOrigin) origin = r.metadata.dataOrigin;
    }

    return {
      hasData: true,
      totalCalories: Math.round(totalKcal),
      source: formatDataOrigin(origin),
      recordsCount: records.length,
    };
  } catch (error) {
    console.warn('[HealthService] Failed to read Calories records:', error);
    return { hasData: false, totalCalories: null, recordsCount: 0, error: error.message };
  }
}

/**
 * Read REAL Distance data from Health Connect.
 */
export async function getDistanceData(options = {}) {
  if (!isNativeHealthConnectSupported()) {
    return { hasData: false, totalDistanceKm: null, recordsCount: 0 };
  }

  try {
    await initializeHealthConnect();

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startTime = options.startTime || startOfDay;
    const endTime = options.endTime || now.toISOString();

    const result = await readRecords('Distance', {
      timeRangeFilter: { operator: 'between', startTime, endTime },
    });

    const records = result && Array.isArray(result.records) ? result.records : [];
    if (records.length === 0) {
      return { hasData: false, totalDistanceKm: null, recordsCount: 0 };
    }

    let meters = 0;
    let origin = '';
    for (const r of records) {
      if (r.distance?.inMeters) meters += r.distance.inMeters;
      else if (r.distance?.inKilometers) meters += r.distance.inKilometers * 1000;
      if (!origin && r.metadata?.dataOrigin) origin = r.metadata.dataOrigin;
    }

    const totalDistanceKm = Math.round((meters / 1000) * 100) / 100;
    return {
      hasData: true,
      totalDistanceKm,
      source: formatDataOrigin(origin),
      recordsCount: records.length,
    };
  } catch (error) {
    console.warn('[HealthService] Failed to read Distance records:', error);
    return { hasData: false, totalDistanceKm: null, recordsCount: 0, error: error.message };
  }
}

/**
 * Read REAL Sleep data from Health Connect.
 */
export async function getSleepData(options = {}) {
  if (!isNativeHealthConnectSupported()) {
    return { hasData: false, latest: null, recordsCount: 0 };
  }

  try {
    await initializeHealthConnect();

    const now = new Date();
    const hoursBack = options.hoursBack || 36;
    const defaultStartTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000).toISOString();
    const startTime = options.startTime || defaultStartTime;
    const endTime = options.endTime || now.toISOString();

    const result = await readRecords('SleepSession', {
      timeRangeFilter: { operator: 'between', startTime, endTime },
    });

    const records = result && Array.isArray(result.records) ? result.records : [];
    if (records.length === 0) {
      return { hasData: false, latest: null, recordsCount: 0 };
    }

    records.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    const latestSession = records[0];

    const start = new Date(latestSession.startTime);
    const end = new Date(latestSession.endTime);
    const totalMinutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / (60 * 1000)));

    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const formattedDuration = `${hrs}h ${mins}m`;

    let deepMinutes = 0;
    let lightMinutes = 0;
    let remMinutes = 0;
    let awakeMinutes = 0;

    if (Array.isArray(latestSession.stages)) {
      for (const stage of latestSession.stages) {
        const stageStart = new Date(stage.startTime).getTime();
        const stageEnd = new Date(stage.endTime).getTime();
        const stageMins = Math.max(0, Math.round((stageEnd - stageStart) / (60 * 1000)));

        if (stage.stage === 7) deepMinutes += stageMins;
        else if (stage.stage === 6) lightMinutes += stageMins;
        else if (stage.stage === 8) remMinutes += stageMins;
        else if (stage.stage === 1 || stage.stage === 4) awakeMinutes += stageMins;
      }
    }

    return {
      hasData: true,
      latest: {
        totalMinutes,
        formattedDuration,
        deepMinutes: deepMinutes || null,
        lightMinutes: lightMinutes || null,
        remMinutes: remMinutes || null,
        awakeMinutes: awakeMinutes || null,
        startTime: latestSession.startTime,
        endTime: latestSession.endTime,
        source: formatDataOrigin(latestSession.metadata?.dataOrigin),
      },
      recordsCount: records.length,
    };
  } catch (error) {
    console.warn('[HealthService] Failed to read Sleep records:', error);
    return { hasData: false, latest: null, recordsCount: 0, error: error.message };
  }
}

/**
 * Read REAL Oxygen Saturation (SpO2) data from Health Connect.
 */
export async function getOxygenData(options = {}) {
  if (!isNativeHealthConnectSupported()) {
    return { hasData: false, latestPercentage: null, recordsCount: 0 };
  }

  try {
    await initializeHealthConnect();

    const now = new Date();
    const hoursBack = options.hoursBack || 48;
    const defaultStartTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000).toISOString();
    const startTime = options.startTime || defaultStartTime;
    const endTime = options.endTime || now.toISOString();

    const result = await readRecords('OxygenSaturation', {
      timeRangeFilter: { operator: 'between', startTime, endTime },
    });

    const records = result && Array.isArray(result.records) ? result.records : [];
    if (records.length === 0) {
      return { hasData: false, latestPercentage: null, recordsCount: 0 };
    }

    records.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    const latest = records[records.length - 1];

    const pct = typeof latest.percentage === 'number' ? Math.round(latest.percentage) : null;
    return {
      hasData: pct !== null,
      latestPercentage: pct,
      time: latest.time,
      source: formatDataOrigin(latest.metadata?.dataOrigin),
      recordsCount: records.length,
    };
  } catch (error) {
    console.warn('[HealthService] Failed to read OxygenSaturation records:', error);
    return { hasData: false, latestPercentage: null, recordsCount: 0, error: error.message };
  }
}

/**
 * Read REAL HRV (Heart Rate Variability RMSSD) from Health Connect.
 */
export async function getHrvData(options = {}) {
  if (!isNativeHealthConnectSupported()) {
    return { hasData: false, latestHrv: null, recordsCount: 0 };
  }

  try {
    await initializeHealthConnect();

    const now = new Date();
    const hoursBack = options.hoursBack || 48;
    const defaultStartTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000).toISOString();
    const startTime = options.startTime || defaultStartTime;
    const endTime = options.endTime || now.toISOString();

    const result = await readRecords('HeartRateVariabilityRmssd', {
      timeRangeFilter: { operator: 'between', startTime, endTime },
    });

    const records = result && Array.isArray(result.records) ? result.records : [];
    if (records.length === 0) {
      return { hasData: false, latestHrv: null, recordsCount: 0 };
    }

    records.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    const latest = records[records.length - 1];

    const val = typeof latest.heartRateVariabilityMillis === 'number'
      ? Math.round(latest.heartRateVariabilityMillis)
      : null;

    return {
      hasData: val !== null,
      latestHrv: val,
      time: latest.time,
      source: formatDataOrigin(latest.metadata?.dataOrigin),
      recordsCount: records.length,
    };
  } catch (error) {
    console.warn('[HealthService] Failed to read HRV records:', error);
    return { hasData: false, latestHrv: null, recordsCount: 0, error: error.message };
  }
}

/**
 * Read REAL Workout / Exercise records from Health Connect.
 */
export async function getWorkoutData(options = {}) {
  if (!isNativeHealthConnectSupported()) {
    return { hasData: false, latestWorkout: null, recordsCount: 0 };
  }

  try {
    await initializeHealthConnect();

    const now = new Date();
    const hoursBack = options.hoursBack || 48;
    const defaultStartTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000).toISOString();
    const startTime = options.startTime || defaultStartTime;
    const endTime = options.endTime || now.toISOString();

    const result = await readRecords('ExerciseSession', {
      timeRangeFilter: { operator: 'between', startTime, endTime },
    });

    const records = result && Array.isArray(result.records) ? result.records : [];
    if (records.length === 0) {
      return { hasData: false, latestWorkout: null, recordsCount: 0 };
    }

    records.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    const latest = records[0];

    const start = new Date(latest.startTime).getTime();
    const end = new Date(latest.endTime).getTime();
    const durationMinutes = Math.max(0, Math.round((end - start) / (60 * 1000)));

    return {
      hasData: true,
      latestWorkout: {
        title: latest.title || 'Workout',
        exerciseType: latest.exerciseType || 'Exercise',
        durationMinutes,
        startTime: latest.startTime,
        endTime: latest.endTime,
        source: formatDataOrigin(latest.metadata?.dataOrigin),
      },
      recordsCount: records.length,
    };
  } catch (error) {
    console.warn('[HealthService] Failed to read ExerciseSession records:', error);
    return { hasData: false, latestWorkout: null, recordsCount: 0, error: error.message };
  }
}

/**
 * Open native Android Health Connect system settings
 */
export async function openSettings() {
  if (isNativeHealthConnectSupported()) {
    try {
      await openHealthConnectSettings();
    } catch (e) {
      console.warn('[HealthService] Could not open Health Connect settings:', e);
    }
  }
}

/**
 * Unified Health Synchronization Orchestrator
 */
export async function syncAllHealthData() {
  const isNative = isNativeHealthConnectSupported();

  // If in Expo Go / unsupported platform, fallback to querying backend for latest stored authentic data
  if (!isNative) {
    try {
      const backendRes = await getLatestHealthApi();
      if (backendRes?.success && backendRes.data) {
        const d = backendRes.data;
        return {
          success: true,
          isRealData: true,
          metrics: {
            heartRate: d.heartRate,
            restingHeartRate: d.restingHeartRate,
            oxygen: d.oxygenLevel,
            steps: d.steps || 0,
            calories: d.calories || 0,
            distance: d.distance || null,
            exerciseMins: d.exerciseMins || 0,
            walkingHours: d.walkingHours || 0,
            sleepDuration: d.sleepDuration || null,
            deepSleepMinutes: d.deepSleepMinutes,
            lightSleepMinutes: d.lightSleepMinutes,
            remSleepMinutes: d.remSleepMinutes,
            awakeSleepMinutes: d.awakeSleepMinutes,
            hrv: d.hrv,
            stress: d.stress,
            battery: d.battery || 98,
            source: d.source || 'Hand Band API',
            statusText: d.statusText || 'Synchronized',
          },
          source: d.source || 'Hand Band API',
          lastSynced: new Date(d.syncedAt || d.recordedAt || Date.now()),
        };
      }
      return {
        success: true,
        isRealData: false,
        metrics: null,
        source: 'Hand Band API',
        lastSynced: new Date(),
        message: 'No previous synchronized health records found on server.',
      };
    } catch (e) {
      return {
        success: false,
        isRealData: false,
        metrics: null,
        error: e.message || 'Unable to communicate with health server',
        lastSynced: null,
      };
    }
  }

  // Native Health Connect Flow
  try {
    const avail = await checkHealthConnectAvailability();
    if (!avail.isAvailable) {
      return {
        success: false,
        isRealData: false,
        metrics: null,
        error: avail.message || 'Health Connect is not available on this device',
        lastSynced: null,
      };
    }

    const { hasHeartRate } = await checkHealthPermissions();
    if (!hasHeartRate) {
      const permRes = await requestHealthPermissions();
      if (!permRes.granted) {
        return {
          success: false,
          isRealData: false,
          metrics: null,
          error: 'Health data permission required. Please allow access.',
          permissionRequired: true,
          lastSynced: null,
        };
      }
    }

    // Parallel fetch of all available real metrics
    const [hrRes, stepsRes, calRes, distRes, sleepRes, oxRes, hrvRes, workRes] =
      await Promise.allSettled([
        getHeartRateData(),
        getStepsData(),
        getCaloriesData(),
        getDistanceData(),
        getSleepData(),
        getOxygenData(),
        getHrvData(),
        getWorkoutData(),
      ]);

    const hr = hrRes.status === 'fulfilled' ? hrRes.value : null;
    const steps = stepsRes.status === 'fulfilled' ? stepsRes.value : null;
    const calories = calRes.status === 'fulfilled' ? calRes.value : null;
    const distance = distRes.status === 'fulfilled' ? distRes.value : null;
    const sleep = sleepRes.status === 'fulfilled' ? sleepRes.value : null;
    const oxygen = oxRes.status === 'fulfilled' ? oxRes.value : null;
    const hrv = hrvRes.status === 'fulfilled' ? hrvRes.value : null;
    const workout = workRes.status === 'fulfilled' ? workRes.value : null;

    const detectedSource =
      hr?.latest?.source ||
      steps?.source ||
      calories?.source ||
      sleep?.latest?.source ||
      'Pebble via Health Connect';

    // Normalized payload for backend API
    const payload = {
      heartRate: hr?.latest?.beatsPerMinute || null,
      restingHeartRate: null,
      oxygenLevel: oxygen?.latestPercentage || null,
      steps: steps?.totalSteps !== null && steps?.totalSteps !== undefined ? steps.totalSteps : 0,
      calories: calories?.totalCalories !== null && calories?.totalCalories !== undefined ? calories.totalCalories : 0,
      distance: distance?.totalDistanceKm || null,
      exerciseMins: workout?.latestWorkout?.durationMinutes || 0,
      walkingHours: Math.min(12, Math.round((steps?.totalSteps || 0) / 1000)),
      sleepDuration: sleep?.latest?.formattedDuration || null,
      deepSleepMinutes: sleep?.latest?.deepMinutes || null,
      lightSleepMinutes: sleep?.latest?.lightMinutes || null,
      remSleepMinutes: sleep?.latest?.remMinutes || null,
      awakeSleepMinutes: sleep?.latest?.awakeMinutes || null,
      sleepStartTime: sleep?.latest?.startTime || null,
      sleepEndTime: sleep?.latest?.endTime || null,
      hrv: hrv?.latestHrv || null,
      stress: null, // Stress not standard in Health Connect; displayed as -- if unavailable
      workoutType: workout?.latestWorkout?.exerciseType || null,
      workoutDuration: workout?.latestWorkout?.durationMinutes || null,
      source: detectedSource,
      rawSamples: hr?.samples ? { hrSamples: hr.samples.slice(-24) } : null,
      statusText: 'Synchronized',
      timestamp: new Date().toISOString(),
    };

    // Synchronize to authenticated backend database
    const apiRes = await syncHealthDataApi(payload);

    return {
      success: true,
      isRealData: true,
      metrics: payload,
      source: detectedSource,
      lastSynced: new Date(),
      apiResponse: apiRes?.data,
    };
  } catch (error) {
    console.warn('[HealthService] syncAllHealthData error:', error);
    return {
      success: false,
      isRealData: false,
      metrics: null,
      error: error.message || 'Failed to synchronize health records',
      lastSynced: null,
    };
  }
}
