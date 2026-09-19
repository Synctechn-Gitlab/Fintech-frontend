import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import ToastItem from '../components/Toast';

const ToastContext = createContext(null);

const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </View>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    setToasts((prev) => [...prev, { id, type, title, message, timestamp }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showSuccessToast = useCallback((title, message) => {
    addToast('success', title, message);
  }, [addToast]);

  const showDeleteToast = useCallback((title, message) => {
    addToast('delete', title, message);
  }, [addToast]);

  const showErrorToast = useCallback((title, message) => {
    addToast('error', title, message);
  }, [addToast]);

  const showWarningToast = useCallback((title, message) => {
    addToast('warning', title, message);
  }, [addToast]);

  const showInfoToast = useCallback((title, message) => {
    addToast('info', title, message);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ showSuccessToast, showDeleteToast, showErrorToast, showWarningToast, showInfoToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    right: 24,
    zIndex: 99999,
    pointerEvents: 'box-none',
  },
});
