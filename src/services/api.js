import { Platform } from 'react-native';

// ─── Base URL ────────────────────────────────────────────────────────────────
const getBaseUrl = () => {
  // If running on Web in production (Vercel), use relative path to utilize the vercel.json proxy rewrite
  if (Platform.OS === 'web' && process.env.NODE_ENV === 'production') {
    return '/api/v1';
  }

  let baseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://fintech-backend-s12u.onrender.com';
  
  if (baseUrl.endsWith('/api/v1')) return baseUrl;
  
  baseUrl = baseUrl.replace(/\/$/, '');
  return `${baseUrl}/api/v1`;
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
