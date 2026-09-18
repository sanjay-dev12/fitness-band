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
} from '../services/api';
import { syncAllHealthData } from '../modules/health/health.service';
import { LOW_HR_THRESHOLD, LOW_HR_ALERT_COOLDOWN_MS } from '../services/healthConstants';
import { getExpoPushToken } from '../services/notificationService';
import { useRef } from 'react';

const ProfileContext = createContext(null);

const STORAGE_PROFILES_KEY = 'handband_family_profiles';
const STORAGE_ACTIVE_ID_KEY = 'handband_active_profile_id';

// Real empty/baseline metrics - zero hardcoded mock values
export const BASELINE_METRICS = {
  calories: 0,
  caloriesGoal: 500,
  exerciseMins: 0,
  exerciseGoal: 30,
  walkingHours: 0,
  walkingGoal: 12,
  steps: 0,
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
  statusText: 'Connected',
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
      metrics: { ...BASELINE_METRICS },
      battery: 98,
      online: true,
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
                  source: d.source || 'Health Connect',
                  statusText: d.statusText || 'Connected',
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
            metrics: h
              ? {
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
                }
              : { ...BASELINE_METRICS },
            battery: h?.battery || 90,
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
                  source: d.source || 'Health Connect',
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

  // Initial load of real backend health data and family connections
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
  }, [refreshHealthData, refreshFamily]);

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
        refreshFamily,
        syncHealthTelemetry,
        syncHealthData,
        lastSyncedTime,
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
