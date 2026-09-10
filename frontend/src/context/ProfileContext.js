import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { getStoredUser } from '../services/api';

const ProfileContext = createContext(null);

const STORAGE_PROFILES_KEY = 'handband_family_profiles';
const STORAGE_ACTIVE_ID_KEY = 'handband_active_profile_id';

const DEFAULT_METRICS = {
  parent: {
    calories: 385,
    caloriesGoal: 500,
    exerciseMins: 28,
    exerciseGoal: 30,
    walkingHours: 8,
    walkingGoal: 12,
    steps: 7420,
    heartRate: 72,
    oxygen: 98,
    sleepDuration: '7h 20m',
    bodyAge: 29,
    statusText: 'In Target Zone',
  },
  child: {
    calories: 460,
    caloriesGoal: 400,
    exerciseMins: 45,
    exerciseGoal: 30,
    walkingHours: 10,
    walkingGoal: 12,
    steps: 10840,
    heartRate: 86,
    oxygen: 99,
    sleepDuration: '8h 45m',
    bodyAge: 12,
    statusText: 'Highly Active',
  },
};

const getInitialProfiles = () => {
  const loggedInUser = getStoredUser();
  const parentName = loggedInUser?.fullName || 'Sanjay';

  return [
    {
      id: 'profile_1',
      name: parentName,
      role: 'Parent',
      isPrimary: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      initials: parentName.slice(0, 2).toUpperCase(),
      metrics: DEFAULT_METRICS.parent,
      battery: 88,
      online: true,
    },
    {
      id: 'profile_2',
      name: 'Ananya',
      role: 'Daughter',
      isPrimary: false,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      initials: 'AN',
      metrics: DEFAULT_METRICS.child,
      battery: 94,
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
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return getInitialProfiles();
  });

  const [activeProfileId, setActiveProfileId] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        const savedId = window.localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
        if (savedId) return savedId;
      } catch (e) {}
    }
    return 'profile_1';
  });

  // In-app toast state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success', // 'success' | 'info' | 'error'
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

  // Sync profiles to localStorage on Web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(profiles));
      } catch (e) {}
    }
  }, [profiles]);

  // Sync activeProfileId to localStorage on Web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_ACTIVE_ID_KEY, activeProfileId);
      } catch (e) {}
    }
  }, [activeProfileId]);

  // Switch active profile
  const switchProfile = (profileId) => {
    const target = profiles.find((p) => p.id === profileId);
    if (target) {
      setActiveProfileId(profileId);
      showToast(`Switched to ${target.name}'s Activity 📊`, 'info');
    }
  };

  // Add or attach family profile
  const addFamilyMemberProfile = (name, role = 'Member', customMetrics = null) => {
    const newId = `profile_${Date.now()}`;
    const newProfile = {
      id: newId,
      name: name || 'Family Member',
      role: role || 'Member',
      isPrimary: false,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      initials: (name || 'FM').slice(0, 2).toUpperCase(),
      metrics: customMetrics || DEFAULT_METRICS.child,
      battery: 92,
      online: true,
    };

    setProfiles((prev) => {
      // Don't add duplicate if name exists
      const exists = prev.some((p) => p.name.toLowerCase() === newProfile.name.toLowerCase());
      if (exists) return prev;
      return [...prev, newProfile];
    });

    return newProfile;
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
        toast,
        showToast,
        hideToast,
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
