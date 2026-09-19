import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import AppNavigator from './src/navigation/AppNavigator';
import { restoreSession } from './src/services/authService';
import IdleTimer from './src/components/IdleTimer';

export default function App() {
  useEffect(() => {
    // Restore the JWT access token from AsyncStorage into memory on app launch.
    // Without this, protected API calls fail with 401 after a reload.
    restoreSession();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <IdleTimer>
            <StatusBar style="light" />
            <AppNavigator />
          </IdleTimer>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
