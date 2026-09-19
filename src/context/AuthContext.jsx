import React, { createContext, useContext, useState, useEffect } from 'react';
import { authStore } from '../store/authStore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => authStore.getState());

  useEffect(() => {
    const unsubscribe = authStore.subscribe((newState) => {
      setAuthState(newState);
    });
    return unsubscribe;
  }, []);

  const updateUser = (updates) => authStore.updateUser(updates);
  const updatePreferences = (prefUpdates) => authStore.updatePreferences(prefUpdates);
  const logout = () => authStore.logout();
  const login = () => authStore.login();

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        updateUser,
        updatePreferences,
        logout,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
