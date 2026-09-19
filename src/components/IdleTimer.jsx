import React, { useEffect, useRef } from 'react';
import { View, PanResponder, Platform } from 'react-native';
import { authStore } from '../store/authStore';
import { authService } from '../services/authService';

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export default function IdleTimer({ children }) {
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (authStore.getState().isAuthenticated) {
      timerRef.current = setTimeout(() => {
        handleLogout();
      }, IDLE_TIMEOUT);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Auto logout failed:', error);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        resetTimer();
        return false;
      },
      onMoveShouldSetPanResponderCapture: () => {
        resetTimer();
        return false;
      },
    })
  ).current;

  useEffect(() => {
    const unsubscribe = authStore.subscribe((state) => {
      if (state.isAuthenticated) {
        resetTimer();
      } else {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
    });

    if (authStore.getState().isAuthenticated) {
      resetTimer();
    }

    if (Platform.OS === 'web') {
      const webEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      const handleWebActivity = () => {
        resetTimer();
      };

      webEvents.forEach((event) => {
        window.addEventListener(event, handleWebActivity);
      });

      return () => {
        unsubscribe();
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        webEvents.forEach((event) => {
          window.removeEventListener(event, handleWebActivity);
        });
      };
    }

    return () => {
      unsubscribe();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}
