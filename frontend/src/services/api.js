import { Platform } from 'react-native';
import Constants from 'expo-constants';

// In-memory token storage for active session
let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
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

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
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
