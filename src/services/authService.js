import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, setAccessToken, clearAccessToken } from './api';
import { authStore } from '../store/authStore';

const TOKEN_KEY = 'nova_access_token';
const REFRESH_KEY = 'nova_refresh_token';

// ─── Restore session on app launch ───────────────────────────────────────────
export const restoreSession = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      setAccessToken(token);
    }
  } catch (_) {}
};

// ─── Auth service ─────────────────────────────────────────────────────────────
export const authService = {
  login: async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    // Persist tokens
    setAccessToken(data.accessToken);
    await AsyncStorage.setItem(TOKEN_KEY, data.accessToken);
    await AsyncStorage.setItem(REFRESH_KEY, data.refreshToken);

    // Sync local store with real user data from backend
    authStore.setUser(data.user);
    return data.user;
  },

  signup: async (name, email, phone, password) => {
    const data = await apiRequest('/auth/signup', {
      method: 'POST',
      body: { name, email, phone, password },
    });

    return data;
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (_) {
      // always clear local session even if request fails
    } finally {
      clearAccessToken();
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_KEY);
      authStore.logout();
    }
  },

  forgotPassword: async (email) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },

  verifyEmail: async (email, otp) => {
    return apiRequest('/auth/verify-email', {
      method: 'POST',
      body: { email, otp },
    });
  },

  resendVerificationOtp: async (email) => {
    return apiRequest('/auth/resend-verification-otp', {
      method: 'POST',
      body: { email },
    });
  },

  resetPassword: async (email, otp, newPassword) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: { email, otp, newPassword },
    });
  },

  updateProfile: async (updates) => {
    const data = await apiRequest('/profile', {
      method: 'PUT',
      body: updates,
    });
    authStore.updateUser(data.data);
    return data.data;
  },

  updatePreferences: async (prefs) => {
    const data = await apiRequest('/profile/preferences', {
      method: 'PATCH',
      body: prefs,
    });
    authStore.updatePreferences(data.preferences);
    return data.preferences;
  },

  getProfile: async () => {
    const data = await apiRequest('/profile');
    authStore.setUser(data.data);
    return data.data;
  },
};
