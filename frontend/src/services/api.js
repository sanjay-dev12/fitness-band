import { Platform } from 'react-native';
import Constants from 'expo-constants';

const TOKEN_KEY = 'handband_auth_token';
const USER_KEY = 'handband_user';

// In-memory and persisted token storage
let authToken = null;
if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
  try {
    authToken = window.localStorage.getItem(TOKEN_KEY) || null;
  } catch (e) {}
}

export function setAuthToken(token) {
  authToken = token;
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      if (token) {
        window.localStorage.setItem(TOKEN_KEY, token);
      } else {
        window.localStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {}
  }
}

export function getAuthToken() {
  if (!authToken && Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      authToken = window.localStorage.getItem(TOKEN_KEY) || null;
    } catch (e) {}
  }
  return authToken;
}

export function setStoredUser(user) {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      if (user) {
        window.localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(USER_KEY);
      }
    } catch (e) {}
  }
}

export function getStoredUser() {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      const data = window.localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }
  return null;
}

// Dynamically determine the backend server IP address
const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }

  // Extract host IP from Expo Metro bundler
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || '';
  const ip = hostUri.split(':')[0];

  if (ip) {
    return `http://${ip}:5000/api`;
  }

  // Fallback to local machine IP
  return 'http://10.72.97.243:5000/api';
};

export const API_BASE_URL = getBaseUrl();
console.log('📡 API Base URL configured:', API_BASE_URL);

/**
 * Fetch helper with timeout
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const activeToken = getAuthToken();
  if (activeToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Server request timed out (${timeoutMs / 1000}s). Make sure backend is running at ${API_BASE_URL}`);
    }
    throw error;
  }
}

/**
 * Login user via API
 * @param {Object} credentials - { identifier, password }
 */
export async function loginUser(credentials) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed. Please check your credentials.');
    }

    if (data?.data?.token) {
      setAuthToken(data.data.token);
    }
    if (data?.data?.user) {
      setStoredUser(data.data.user);
    }
    return data;
  } catch (error) {
    throw new Error(error.message || `Unable to connect to server at ${API_BASE_URL}.`);
  }
}

/**
 * Authenticate with Google ID token via backend API
 * @param {string} idToken
 */
export async function googleLoginApi(idToken) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Google login failed. Please try again.');
    }

    if (data?.data?.token) {
      setAuthToken(data.data.token);
    }
    if (data?.data?.user) {
      setStoredUser(data.data.user);
    }
    return data;
  } catch (error) {
    throw new Error(error.message || `Unable to connect to server at ${API_BASE_URL}.`);
  }
}

/**
 * Register user via API
 * @param {Object} userData - { fullName, identifier, password, accountType }
 */
export async function registerUser(userData) {
  try {
    const payload = {
      fullName: userData.fullName,
      identifier: userData.identifier,
      password: userData.password,
      accountType: userData.accountType || 'parent',
    };

    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed. Please try again.');
    }

    if (data?.data?.token) {
      setAuthToken(data.data.token);
    }
    if (data?.data?.user) {
      setStoredUser(data.data.user);
    }
    return data;
  } catch (error) {
    throw new Error(error.message || `Unable to connect to server at ${API_BASE_URL}.`);
  }
}

/**
 * Create Family Circle with generated invitation code
 */
export async function createFamilyApi(familyName, tokenOverride) {
  try {
    const headers = {};
    if (tokenOverride) {
      headers['Authorization'] = `Bearer ${tokenOverride}`;
    }

    const response = await fetchWithTimeout(`${API_BASE_URL}/family/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ familyName }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create family.');
    }
    return data;
  } catch (error) {
    throw new Error(error.message || 'Network error creating family.');
  }
}

/**
 * Join Family Circle by Invitation Code
 */
export async function joinFamilyByCodeApi(inviteCode, tokenOverride) {
  try {
    const headers = {};
    if (tokenOverride) {
      headers['Authorization'] = `Bearer ${tokenOverride}`;
    }

    const response = await fetchWithTimeout(`${API_BASE_URL}/family/join`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ inviteCode }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Invalid invitation code.');
    }
    return data;
  } catch (error) {
    throw new Error(error.message || 'Network error joining family.');
  }
}

/**
 * Fetch current authenticated user profile
 */
export async function getMeApi() {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/me`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user profile.');
    }
    if (data?.data) {
      setStoredUser(data.data);
    }
    return data;
  } catch (error) {
    console.log('getMeApi error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Update authenticated user profile
 */
export async function updateProfileApi(profileData) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile.');
    }
    if (data?.data) {
      setStoredUser(data.data);
    }
    return data;
  } catch (error) {
    throw new Error(error.message || 'Error updating profile.');
  }
}

/**
 * Fetch latest health telemetry for current user
 */
export async function getLatestHealthApi() {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/health/latest`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch latest health data.');
    }
    return data;
  } catch (error) {
    console.log('getLatestHealthApi error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Synchronize health telemetry with backend database
 * @param {Object} telemetryData - { heartRate, oxygenLevel, steps, calories, exerciseMins, walkingHours, battery, sleepDuration, statusText }
 */
export async function syncHealthDataApi(telemetryData) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/health/sync`, {
      method: 'POST',
      body: JSON.stringify(telemetryData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to sync health telemetry.');
    }
    return data;
  } catch (error) {
    throw new Error(error.message || 'Network error synchronizing telemetry.');
  }
}

/**
 * Fetch health telemetry history
 */
export async function getHealthHistoryApi(days = 7) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/health/history?days=${days}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch health history.');
    }
    return data;
  } catch (error) {
    console.log('getHealthHistoryApi error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch all family circle connections
 */
export async function getFamilyApi() {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/family`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch family members.');
    }
    return data;
  } catch (error) {
    console.log('getFamilyApi error:', error.message);
    return { success: false, data: [] };
  }
}

/**
 * Fetch a specific family member's health telemetry
 */
export async function getFamilyMemberHealthApi(memberId) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/health/family/${memberId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch family member health.');
    }
    return data;
  } catch (error) {
    console.log('getFamilyMemberHealthApi error:', error.message);
    return { success: false, error: error.message };
  }
}

