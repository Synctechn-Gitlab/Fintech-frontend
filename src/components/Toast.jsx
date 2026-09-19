import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const variantConfig = {
  success: {
    border: '#36e436ff',
    text: '#36e436ff',
    icon: 'checkmark-circle',
  },
  delete: {
    border: '#ef4444',
    text: '#ef4444',
    icon: 'trash',
  },
  error: {
    border: '#ef4444',
    text: '#ef4444',
    icon: 'alert-circle',
  },
  warning: {
    border: '#fbbf24',
    text: '#fbbf24',
    icon: 'warning',
  },
  info: {
    border: '#3b82f6',
    text: '#3b82f6',
    icon: 'information-circle',
  },
};

export const ToastItem = ({ toast, onRemove }) => {
  const config = variantConfig[toast.type] || variantConfig.info;

  const animX = useRef(new Animated.Value(300)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(animX, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(animOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onRemove(toast.id);
    });
  }, [toast.id, onRemove]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      handleClose();
    }, 4000);
  }, [handleClose]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(animOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    startTimer();

    return () => stopTimer();
  }, [startTimer, stopTimer]);

  return (
    <Animated.View
      style={[
        styles.toastCard,
        {
          opacity: animOpacity,
          transform: [{ translateX: animX }],
          borderColor: config.border,
        },
      ]}
    >
      <Pressable
        onHoverIn={stopTimer}
        onHoverOut={startTimer}
        style={styles.pressableArea}
      >
        {/* Left Icon Container */}
        <View style={[styles.iconContainer, { backgroundColor: `${config.border}15` }]}>
          <Ionicons name={config.icon} size={20} color={config.text} />
        </View>

        {/* Content Block */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: config.text }]}>{toast.title}</Text>
          <Text style={styles.message}>{toast.message}</Text>
          <Text style={styles.timestamp}>{toast.timestamp}</Text>
        </View>

        {/* Close Button */}
        <Pressable onPress={handleClose} style={styles.closeBtn}>
          <Ionicons name="close" size={16} color="#64748b" />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastCard: {
    width: 320,
    backgroundColor: '#151515',
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  pressableArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  message: {
    fontSize: 12,
    color: '#ffffff',
    marginTop: 3,
    lineHeight: 16,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 2,
    marginLeft: 4,
  },
});

export default ToastItem;
