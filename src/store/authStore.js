import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAccessToken } from '../services/api';

const DEFAULT_USER = {
  name: 'Aarav Shah',
  customerId: 'NV-48211',
  email: 'aarav.shah@example.com',
  role: 'user',
  phone: '+91 98765 43421',
  phoneMasked: '+91 98••• ••421',
  kycStatus: 'verified',
  activeLoans: 1,
  onTimeRate: 100,
  creditScore: 782,
  preferences: {
    darkMode: true,
    notifications: true,
    loginAlerts: true,
  },
};

let listeners = [];
let state = { user: null, isAuthenticated: false, isHydrated: false };

// Load persisted state asynchronously at startup
Promise.all([
  AsyncStorage.getItem('nova_user'),
  AsyncStorage.getItem('nova_access_token'),
]).then(([userJson, token]) => {
  if (token) {
    setAccessToken(token);
  }
  if (userJson) {
    try {
      const parsedUser = JSON.parse(userJson);
      state = { user: parsedUser, isAuthenticated: true, isHydrated: true };
      notify();
    } catch (_) {
      state = { ...state, isHydrated: true };
      notify();
    }
  } else {
    state = { ...state, isHydrated: true };
    notify();
  }
});

const notify = () => {
  listeners.forEach((listener) => listener(state));
};

export const authStore = {
  getState() {
    return state;
  },
  subscribe(listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  updateUser(updates) {
    state = { ...state, user: { ...state.user, ...updates } };
    AsyncStorage.setItem('nova_user', JSON.stringify(state.user));
    notify();
  },
  updatePreferences(prefUpdates) {
    state = {
      ...state,
      user: {
        ...state.user,
        preferences: { ...state.user.preferences, ...prefUpdates },
      },
    };
    AsyncStorage.setItem('nova_user', JSON.stringify(state.user));
    notify();
  },
  logout() {
    state = { user: null, isAuthenticated: false };
    AsyncStorage.removeItem('nova_user');
    notify();
  },
  login(userData) {
    if (userData) {
      this.setUser(userData);
    } else {
      state = { user: DEFAULT_USER, isAuthenticated: true };
      AsyncStorage.setItem('nova_user', JSON.stringify(DEFAULT_USER));
      notify();
    }
  },
  // Called after a successful real API login or demo login with user data
  setUser(userData) {
    const isSuperAdmin = userData?.role?.toLowerCase() === 'superadmin';
    const normalizedRole = isSuperAdmin ? 'superadmin' : (userData?.role?.toLowerCase() || 'user');
    const baseUser = isSuperAdmin ? {} : DEFAULT_USER;
    const finalUser = {
      ...baseUser,
      ...userData,
      role: normalizedRole,
    };
    state = { user: finalUser, isAuthenticated: true };
    AsyncStorage.setItem('nova_user', JSON.stringify(finalUser));
    notify();
  },
};
