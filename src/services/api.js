import { Platform } from 'react-native';

// ─── Base URL ────────────────────────────────────────────────────────────────
// Android emulator: 10.0.2.2 maps to host machine's localhost
// iOS simulator / web: localhost works directly
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_ANDROID_API_URL || 'http://10.0.2.2:5000/api/v1';
  }
  return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
};

export const BASE_URL = getBaseUrl();

// ─── Token storage (in-memory; replaced by AsyncStorage on login) ────────────
let _accessToken = null;

export const setAccessToken = (token) => { _accessToken = token; };
export const getAccessToken = () => _accessToken;
export const clearAccessToken = () => { _accessToken = null; };

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (_accessToken) {
    headers['Authorization'] = `Bearer ${_accessToken}`;
  }

  const config = {
    method: options.method || 'GET',
    headers,
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'API request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};
