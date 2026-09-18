import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  getStoredUser,
  getLatestHealthApi,
  syncHealthDataApi,
  getFamilyApi,
  getFamilyMemberHealthApi,
  registerPushTokenApi,
  sendLowHrAlertApi,
  removeFamilyMemberApi,
  setBluetoothStatusApi,
  getBluetoothStatusApi,
} from '../services/api';
import {
  syncAllHealthData,
  readHealthData,
  setupHealthConnect,
  checkGrantedPermissionsOnly,
} from '../modules/health/health.service';
import { LOW_HR_THRESHOLD, LOW_HR_ALERT_COOLDOWN_MS } from '../services/healthConstants';
import { getExpoPushToken } from '../services/notificationService';
import { useRef } from 'react';

const ProfileContext = createContext(null);

const STORAGE_PROFILES_KEY = 'handband_family_profiles';
const STORAGE_ACTIVE_ID_KEY = 'handband_active_profile_id';

// Real empty initial metrics - zero hardcoded mock values
const EMPTY_INITIAL_METRICS = {
  calories: null,
  caloriesGoal: 500,
  exerciseMins: null,
  exerciseGoal: 30,
  walkingHours: null,
  walkingGoal: 12,
  steps: null,
  heartRate: null,
  restingHeartRate: null,
  oxygen: null,
  sleepDuration: null,
  deepSleepMinutes: null,
  lightSleepMinutes: null,
  remSleepMinutes: null,
  awakeSleepMinutes: null,
  distance: null,
  hrv: null,
  stress: null,
  workoutType: null,
  workoutDuration: null,
  source: null,
  statusText: 'Not connected',
};

const getInitialProfiles = () => {
  const loggedInUser = getStoredUser();
  const parentName = loggedInUser?.fullName || 'Account Owner';

  return [
    {
      id: 'profile_owner',
      userId: loggedInUser?.id || null,
      name: parentName,
      role: 'Account Owner',
      isPrimary: true,
      avatar: null,
      initials: parentName.slice(0, 2).toUpperCase(),
      metrics: { ...EMPTY_INITIAL_METRICS },
      battery: null,
      online: false,
    },
  ];
};

export function ProfileProvider({ children }) {
  const [profiles, setProfiles] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(STORAGE_PROFILES_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const cleanProfiles = parsed.filter(
              (p) => p.id !== 'profile_2' && p.name !== 'Ananya' && !p.avatar?.includes('unsplash')
            );
            if (cleanProfiles.length > 0) return cleanProfiles;
          }
        }
      } catch (e) {}
    }
    return getInitialProfiles();
  });

  const [activeProfileId, setActiveProfileId] = useState(() => {
    return 'profile_owner';
  });

  // Global band connection state
  const [isBandConnected, setBandConnected] = useState(false);

  // Low HR alert state tracking
  const lowHrAlertSentRef = useRef(false);
  const lastAlertTimeRef = useRef(0);

  // Helper to check and trigger low HR alert
  const checkLowHeartRate = useCallback((heartRate) => {
    if (typeof heartRate === 'number' && heartRate > 0) {
      if (heartRate <= LOW_HR_THRESHOLD) {
        const now = Date.now();
        if (!lowHrAlertSentRef.current || (now - lastAlertTimeRef.current > LOW_HR_ALERT_COOLDOWN_MS)) {
          lowHrAlertSentRef.current = true;
          lastAlertTimeRef.current = now;
          sendLowHrAlertApi(heartRate).catch(e => console.log('Failed to send low HR alert:', e));
        }
      } else {
        lowHrAlertSentRef.current = false;
      }
    }
  }, []);

  // In-app toast state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success', // 'success' | 'info' | 'error'
  });

  // Modern custom modal state
  const [modal, setModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success', // 'success' | 'info' | 'error'
    confirmText: 'OK',
    onConfirm: null,
  });

  const showToast = (message, type = 'success') => {
    setToast({
      visible: true,
      message,
      type,
    });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  const showModal = ({ title, message, type = 'success', confirmText = 'OK', onConfirm = null }) => {
    setModal({
      visible: true,
      title: title || 'Notification',
      message: message || '',
      type,
      confirmText,
      onConfirm,
    });
  };

  const hideModal = () => {
    setModal((prev) => ({ ...prev, visible: false }));
  };

  const [lastSyncedTime, setLastSyncedTime] = useState(null);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(Platform.OS === 'android');

  // Health Connect local device state
  const [healthMetrics, setHealthMetrics] = useState({
    heartRate: null,
    steps: null,
    calories: null,
    distance: null,
    sleepMinutes: null,
    oxygenLevel: null,
    lastSynced: null,
    source: null,
  });
  const [healthStatus, setHealthStatus] = useState('idle'); // 'idle' | 'loading' | 'ready' | 'error' | 'permission_required'
  const [healthError, setHealthError] = useState(null);

  /**
   * Fetch latest health telemetry for owner from backend
   */
  const refreshHealthData = useCallback(async () => {
    try {
      const res = await getLatestHealthApi();
      if (res?.success && res.data) {
        const d = res.data;
        if (d.syncedAt || d.recordedAt) {
          setLastSyncedTime(new Date(d.syncedAt || d.recordedAt));
        }
        if (Platform.OS === 'web') {
          setIsBluetoothConnected(false);
        } else if (d.bluetoothConnected !== undefined) {
          setIsBluetoothConnected(Boolean(d.bluetoothConnected));
        }
        setProfiles((prev) =>
          prev.map((p) => {
            if (p.isPrimary) {
              return {
                ...p,
                battery: d.battery !== null && d.battery !== undefined ? d.battery : null,
                metrics: {
                  calories: d.calories !== null && d.calories !== undefined ? d.calories : null,
                  caloriesGoal: 500,
                  exerciseMins: d.exerciseMins !== null && d.exerciseMins !== undefined ? d.exerciseMins : null,
                  exerciseGoal: 30,
                  walkingHours: d.walkingHours !== null && d.walkingHours !== undefined ? d.walkingHours : null,
                  walkingGoal: 12,
                  steps: d.steps !== null && d.steps !== undefined ? d.steps : null,
                  heartRate: d.heartRate || null,
                  restingHeartRate: d.restingHeartRate || null,
                  oxygen: d.oxygenLevel || null,
                  sleepDuration: d.sleepDuration || null,
                  deepSleepMinutes: d.deepSleepMinutes || null,
                  lightSleepMinutes: d.lightSleepMinutes || null,
                  remSleepMinutes: d.remSleepMinutes || null,
                  awakeSleepMinutes: d.awakeSleepMinutes || null,
                  distance: d.distance || null,
                  hrv: d.hrv || null,
                  stress: d.stress || null,
                  workoutType: d.workoutType || null,
                  workoutDuration: d.workoutDuration || null,
                  source: d.source || 'Bluetooth Band',
                  statusText: d.statusText || (d.bluetoothConnected === false ? 'Bluetooth Disconnected' : 'Connected'),
                  bluetoothConnected: d.bluetoothConnected !== false,
                  minutesElapsed: d.minutesElapsed || 0,
                },
              };
            }
            return p;
          })
        );
        checkLowHeartRate(d.heartRate);
      }
    } catch (e) {
      console.log('Error loading health data:', e);
    }
  }, []);

  /**
   * Toggle Bluetooth state and communicate to backend
   */
  const toggleBluetooth = async (desiredState) => {
    try {
      const nextState = desiredState !== undefined ? Boolean(desiredState) : !isBluetoothConnected;
      setIsBluetoothConnected(nextState);
      const res = await setBluetoothStatusApi(nextState);
      if (res?.success) {
        showToast(
          nextState
            ? 'Bluetooth connected • Telemetry active'
            : 'Bluetooth disconnected • Data calculation stopped',
          nextState ? 'success' : 'info'
        );
      }
      await refreshHealthData();
      return { success: true, isConnected: nextState };
    } catch (e) {
      console.warn('toggleBluetooth error:', e);
      return { success: false, error: e.message };
    }
  };

  /**
   * Fetch family circle members from backend database
   */
  const refreshFamily = useCallback(async () => {
    try {
      const res = await getFamilyApi();
      if (res?.success && Array.isArray(res.data)) {
        const stored = getStoredUser();
        const currentUserId = stored?.id;

        const familyProfiles = res.data.map((c) => {
          const isParent = c.parentId === currentUserId;
          const otherUser = isParent ? c.child : c.parent;
          const memberName = otherUser?.fullName || c.familyName || 'Family Member';
          const memberRole =
            c.status === 'pending'
              ? 'Pending Invite'
              : otherUser?.accountType === 'child'
              ? 'Child'
              : 'Family';

          const h = c.latestHealth;

          return {
            id: `family_${c.id}`,
            memberUserId: otherUser?.id || null,
            name: memberName,
            role: memberRole,
            isPrimary: false,
            avatar: null,
            initials: memberName.slice(0, 2).toUpperCase(),
            lastSynced: h?.syncedAt || h?.recordedAt || null,
            metrics: h
              ? {
                  calories: (h.calories !== null && h.calories !== undefined) ? h.calories : null,
                  caloriesGoal: 500,
                  exerciseMins: (h.exerciseMins !== null && h.exerciseMins !== undefined) ? h.exerciseMins : null,
                  exerciseGoal: 30,
                  walkingHours: (h.walkingHours !== null && h.walkingHours !== undefined) ? h.walkingHours : null,
                  walkingGoal: 12,
                  steps: (h.steps !== null && h.steps !== undefined) ? h.steps : null,
                  heartRate: h.heartRate || null,
                  oxygen: h.oxygenLevel || null,
                  sleepDuration: h.sleepDuration || null,
                  bodyAge: null,
                  statusText: h.statusText || 'In Target Zone',
                  source: h.source || 'Bluetooth Band',
                  lastSynced: h.syncedAt || h.recordedAt || null,
                }
              : { ...EMPTY_INITIAL_METRICS, source: 'Bluetooth Band' },
            battery: (h?.battery !== null && h?.battery !== undefined) ? h.battery : null,
            online: c.status === 'accepted',
            inviteCode: c.inviteCode,
            status: c.status,
            isAuthorized: Boolean(c.isAuthorizedToView),
          };
        });

        setProfiles((prev) => {
          const primary = prev.find((p) => p.isPrimary) || getInitialProfiles()[0];
          return [primary, ...familyProfiles];
        });
      }
    } catch (e) {
      console.log('Error loading family:', e);
    }
  }, []);

  /**
   * Synchronize real telemetry to backend database
   */
  const syncHealthTelemetry = async (telemetryData) => {
    try {
      const res = await syncHealthDataApi(telemetryData);
      if (res?.success && res.data) {
        const d = res.data;
        if (d.syncedAt || d.recordedAt) {
          setLastSyncedTime(new Date(d.syncedAt || d.recordedAt));
        }
        setProfiles((prev) =>
          prev.map((p) => {
            if (p.isPrimary) {
              return {
                ...p,
                battery: d.battery !== null && d.battery !== undefined ? d.battery : p.battery,
                metrics: {
                  calories: d.calories !== null && d.calories !== undefined ? d.calories : 0,
                  caloriesGoal: 500,
                  exerciseMins: d.exerciseMins !== null && d.exerciseMins !== undefined ? d.exerciseMins : 0,
                  exerciseGoal: 30,
                  walkingHours: d.walkingHours !== null && d.walkingHours !== undefined ? d.walkingHours : 0,
                  walkingGoal: 12,
                  steps: d.steps !== null && d.steps !== undefined ? d.steps : 0,
                  heartRate: d.heartRate || null,
                  restingHeartRate: d.restingHeartRate || null,
                  oxygen: d.oxygenLevel || null,
                  sleepDuration: d.sleepDuration || null,
                  deepSleepMinutes: d.deepSleepMinutes || null,
                  lightSleepMinutes: d.lightSleepMinutes || null,
                  remSleepMinutes: d.remSleepMinutes || null,
                  awakeSleepMinutes: d.awakeSleepMinutes || null,
                  distance: d.distance || null,
                  hrv: d.hrv || null,
                  stress: d.stress || null,
                  workoutType: d.workoutType || null,
                  workoutDuration: d.workoutDuration || null,
                  source: d.source || 'Bluetooth Band',
                  statusText: d.statusText || 'Synchronized',
                },
              };
            }
            return p;
          })
        );
        checkLowHeartRate(d.heartRate);
        return { success: true, data: d };
      }
      return { success: false };
    } catch (e) {
      throw e;
    }
  };

  /**
   * Fetch on-device health data directly from Health Connect without duplicating fetch logic.
   * Safe execution: catches errors internally and resolves cleanly without throwing.
   */
  const refreshDeviceHealth = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setHealthStatus('idle');
      return { success: false, reason: 'Health Connect is Android only' };
    }

    setHealthStatus('loading');
    setHealthError(null);

    try {
      // 1. Non-intrusive check: verify granted permissions without triggering dialog
      let perms = await checkGrantedPermissionsOnly();

      // If permissions not yet granted, attempt setupHealthConnect (which can prompt)
      if (!perms.ok || !perms.hasHeartRate) {
        const setup = await setupHealthConnect();
        if (!setup.ok) {
          setHealthStatus('permission_required');
          setHealthError(setup.reason || 'Health permissions required');
          return { success: false, status: 'permission_required' };
        }
      }

      // 2. Read live on-device records from Health Connect
      const result = await readHealthData();
      const raw = result?.data || {};

      const stepsList = raw.steps || [];
      const totalSteps = stepsList.reduce((sum, r) => sum + (r.count || 0), 0);

      const caloriesList = raw.totalCalories || [];
      const totalCal = caloriesList.reduce(
        (sum, r) => sum + (r.energy?.inKilocalories || r.energy?.value || 0),
        0
      );

      const distList = raw.distance || [];
      const totalDistMeters = distList.reduce(
        (sum, r) => sum + (r.distance?.inMeters || r.distance?.value || 0),
        0
      );
      const distanceKm =
        totalDistMeters > 0 ? Math.round((totalDistMeters / 1000) * 100) / 100 : null;

      // Extract latest heart rate from records or samples
      const hrList = raw.heartRate || [];
      const allHrSamples = [];
      for (const record of hrList) {
        if (Array.isArray(record.samples)) {
          for (const sample of record.samples) {
            if (sample && typeof sample.beatsPerMinute === 'number') {
              allHrSamples.push({
                bpm: Math.round(sample.beatsPerMinute),
                time: sample.time || record.startTime || record.endTime,
              });
            }
          }
        } else if (typeof record.beatsPerMinute === 'number') {
          allHrSamples.push({
            bpm: Math.round(record.beatsPerMinute),
            time: record.startTime || record.endTime,
          });
        }
      }
      allHrSamples.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      const latestHr = allHrSamples.length > 0 ? allHrSamples[allHrSamples.length - 1].bpm : null;

      // Compute sleep minutes from SleepSession records
      const sleepList = raw.sleep || [];
      const totalSleepMins = sleepList.reduce((total, s) => {
        if (s.startTime && s.endTime) {
          const start = new Date(s.startTime).getTime();
          const end = new Date(s.endTime).getTime();
          const diff = Math.max(0, Math.round((end - start) / (1000 * 60)));
          return total + diff;
        }
        return total;
      }, 0);

      // Extract latest blood oxygen (SpO2)
      const oxygenList = raw.oxygenSaturation || [];
      let latestOxygen = null;
      if (oxygenList.length > 0) {
        const lastOx = oxygenList[oxygenList.length - 1];
        if (typeof lastOx.percentage === 'number') {
          latestOxygen = Math.round(lastOx.percentage);
        }
      }

      const syncDate = new Date();
      const mapped = {
        heartRate: latestHr,
        steps: totalSteps,
        calories: Math.round(totalCal),
        distance: distanceKm,
        sleepMinutes: totalSleepMins > 0 ? totalSleepMins : null,
        oxygenLevel: latestOxygen,
        lastSynced: syncDate,
        source: 'Bluetooth Band',
      };

      setHealthMetrics(mapped);
      setHealthStatus('ready');
      setHealthError(null);
      setLastSyncedTime(syncDate);

      return { success: true, metrics: mapped };
    } catch (err) {
      console.warn('[ProfileContext] refreshDeviceHealth error:', err);
      setHealthStatus('error');
      setHealthError(err?.message || 'Failed to read device health');
      return { success: false, error: err?.message };
    }
  }, []);

  /**
   * Orchestrate full real synchronization from device/Health Connect
   */
  const syncHealthData = async () => {
    try {
      const res = await syncAllHealthData();
      if (res?.success) {
        if (res.lastSynced) {
          setLastSyncedTime(new Date(res.lastSynced));
        }
        await refreshHealthData();
      }
      return res;
    } catch (err) {
      console.warn('[ProfileContext] syncHealthData error:', err);
      return { success: false, error: err.message };
    }
  };

  // Initial load of real backend health data, family connections, and device health
  useEffect(() => {
    refreshHealthData();
    refreshFamily();
    // Register push token for cross-device notifications
    const registerPushToken = async () => {
      try {
        const token = await getExpoPushToken();
        if (token) {
          await registerPushTokenApi(token);
        }
      } catch (e) {
        console.log('Failed to register push token:', e);
      }
    };
    registerPushToken();

    if (Platform.OS === 'android') {
      refreshDeviceHealth();
    }
  }, [refreshHealthData, refreshFamily, refreshDeviceHealth]);

  // Sync profiles to localStorage on Web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(profiles));
      } catch (e) {}
    }
  }, [profiles]);

  // Switch active profile
  const switchProfile = async (profileId) => {
    const target = profiles.find((p) => p.id === profileId);
    if (target) {
      setActiveProfileId(profileId);
      showToast(`Viewing ${target.name}'s Activity`, 'info');

      // If family member, fetch latest health data from backend
      if (!target.isPrimary && target.memberUserId) {
        try {
          const res = await getFamilyMemberHealthApi(target.memberUserId);
          if (res?.success && res.data) {
            const h = res.data;
            setProfiles((prev) =>
              prev.map((p) => {
                if (p.id === profileId) {
                  return {
                    ...p,
                    battery: h.battery || p.battery,
                    metrics: {
                      calories: h.calories || 0,
                      caloriesGoal: 500,
                      exerciseMins: h.exerciseMins || 0,
                      exerciseGoal: 30,
                      walkingHours: h.walkingHours || 0,
                      walkingGoal: 12,
                      steps: h.steps || 0,
                      heartRate: h.heartRate || null,
                      oxygen: h.oxygenLevel || null,
                      sleepDuration: h.sleepDuration || null,
                      bodyAge: null,
                      statusText: h.statusText || 'In Target Zone',
                    },
                  };
                }
                return p;
              })
            );
          }
        } catch (e) {}
      }
    }
  };

  // Add newly invited/joined family profile
  const addFamilyMemberProfile = (name, role = 'Member') => {
    refreshFamily();
  };

  // Remove a family member profile
  const removeFamilyMemberProfile = async (profileId) => {
    // profileId looks like "family_<connectionId>"
    const connectionId = profileId.replace('family_', '');
    try {
      await removeFamilyMemberApi(connectionId);
    } catch (e) {
      console.log('Error removing family member from backend:', e);
    }
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));
    if (activeProfileId === profileId) {
      const remaining = profiles.filter((p) => p.id !== profileId);
      setActiveProfileId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const activeProfile =
    profiles.find((p) => p.id === activeProfileId) || profiles[0] || getInitialProfiles()[0];

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        activeProfileId,
        switchProfile,
        addFamilyMemberProfile,
        removeFamilyMemberProfile,
        refreshHealthData,
        refreshDeviceHealth,
        healthMetrics,
        healthStatus,
        healthError,
        refreshFamily,
        syncHealthTelemetry,
        syncHealthData,
        lastSyncedTime,
        isBluetoothConnected,
        toggleBluetooth,
        toast,
        showToast,
        hideToast,
        modal,
        showModal,
        hideModal,
        isBandConnected,
        setBandConnected,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

