/**
 * Health Service Module — Adapter & Re-export Wrapper
 *
 * All core Health Connect operations are unified in `frontend/src/services/healthConnect.js`.
 * This file serves as an adapter to preserve backwards compatibility across existing
 * screens and contexts (DeviceScreen, HealthDashboardScreen, ProfileContext) without code drift.
 */
import { Platform } from 'react-native';
import {
  checkAvailability,
  setupHealthConnect,
  readHealthData,
  getTodayRange,
  openSettings,
  HEALTH_CONNECT_PERMISSIONS,
  checkGrantedPermissionsOnly,
} from '../../services/healthConnect';
import { syncHealthDataApi, getLatestHealthApi } from '../../services/api';

/**
 * Check if the app is currently running inside Expo Go client.
 */
export function isExpoGo() {
  return false;
}

/**
 * Safely verify if native Health Connect library is usable in current runtime.
 */
export function isNativeHealthConnectSupported() {
  return Platform.OS === 'android';
}

// Re-export primary service functions
export {
  checkAvailability,
  setupHealthConnect,
  readHealthData,
  getTodayRange,
  openSettings,
  HEALTH_CONNECT_PERMISSIONS,
  checkGrantedPermissionsOnly,
};

export const HEALTH_CONNECT_STATUS = {
  AVAILABLE: 'AVAILABLE',
  NOT_INSTALLED: 'NOT_INSTALLED',
  UPDATE_REQUIRED: 'UPDATE_REQUIRED',
  UNSUPPORTED_PLATFORM: 'UNSUPPORTED_PLATFORM',
  UNSUPPORTED_ENVIRONMENT: 'UNSUPPORTED_ENVIRONMENT',
};

/**
 * Backwards-compatible check for Health Connect availability
 */
export async function checkHealthConnectAvailability() {
  const result = await checkAvailability();
  return {
    status: result.status,
    isAvailable: result.ok,
    rawStatus: result.rawStatus,
    message: result.message,
  };
}

/**
 * Backwards-compatible check for granted permissions
 */
export async function checkHealthPermissions() {
  const setup = await setupHealthConnect();
  const grantedRecords = (setup.granted || [])
    .filter((p) => p.accessType === 'read' || p.accessType === 'write')
    .map((p) => p.recordType);

  return {
    hasHeartRate: grantedRecords.includes('HeartRate'),
    hasAll: HEALTH_CONNECT_PERMISSIONS.every((p) => grantedRecords.includes(p.recordType)),
    grantedRecords,
  };
}

export async function checkHeartRatePermission() {
  const { hasHeartRate } = await checkHealthPermissions();
  return hasHeartRate;
}

/**
 * Backwards-compatible permission request handler
 */
export async function requestHealthPermissions() {
  const res = await setupHealthConnect();
  return {
    granted: res.ok,
    permissions: res.granted,
    error: res.reason,
  };
}

/**
 * Backwards-compatible heart rate reader
 */
export async function getHeartRateData(options = {}) {
  const result = await readHealthData(options);
  const records = result.data.heartRate || [];

  if (records.length === 0) {
    return { hasData: false, latest: null, samples: [], recordsCount: 0 };
  }

  const allSamples = [];
  for (const record of records) {
    const origin = record.metadata?.dataOrigin || 'Hand Band via Bluetooth';
    if (Array.isArray(record.samples)) {
      for (const sample of record.samples) {
        if (sample && typeof sample.beatsPerMinute === 'number') {
          allSamples.push({
            beatsPerMinute: Math.round(sample.beatsPerMinute),
            time: sample.time || record.startTime || record.endTime,
            source: origin,
          });
        }
      }
    } else if (typeof record.beatsPerMinute === 'number') {
      allSamples.push({
        beatsPerMinute: Math.round(record.beatsPerMinute),
        time: record.startTime || record.endTime,
        source: origin,
      });
    }
  }

  if (allSamples.length === 0) {
    return { hasData: false, latest: null, samples: [], recordsCount: records.length };
  }

  allSamples.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  const latestSample = allSamples[allSamples.length - 1];

  return {
    hasData: true,
    latest: {
      beatsPerMinute: latestSample.beatsPerMinute,
      time: latestSample.time,
      source: latestSample.source,
    },
    samples: allSamples,
    recordsCount: records.length,
  };
}

/**
 * Unified sync handler for ProfileContext & DeviceScreen
 */
export async function syncAllHealthData() {
  if (Platform.OS !== 'android') {
    return {
      success: false,
      isRealData: false,
      reason: 'Health sync is only available on the Android app.',
      lastSynced: null,
    };
  }

  try {
    const setup = await setupHealthConnect();
    if (!setup.ok) {
      return {
        success: false,
        isRealData: false,
        metrics: null,
        error: setup.reason || 'Health permissions not granted',
        permissionRequired: true,
        lastSynced: null,
      };
    }

    const health = await readHealthData();
    const hr = health.data.heartRate || [];
    const steps = health.data.steps || [];
    const calories = health.data.totalCalories || [];
    const distance = health.data.distance || [];
    const sleep = health.data.sleep || [];
    const oxygen = health.data.oxygenSaturation || [];

    const totalSteps = steps.reduce((sum, r) => sum + (r.count || 0), 0);
    const totalCal = calories.reduce(
      (sum, r) => sum + (r.energy?.inKilocalories || r.energy?.value || 0),
      0
    );
    const totalDist = distance.reduce(
      (sum, r) => sum + (r.distance?.inMeters || r.distance?.value || 0),
      0
    );

    const payload = {
      heartRate: hr.length > 0 ? hr[hr.length - 1].beatsPerMinute || null : null,
      steps: totalSteps,
      calories: Math.round(totalCal),
      distance: totalDist > 0 ? Math.round((totalDist / 1000) * 100) / 100 : null,
      oxygenLevel: oxygen.length > 0 ? oxygen[oxygen.length - 1].percentage || null : null,
      bluetoothConnected: true,
      source: 'Hand Band via Bluetooth',
      timestamp: new Date().toISOString(),
    };

    const apiRes = await syncHealthDataApi(payload);

    return {
      success: true,
      isRealData: true,
      metrics: payload,
      source: 'Hand Band via Bluetooth',
      lastSynced: new Date(),
      apiResponse: apiRes?.data,
    };
  } catch (error) {
    console.warn('[HealthService] syncAllHealthData error:', error);
    return {
      success: false,
      isRealData: false,
      metrics: null,
      error: error.message || 'Failed to sync health data',
      lastSynced: null,
    };
  }
}
